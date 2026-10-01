"""Shift conversion regressions using only disposable SQLite databases."""
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch
from sqlalchemy import delete
from app.models import Trip, ShiftSegment, TripCategory
from app.services.shift_conversion_service import convert_pending
from app.services.shift_service import sync_shift
from app.schemas.v1.shift import ShiftSnapshot
from tests.test_shift_api import ShiftApiTests

class ShiftConversionTests(ShiftApiTests):
    def seed(self, segments=None, owner=1):
        data = self.data().model_dump()
        data['segments'] = segments or [self.segment('one')]
        return sync_shift(self.db, owner, ShiftSnapshot.model_validate(data))
    def segment(self, identity, **changes):
        return dict(client_id=identity, started_at=self.now, ended_at=self.now+timedelta(minutes=20), distance_miles=Decimal('5.25'), category='personal', platform_client_id='p1', **changes)
    def convert(self, owner=1, hours=1):
        with patch('app.services.shift_conversion_service._trip_deduction', side_effect=lambda db,c,t,d: (d*Decimal('.70')).quantize(Decimal('.01')) if c==TripCategory.BUSINESS else Decimal(0)):
            return convert_pending(self.db, owner, self.now+timedelta(hours=hours))
    def test_manual_retry_response_loss_and_deleted_trip_tombstone(self):
        self.seed([self.segment('one', save_requested=True)])
        first=self.convert(); self.assertEqual(len(first['created_trip_ids']),1)
        self.assertEqual(self.convert()['created_trip_ids'],[])
        trip=self.db.query(Trip).one(); self.assertEqual(trip.category,TripCategory.PERSONAL)
        self.assertEqual(trip.deduction_amount,0); self.assertEqual(trip.platform.value,'spark')
        self.assertIsNone(trip.start_lat)
        self.db.execute(delete(Trip).where(Trip.id==trip.id)); self.db.commit()
        self.assertEqual(self.convert(hours=48)['created_trip_ids'],[])
    def test_midnight_preserves_legacy_personal_defaults_only_unreviewed(self):
        a=self.segment('legacy')
        b=self.segment('new',reviewed=False); b['started_at']+=timedelta(hours=1); b['ended_at']+=timedelta(hours=1)
        c=self.segment('excluded',excluded=True); c['started_at']+=timedelta(hours=2); c['ended_at']+=timedelta(hours=2)
        self.seed([a,b,c])
        # 00:00 UTC is still the prior local day in New York.
        self.assertEqual(self.convert(hours=3)['created_trip_ids'],[])
        self.assertEqual(len(self.convert(hours=5)['created_trip_ids']),2)
        rows=self.db.query(Trip).order_by(Trip.start_time).all()
        self.assertEqual([t.category for t in rows],[TripCategory.PERSONAL,TripCategory.BUSINESS])
        self.assertEqual(sum(t.deduction_amount for t in rows),Decimal('3.68'))
    def test_review_required_for_manual_and_owner_isolation(self):
        self.seed([self.segment('one',reviewed=False,save_requested=True)])
        self.assertEqual(self.convert()['created_trip_ids'],[])
        self.assertEqual(self.convert(owner=2,hours=48)['created_trip_ids'],[])
        self.assertEqual(self.db.query(Trip).count(),0)
    def test_atomic_rollback_and_retry(self):
        a=self.segment('one',save_requested=True)
        b=self.segment('two',save_requested=True); b['started_at']+=timedelta(hours=1); b['ended_at']+=timedelta(hours=1)
        self.seed([a,b])
        with patch('app.services.shift_conversion_service._trip_deduction',side_effect=[Decimal(0),RuntimeError('failure')]):
            with self.assertRaises(RuntimeError): convert_pending(self.db,1,self.now+timedelta(hours=3))
        self.assertEqual(self.db.query(Trip).count(),0)
        self.assertTrue(all(s.converted_at is None for s in self.db.query(ShiftSegment)))
        self.assertEqual(len(self.convert()['created_trip_ids']),2)
    def test_saved_source_cannot_be_rewritten_by_stale_snapshot(self):
        data=self.seed([self.segment('one',save_requested=True)])
        self.convert(); data.revision+=1; data.segments[0].category=TripCategory.BUSINESS
        data.segments[0].distance_miles=Decimal(99); data.segments[0].trip_id=999
        result=sync_shift(self.db,1,data)
        self.assertEqual(result.segments[0].category,TripCategory.PERSONAL)
        self.assertEqual(result.segments[0].distance_miles,Decimal('5.25'))
        self.assertNotEqual(result.segments[0].trip_id,999)
    def test_platform_history_and_no_platform(self):
        data=self.data().model_dump(); switch=self.now+timedelta(hours=1)
        data['platform_sessions'][0]['ended_at']=switch
        data['platform_sessions'].append(dict(client_id='p2',platform='lyft',started_at=switch))
        segments=[]
        for i,platform in enumerate(('p1','p2',None)):
            s=self.segment(str(i),save_requested=True); s['started_at']+=timedelta(hours=i); s['ended_at']+=timedelta(hours=i); s['platform_client_id']=platform; segments.append(s)
        data['segments']=segments;sync_shift(self.db,1,ShiftSnapshot.model_validate(data))
        self.convert(); rows=self.db.query(Trip).order_by(Trip.start_time).all()
        self.assertEqual([t.platform.value if t.platform else None for t in rows],['spark','lyft',None])
    def test_overlapping_manual_trip_is_not_double_counted(self):
        self.seed([self.segment('one',save_requested=True)])
        self.db.add(Trip(user_id=1,start_time=self.now,end_time=self.now+timedelta(minutes=30),category=TripCategory.BUSINESS,distance_miles=5,deduction_amount=0));self.db.commit()
        result=self.convert();self.assertEqual(result['blocked_segment_ids'],['one']);self.assertEqual(self.db.query(Trip).count(),1)

    def test_reports_count_converted_business_once(self):
        from app.services.trip_service import get_daily_trip_breakdown
        item=self.segment('one',save_requested=True);item['category']='business'
        self.seed([item]);self.convert();self.convert(hours=48)
        result=get_daily_trip_breakdown(self.db,1,self.now,self.now+timedelta(days=1))
        self.assertEqual(sum(r['miles'] for r in result),Decimal('5.25'))
        self.assertEqual(sum(r['trip_count'] for r in result),1)

    def test_legacy_fingerprint_retries_after_upgrade(self):
        import hashlib,json
        from app.models import Shift
        data=self.data(segments=[self.segment('one')])
        self.seed();row=self.db.query(Shift).one()
        old=data.model_dump(mode='json')
        for segment in old['segments']:
            for key in ('reviewed','save_requested','converted_at','trip_id'):segment.pop(key)
        for field in ('segments','platform_sessions'):old[field].sort(key=lambda item:item['client_id'])
        row.sync_fingerprint=hashlib.sha256(json.dumps(old,sort_keys=True).encode()).hexdigest();self.db.commit()
        self.assertEqual(sync_shift(self.db,1,data).segments[0].category,TripCategory.PERSONAL)
