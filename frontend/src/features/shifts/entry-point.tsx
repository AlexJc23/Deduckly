import { Image } from 'react-native';
import { platformIcons, type PlatformName } from '@/constants/platform-icons';
import { Ionicons } from '@/theme/icons';
import { useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { useShifts } from './context';
import { elapsedMinutes, platformName, shiftMiles } from './presentation';
export function ShiftEntryPoint({ manualActive = false, activeOnly = false, compact = false }: { manualActive?: boolean; activeOnly?: boolean; compact?: boolean }) {
 const { entries, owner } = useShifts(); const { t, locale } = useLanguage();
 const [now, setNow] = useState(Date.now());
 useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, []);
 if (!owner) return null;
 const active = entries.find(e => e.local && !e.data.ended_at);
 const driving = !!active?.detector.driving && !manualActive;
 if (!active && activeOnly) return null;
 const platform = active?.data.platform_sessions.find(p => !p.ended_at)?.platform;
 const minutes = active ? elapsedMinutes(active.data.started_at,null,now) : 0;
 return <Pressable onPress={() => router.push('/shifts' as Href)} accessibilityRole="button" style={{ padding: compact ? 12 : 18, borderRadius: 20, borderWidth: 1, borderColor: active ? '#32634F' : '#E2E8F0', backgroundColor: active ? '#F0FDF4' : '#FFFFFF', gap: compact ? 8 : 16 }}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:9,height:9,borderRadius:5,backgroundColor:active?'#35D779':'#4A6FE3'}}/><Text style={{fontWeight:'700',fontSize:18,flex:1}}>{t(driving?'Driving':active?'Shift Active':'Start Shift')}</Text>{platform&&platform in platformIcons?<Image accessible accessibilityLabel={t(platformName(platform))} source={platformIcons[platform as PlatformName]} resizeMode="contain" style={{width:36,height:28}}/>:active&&<Text>{t('No platform')}</Text>}</View>
  {active ? <>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>
    <View style={{flex:1,minWidth:75,gap:5}}>{!compact&&<Ionicons name="time-outline" size={22} color="#94A3B8"/>}<Text style={{fontWeight:'700',fontSize:19}}>{t('{hours}h {minutes}m',{hours:Math.floor(minutes/60),minutes:minutes%60})}</Text><Text style={{fontSize:12,color:'#64748B'}}>{t('elapsed')}</Text></View>
    <View style={{flex:1,minWidth:75,gap:5}}>{!compact&&<Ionicons name="trail-sign-outline" size={22} color="#94A3B8"/>}<Text style={{fontWeight:'700',fontSize:19}}>{shiftMiles(active).toFixed(2)}</Text><Text style={{fontSize:12,color:'#64748B'}}>{t('miles detected')}</Text></View>
    {active.data.planned_end_at&&<View style={{flex:1,minWidth:75,gap:5}}>{!compact&&<Ionicons name="calendar-outline" size={22} color="#94A3B8"/>}<Text style={{fontWeight:'700',fontSize:16}}>{new Date(active.data.planned_end_at).toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit'})}</Text><Text style={{fontSize:12,color:'#64748B'}}>{t('Planned end')}</Text></View>}
   </View>
   {driving&&<Text style={{fontSize:13}}>{t('Current drive')}: {active.detector.miles.toFixed(2)} {t('miles')}</Text>}
   {(active.dirty||active.pending)&&<Text style={{color:'#64748B',fontSize:12}}>{t('Pending sync')}</Text>}
  </> : <Text style={{color:'#64748B'}}>{t('Automatic drive detection while you work.')}</Text>}
  <View style={{minHeight:compact?24:48,padding:compact?0:12,alignItems:'center',justifyContent:'center',borderRadius:14,borderWidth:compact?0:1,borderColor:active?'#32634F':'#E2E8F0'}}><Text style={{color:active?'#15803D':'#0072B5',fontWeight:'700',fontSize:17}}>{t(active?'View Shift':'Open Shift Mode')} →</Text></View>
 </Pressable>;
}
