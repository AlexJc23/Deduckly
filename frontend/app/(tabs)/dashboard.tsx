import { platformName } from '@/features/shifts/presentation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dailyMotivation } from '@/features/dashboard/motivation';
import { ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable, SafeAreaView, ScrollView } from '@/theme/components';
import { Ionicons } from '@/theme/icons';
import { useLanguage } from '@/i18n/language';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useTodayReport } from '@/features/reports/hooks/use-today-report';
import { useDailyGoal } from '@/features/users/hooks/use-daily-goal';
import { useTracking } from '@/features/tracking/context/tracking.context';
import { StartTripModal } from '@/features/tracking/components/StartTripModal';
import { ShiftEntryPoint } from '@/features/shifts/entry-point';
import { useShifts } from '@/features/shifts/context';
import { getPendingTrip } from '@/services/siri.service';
import { localizedAlert } from '@/i18n/alerts';
import { dashboardSummary } from '@/features/reports/utils/dashboard-summary';
export default function DashboardScreen() {
 const {height,fontScale}=useWindowDimensions();
 const { t, locale } = useLanguage(); const userQuery=useCurrentUser();const { saved }=useLocalSearchParams();
 const {isTracking,isReady,trackingNotice,startTrackingFromSiri}=useTracking();const {entries}=useShifts();
 const report=useTodayReport();const {data:dailyGoal}=useDailyGoal();
 const [showStartTripModal,setShowStartTripModal]=useState(false),[showBanner,setShowBanner]=useState(false);
 const [showBreakdown,setShowBreakdown]=useState(false);
 const bannerTimeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
 const openStartModal=useCallback(()=>setShowStartTripModal(true),[]),closeStartModal=useCallback(()=>setShowStartTripModal(false),[]);
  useEffect(() => {
    if (saved !== "true") {
      return;
    }

    setShowBanner(true);

    if (bannerTimeoutRef.current) {
      clearTimeout(
        bannerTimeoutRef.current
      );
    }

    bannerTimeoutRef.current =
      setTimeout(() => {
        setShowBanner(false);
        bannerTimeoutRef.current = null;
      }, 3000);

    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(
          bannerTimeoutRef.current
        );
      }
    };
  }, [saved]);

  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(
      async () => {
        const pendingTrip =
          await getPendingTrip();

        if (!pendingTrip) return;

        clearInterval(interval);

        if (!await startTrackingFromSiri(
          pendingTrip.platform
        )) return;

        router.replace(
          "/tracking/active"
        );
      },
      500
    );

    return () => clearInterval(interval);
  }, [isReady, startTrackingFromSiri]);


 const summary=dashboardSummary(report.data,dailyGoal);
 const money=(n:number|null)=>n===null?'—':new Intl.NumberFormat(locale,{style:'currency',currency:'USD'}).format(n);
 const hour=new Date().getHours();const greeting=t(hour<12?'Good morning':hour<18?'Good afternoon':'Good evening');
 const active=entries.some(e=>e.local&&!e.data.ended_at);
 return <SafeAreaView edges={['top']} style={s.screen}>
  <ScrollView contentContainerStyle={s.content}>
   <View style={s.header}><View style={{flex:1,gap:5}}><Text accessibilityRole="header" style={s.subtitle}>{greeting}{userQuery.data?.first_name?`, ${userQuery.data.first_name}!`:''}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t('Profile')} onPress={()=>router.push('/settings/edit-profile')} style={s.profile}><Ionicons name="person" size={23} color="#50C7EF"/></Pressable></View>
   {showBanner&&<Text accessibilityLiveRegion="polite" style={s.success}>{t('Trip Saved Successfully')}</Text>}
   {report.isError&&<Pressable accessibilityRole="button" onPress={()=>void report.refetch()} style={s.card}><Text>{t('Could not refresh today’s data. Tap to retry.')}</Text></Pressable>}
   <View style={s.card}>
    <View style={s.row}><Text style={s.heading}>{t("Today's Earnings")}</Text><Text style={s.muted}>{t('Goal')}: {money(summary.goal)}</Text></View>
    {report.isLoading?<ActivityIndicator accessibilityLabel={t('Loading')} color="#4A6FE3"/>:<Text style={s.earnings}>{money(summary.income)}</Text>}
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View accessibilityRole="progressbar" accessibilityLabel={t('Daily income goal')} accessibilityValue={{min:0,max:100,now:summary.progress,text:summary.goal===null?t('No daily goal set'):`${summary.percentage}%`}} style={s.track}><View style={[s.fill,{width:`${summary.progress}%`}]}/></View><Text style={s.percent}>{summary.goal===null?'—':`${summary.percentage}%`}</Text></View>
    {summary.goal===null&&<Text style={s.muted}>{t(dailyGoal?'No daily goal set':'Goal unavailable')}</Text>}
    <View style={s.divider}/><Pressable accessibilityRole="button" accessibilityLabel={t('Mileage breakdown')} accessibilityState={{expanded:showBreakdown}} onPress={()=>setShowBreakdown(!showBreakdown)} style={s.stats}>
     <View style={s.stat}><Ionicons name="trail-sign-outline" size={22} color="#94A3B8"/><View><Text style={s.muted}>{t('Business miles today')}</Text><Text style={s.metric}>{summary.businessMiles===null?'—':summary.businessMiles.toLocaleString(locale,{maximumFractionDigits:2})}</Text><Ionicons name={showBreakdown?"chevron-up":"chevron-down"} size={14} color="#94A3B8"/></View></View>
     <View style={s.stat}><Ionicons name="receipt-outline" size={22} color="#94A3B8"/><View style={{flexShrink:1}}><Text style={s.muted}>{t('Business trips saved')}</Text><Text style={s.metric}>{summary.businessTrips??'—'}</Text></View></View>
    </Pressable>
    {showBreakdown&&Array.isArray(report.data?.trip_breakdown)&&report.data.trip_breakdown.map((row:{platform:string|null;miles:number;trip_count:number})=><View key={row.platform??'none'} style={s.row}><Text>{t(platformName(row.platform))}</Text><Text>{Number(row.miles).toLocaleString(locale,{maximumFractionDigits:2})} {t('miles')} · {row.trip_count} {t('trips')}</Text></View>)}
   </View>
   <ShiftEntryPoint manualActive={isTracking} activeOnly compact/>
   <Pressable accessibilityRole="button" onPress={()=>router.push('/offer-analyzer/screens/OfferAnalyzerScreen')} style={[s.card,s.navigation]}><View style={s.icon}><Ionicons name="analytics-outline" size={27} color="#50C7EF"/></View><View style={{flex:1,gap:4}}><Text style={s.heading}>{t('Offer Analyzer')}</Text><Text style={s.muted}>{t('Is that offer worth it?')}</Text></View><Ionicons name="chevron-forward" size={22} color="#94A3B8"/></Pressable>
   <View style={s.quick}><Pressable accessibilityRole="button" onPress={()=>router.push('/income/create')} style={s.quickButton}><Ionicons name="add-circle-outline" size={23} color="#50C7EF"/><Text style={s.heading}>{t('Add Income')}</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.push('/expense/create')} style={s.quickButton}><Ionicons name="receipt-outline" size={23} color="#50C7EF"/><Text style={s.heading}>{t('Add Expense')}</Text></Pressable></View>
   {!active&&<Pressable accessibilityRole="button" onPress={()=>router.push('/shifts')} style={s.shiftButton}><Ionicons name="briefcase-outline" size={23} color="#FFFFFF"/><Text style={s.primaryTitle}>{t('Start Shift')}</Text><Ionicons name="arrow-forward" size={22} color="#FFFFFF"/></Pressable>}
   <Pressable accessibilityRole="button" disabled={!isReady} accessibilityState={{disabled:!isReady}} onPress={()=>isTracking?router.push('/tracking/active'):openStartModal()} style={[s.primary,!isReady&&{opacity:.5}]}><Ionicons name={isTracking?'navigate':'play'} color="#FFFFFF" size={25}/><View style={{flex:1,gap:5}}><Text style={s.primaryTitle}>{t(isTracking?'Trip in Progress':'Start a Trip')}</Text><Text style={s.primaryHint}>{t(isTracking?'View active trip':'Or say “Siri, Start a trip in Deduckly”')}</Text></View></Pressable>

   {height>=800&&fontScale<=1&&!active&&!trackingNotice&&<Text style={s.motivation}>{t(dailyMotivation())}</Text>}
   {trackingNotice&&<Pressable accessibilityRole="button" onPress={()=>isTracking?router.push('/tracking/active'):localizedAlert('Check trip tracking',trackingNotice)} style={s.link}><Text style={s.muted}>{t('Check trip tracking')}</Text></Pressable>}
  </ScrollView><StartTripModal visible={showStartTripModal} onClose={closeStartModal}/>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 screen:{flex:1,backgroundColor:'#F8FAFC'},content:{width:'100%',maxWidth:760,alignSelf:'center',paddingHorizontal:16,paddingTop:4,paddingBottom:12,gap:10},
 header:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:4},subtitle:{fontSize:16,color:'#64748B',flexShrink:1},profile:{minWidth:48,minHeight:48,borderRadius:24,backgroundColor:'#E8EEFF',alignItems:'center',justifyContent:'center'},
 card:{backgroundColor:'#FFFFFF',borderColor:'#E2E8F0',borderWidth:1,borderRadius:20,padding:14,gap:8},heading:{fontSize:16,fontWeight:'700',flexShrink:1},muted:{fontSize:13,color:'#64748B',flexShrink:1},
 row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8},earnings:{fontSize:34,fontWeight:'800'},track:{flex:1,height:8,borderRadius:6,overflow:'hidden',backgroundColor:'#F1F5F9'},fill:{height:'100%',borderRadius:6,backgroundColor:'#4A6FE3'},percent:{color:'#0072B5',fontSize:16,fontWeight:'700'},
 divider:{height:1,backgroundColor:'#E2E8F0'},stats:{flexDirection:'row',flexWrap:'wrap',gap:16},stat:{flex:1,minWidth:125,flexDirection:'row',alignItems:'flex-start',gap:10},metric:{fontSize:22,fontWeight:'700'},
 navigation:{flexDirection:'row',alignItems:'center',gap:12},icon:{padding:10,borderRadius:12,backgroundColor:'#E8EEFF'},quick:{flexDirection:'row',flexWrap:'wrap',gap:12},quickButton:{flex:1,minWidth:135,minHeight:48,padding:10,borderWidth:1,borderColor:'#DCE6FF',borderRadius:16,backgroundColor:'#FFFFFF',flexDirection:'row',alignItems:'center',gap:10},
 shiftButton:{backgroundColor:'#4A6FE3',borderRadius:18,minHeight:52,padding:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},motivation:{fontSize:13,color:'#64748B',textAlign:'center'},
 primary:{backgroundColor:'#234467',borderRadius:22,minHeight:56,padding:12,flexDirection:'row',alignItems:'center',gap:18},primaryTitle:{color:'#FFFFFF',fontSize:20,fontWeight:'700'},primaryHint:{color:'#E8EEFF',fontSize:13},link:{minHeight:44,justifyContent:'center'},blue:{color:'#0072B5',fontWeight:'600'},success:{color:'#15803D'},
});
