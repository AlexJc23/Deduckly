"""One owner-scoped calculation path for the new report and its server-generated exports."""
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from fastapi import HTTPException
from app.models import Trip, Expense, Income, User
from app.models.vehicle import UserVehicle
from app.models.vehicle_tax import VehicleTaxSetting
from app.services.business_mileage import rate_for, money, period_for
from app.services.report_service import CATEGORY_RULES

D=Decimal
METHODS={'standard_mileage','actual_expenses'}
def owned_vehicle(db, owner, identity, allow_deleted=False):
    vehicle=db.query(UserVehicle).filter_by(id=identity,user_id=owner).one_or_none()
    if not vehicle or (vehicle.deleted and not allow_deleted): raise HTTPException(404,'Vehicle not found')
    return vehicle

def eligibility(setting, year):
    if setting is None: return 'unknown'
    if any(getattr(setting,k,None) for k in ['section179','bonus_depreciation','accelerated_depreciation','fleet']): return 'restricted'
    if setting.ownership=='leased' and setting.prior_method=='actual_expenses': return 'restricted'
    if setting.first_business_year and setting.first_business_year < year and setting.first_method=='actual_expenses': return 'restricted'
    required=['ownership','first_business_year','first_method','section179','bonus_depreciation','accelerated_depreciation','fleet']
    if any(getattr(setting,k,None) is None for k in required): return 'unknown'
    return 'review_required'  # Screening is not a legal eligibility determination.

def summarize(trips, expenses, vehicles, settings, method, year, timezone_name='America/New_York'):
    tz=ZoneInfo(timezone_name)
    vehicle_map={v.id:v for v in vehicles}; setting_map={s.vehicle_id:s for s in settings}
    groups={key:dict(vehicle_id=key,vehicle_name=f'{v.year} {v.make} {v.model}'+(f' · {v.trim}' if v.trim else ''),business_miles=D(0),personal_miles=D(0),standard=D(0),operating=D(0),parking_tolls=D(0)) for key,v in vehicle_map.items()}
    def group(key):
        if key not in groups: groups[key]=dict(vehicle_id=None,vehicle_name='Unassigned vehicle',business_miles=D(0),personal_miles=D(0),standard=D(0),operating=D(0),parking_tolls=D(0))
        return groups[key]
    rates=defaultdict(lambda:dict(miles=D(0),deduction=D(0)))
    caveats={'Estimates only. Selecting a reporting method does not file an IRS election.','Deductibility and method eligibility require review of records and IRS rules.','Depreciation, lease inclusion adjustments, and tax credits are not calculated.'}
    incomplete=False; non_vehicle=D(0); recorded=D(0); standard_total=D(0); operating_total=D(0); parking=D(0)
    for trip in trips:
        g=group(trip.vehicle_id); miles=D(str(trip.distance_miles))
        if trip.category.value=='personal': g['personal_miles']+=miles; continue
        g['business_miles']+=miles
        local=trip.start_time.replace(tzinfo=trip.start_time.tzinfo or timezone.utc).astimezone(tz).date()
        rate=rate_for(local)
        if rate is None: incomplete=True;caveats.add('An official mileage rate is unavailable for part of this period.');continue
        value=miles*rate;g['standard']+=value;rates[str(rate)]['miles']+=miles;rates[str(rate)]['deduction']+=value
        effective_start,effective_end=period_for(local)
        rates[str(rate)]['effective_start']=effective_start;rates[str(rate)]['effective_end']=effective_end
    for expense in expenses:
        amount=D(str(expense.amount));recorded+=amount
        rule=CATEGORY_RULES.get(expense.category)
        business=money(amount*D(str(expense.business_percentage))/100)
        if expense.category.value=='vehicle':
            incomplete=True;caveats.add('Unspecified vehicle costs need classification; purchases, leases and depreciation are not automatically deducted.')
        elif rule and rule['vehicle']: group(expense.vehicle_id)['operating']+=amount;operating_total+=amount
        elif expense.category.value=='parking_tolls': group(expense.vehicle_id)['parking_tolls']+=business;parking+=business
        elif rule and rule['actual']: non_vehicle+=business
        elif business: caveats.add('Some recorded expenses are outside the supported deduction categories.')
    rows=[]; actual_total=D(0); selected_vehicle_total=D(0); selected_actual=D(0)
    for key,g in groups.items():
        setting=setting_map.get(key); status=eligibility(setting,year)
        total=getattr(setting,'total_miles',None); business=getattr(setting,'business_miles',None)
        ratio=(D(str(business))/D(str(total))) if total and business is not None and 0<=business<=total else None
        # Documented annual mileage cannot be below business miles already in this report.
        if ratio is not None and D(str(business))<g['business_miles']:ratio=None
        actual=None if ratio is None else money(g['operating']*ratio)
        row_method=setting.method if setting else method
        if row_method=='actual_expenses' and (g['operating'] or g['business_miles']) and actual is None: incomplete=True;caveats.add('Actual vehicle expenses need documented business and total mileage for this tax year.')
        if (g['business_miles'] or g['operating']) and status!='review_required': caveats.add('Vehicle method eligibility is unknown or restricted. Review first-year use, leases, depreciation and fleet rules with a tax professional.')
        if status=='restricted' and row_method=='standard_mileage':incomplete=True
        std=money(g['standard']);standard_total+=std
        if actual is not None:actual_total+=actual
        selected_vehicle_total+=std if row_method=='standard_mileage' else actual or D(0)
        if row_method=='actual_expenses':selected_actual+=actual or D(0)
        rows.append({**g,'standard':std,'actual':actual,'method':row_method,'business_use_percentage':None if ratio is None else money(ratio*100),'eligibility':status})
    if any(r['vehicle_id'] is None and (r['business_miles'] or r['operating']) for r in rows):caveats.add('Unassigned records are not attributed to the current default vehicle.')
    caveats.add('Monetary estimates are rounded to cents per vehicle using half-up rounding.')
    caveats.add('Actual-expense comparisons exclude unsupported depreciation and lease adjustments; an incomplete amount is a subtotal, not a full deduction.')
    return dict(vehicle_rows=rows,total_expenses=recorded,total_miles=sum((g['business_miles'] for g in rows),D(0)),personal_miles=sum((g['personal_miles'] for g in rows),D(0)),mileage_deduction=standard_total,vehicle_expense_total=operating_total,parking_tolls=parking,non_vehicle_deductions=non_vehicle,deductible_expense_total=money(non_vehicle+parking+selected_actual),total_deductions=money(non_vehicle+parking+selected_vehicle_total),comparison_standard=money(non_vehicle+parking+standard_total),comparison_actual=None if any(r['actual'] is None and (r['operating'] or r['business_miles']) for r in rows) else money(non_vehicle+parking+actual_total),calculation_complete=not incomplete,rate_periods=[dict(rate=rate,**v) for rate,v in rates.items()],caveats=sorted(caveats))

def report(db,user,year=None,month=None,day=None,start_date=None,end_date=None,vehicle_id=None,method=None,advanced=False):
    try:tz=ZoneInfo(user.timezone or 'America/New_York')
    except (ZoneInfoNotFoundError,ValueError):tz=ZoneInfo('America/New_York')
    year=year or (start_date.year if start_date else datetime.now(tz).year)
    if method not in METHODS and method is not None:raise HTTPException(422,'Invalid reporting method')
    method=method or user.tax_method.value
    if (start_date is None)!=(end_date is None):raise HTTPException(422,'Both range dates are required')
    try:
        start=start_date or date(year,month or 1,day or 1)
        end=end_date or (start if day else date(year,month+1,1)-timedelta(days=1) if month and month<12 else date(year,12,31))
    except ValueError:raise HTTPException(422,'Invalid report dates')
    if end<start or start.year!=end.year:raise HTTPException(422,'Choose dates within one tax year')
    if year!=start.year:raise HTTPException(422,'Tax year and report dates must agree')
    first=datetime.combine(start,datetime.min.time(),tz);last=datetime.combine(end+timedelta(days=1),datetime.min.time(),tz)
    first=first.astimezone(timezone.utc);last=last.astimezone(timezone.utc)
    trips=db.query(Trip).filter(Trip.user_id==user.id,Trip.start_time>=first,Trip.start_time<last).all()
    expenses=db.query(Expense).filter(Expense.user_id==user.id,Expense.incurred_at>=first,Expense.incurred_at<last).all()
    incomes=db.query(Income).filter(Income.user_id==user.id,Income.received_at>=first,Income.received_at<last).all()
    vehicles=db.query(UserVehicle).filter_by(user_id=user.id).all()
    settings=db.query(VehicleTaxSetting).filter_by(user_id=user.id,year=year).all()
    unassigned_income=sum((i.amount for i in incomes if not i.trip_id),D(0))
    if vehicle_id:
        owned_vehicle(db,user.id,vehicle_id,allow_deleted=True)
        trips=[t for t in trips if t.vehicle_id==vehicle_id]
        expenses=[e for e in expenses if e.vehicle_id==vehicle_id]
        incomes=db.query(Income).join(Trip,Income.trip_id==Trip.id).filter(Income.user_id==user.id,Trip.user_id==user.id,Trip.vehicle_id==vehicle_id,Income.received_at>=first,Income.received_at<last).all()
        vehicles=[v for v in vehicles if v.id==vehicle_id]
    data=summarize(trips,expenses,vehicles,settings,method,year,tz.key)
    if vehicle_id:data['caveats'].append('Vehicle income includes only income linked to its Trips; standalone income remains unallocated.')
    trends=defaultdict(lambda:dict(income=D(0),expenses=D(0)))
    for item,field,when in [(i,'income',i.received_at) for i in incomes]+[(e,'expenses',e.incurred_at) for e in expenses]:
        key=when.replace(tzinfo=when.tzinfo or timezone.utc).astimezone(tz).strftime('%Y-%m');trends[key][field]+=item.amount
    income=sum((i.amount for i in incomes),D(0))
    data.update(report_version=2,year=year,month=month,day=day,start_date=start,end_date=end,generated_at_utc=datetime.now(timezone.utc),first_name=user.first_name,last_name=user.last_name,filing_status=user.filing_status.value,business_type=user.business_type.value if hasattr(user.business_type,'value') else user.business_type,tax_method=method,total_income=income,net_profit=income-data['total_deductions'],taxable_income=max(D(0),income-data['total_deductions']),estimated_tax_owed=None,estimated_tax_savings=None,non_deductible_expense_total=max(D(0),data['total_expenses']-data['deductible_expense_total']),largest_expense_category=None,largest_expense_amount=0,expense_breakdown={},deductible_breakdown={},non_deductible_breakdown={},saved_trip_count=len(trips),vehicle_filter=vehicle_id,unallocated_income=unassigned_income,trends=[dict(period=k,**v) for k,v in sorted(trends.items())] if advanced else [],advanced=advanced)
    # No federal tax projection without complete filing inputs; do not display invented zeros.
    data['caveats'].append('This report estimates deductions, not federal or state tax owed. It does not include self-employment tax or your complete return.')
    import hashlib, json
    data['report_fingerprint']=hashlib.sha256(json.dumps(export_rows(data),default=str,sort_keys=True).encode()).hexdigest()
    if not advanced:
        data['vehicle_rows']=[{k:r[k] for k in ['vehicle_id','vehicle_name','method','eligibility']} for r in data['vehicle_rows']]
        data.pop('comparison_standard',None);data.pop('comparison_actual',None)
    return data

def export_rows(data):
    rows=[['Deduckly — estimated report'],['Period',str(data['start_date']),str(data['end_date'])],['Reporting method',data['tax_method']],['Income',str(data['total_income'])],['Recorded expenses',str(data['total_expenses'])],['Business miles',str(data['total_miles'])],['Personal miles',str(data['personal_miles'])],['Estimated deductions / incomplete subtotal',str(data['total_deductions'])],['Business parking and tolls',str(data['parking_tolls'])],['Other business deductions',str(data['non_vehicle_deductions'])],['Complete operating-cost inputs',str(data['calculation_complete'])],['Vehicle','Business miles','Personal miles','Method','Business use %','Standard estimate','Actual operating subtotal','Eligibility']]
    for r in data['vehicle_rows']:rows.append([r['vehicle_name'],str(r['business_miles']),str(r['personal_miles']),r['method'],str(r['business_use_percentage']),str(r['standard']),str(r['actual']),r['eligibility']])
    for r in data['rate_periods']:rows.append(['IRS rate per mile',r['rate'],str(r['effective_start']),str(r['effective_end']),'Business miles',str(r['miles'])])
    rows.extend([['Assumption / limitation',c] for c in data['caveats']])
    return rows
