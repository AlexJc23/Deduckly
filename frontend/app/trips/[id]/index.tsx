import { addressDisplay } from '@/features/trips/utils/address-display';
import { VehicleAssignment } from '@/features/vehicles/VehicleAssignment';
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { platformIcons, type PlatformName } from '@/constants/platform-icons';
import { useState, useSyncExternalStore } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable, ScrollView, SafeAreaView, TextInput } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { CompactSelect } from '@/components/ui/CompactSelect';
import { DeleteTripModal } from '@/features/trips/components/DeleteTripModal';
import { useDeleteTrip } from '@/features/trips/hooks/use-delete-trip';
import { useUpdateTrip } from '@/features/trips/hooks/use-update-trip';
import { useTrip } from '@/features/trips/hooks/use-trips';
import type { Trip } from '@/features/trips/types/trips.types';
import { useFuelAssumptions } from '@/features/vehicles/use-fuel-assumptions';
import { estimateConsumption } from '@/features/vehicles/energy';
import { platformName, SHIFT_PLATFORMS, elapsedMinutes } from '@/features/shifts/presentation';
import { subscribeAccountBoundary, getAccountGeneration } from '@/features/auth/services/account-boundary';
export default function TripDetailsScreen() {
 const { id } = useLocalSearchParams<{ id: string }>(); const { t } = useLanguage();
 const generation = useSyncExternalStore(subscribeAccountBoundary,getAccountGeneration,getAccountGeneration);
 const query = useTrip(Number(id));
 return <SafeAreaView style={s.screen}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
  <ScreenHeader title="Trip Details" safeArea={false} />
  {query.isPending ? <ActivityIndicator accessibilityLabel={t('Loading trip')} /> : query.isError || !query.data ? <View style={s.content}><Text accessibilityRole="alert">{t('Failed to load trip.')}</Text><Pressable accessibilityRole="button" onPress={() => void query.refetch()} style={s.action}><Text style={s.blue}>{t('Try again')}</Text></Pressable></View> : <TripContent key={`${generation}:${query.data.user_id}:${query.data.id}`} trip={query.data} />}
 </KeyboardAvoidingView></SafeAreaView>;
}
function TripContent({ trip }: { trip: Trip }) {
 const [vehicle,setVehicle]=useState(trip.vehicle_id??null);
 const { t, locale } = useLanguage(); const update = useUpdateTrip(), deletion = useDeleteTrip();
 const { assumptions } = useFuelAssumptions();
 const [editing,setEditing] = useState(false), [category,setCategory] = useState(trip.category), [platform,setPlatform] = useState(trip.platform ?? '');
 const [showFuel,setShowFuel] = useState(false), [showDelete,setShowDelete] = useState(false);
 const [notes,setNotes] = useState(trip.notes ?? ''); const supportsNotes = Object.hasOwn(trip,'notes');
 const busy = update.isPending || deletion.isPending;
 const duration = elapsedMinutes(trip.start_time, trip.end_time, Date.now());
 const estimate = assumptions ? estimateConsumption(Number(trip.distance_miles),assumptions.fuelType,assumptions.economy,assumptions.price) : null;
 const electric = assumptions?.fuelType === 'electric';
 const money = (value: number) => new Intl.NumberFormat(locale,{style:'currency',currency:'USD'}).format(value);
 const platformChoices = [...(!trip.platform ? [{ value:'', label:t('No platform') }] : []), ...SHIFT_PLATFORMS.map(p => ({value:p,label:t(platformName(p))}))];
 // Keep any historical API enum visible without inventing an unsupported value.
 if (trip.platform && !platformChoices.some(p => p.value === trip.platform)) platformChoices.push({value:trip.platform,label:t(platformName(trip.platform))});
 async function save() {
  if (busy) return;
  try { await update.mutateAsync({tripId:trip.id,trip:{...(vehicle!==(trip.vehicle_id??null)?{vehicle_id:vehicle}:{}),category,...(platform ? {platform} : {}),...(supportsNotes ? {notes:notes.trim() || null} : {})}});setEditing(false); }
  catch { Alert.alert(t('Could not save trip'),t('Connect to save changes. Your edits are still here; try again.')); }
 }
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
  <View style={s.card}>
   <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{flex:1,gap:4}}><Text style={s.heading}>{t('Trip')}</Text><Text style={s.muted}>{new Date(trip.start_time).toLocaleString(locale,{dateStyle:'medium',timeStyle:'short'})}</Text></View><Pressable accessibilityRole="button" accessibilityState={{expanded:editing,disabled:busy}} disabled={busy} onPress={() => {setVehicle(trip.vehicle_id??null);setCategory(trip.category);setPlatform(trip.platform ?? '');setNotes(trip.notes ?? '');setEditing(!editing);}} style={s.edit}><Text style={s.blue}>{t(editing ? 'Cancel editing' : 'Edit trip')}</Text></Pressable></View>
   <View style={s.summaryMetrics}>
    <View style={s.summaryRow}><View style={s.summaryColumn}/><View style={[s.summaryColumn,{alignItems:'center'}]}>{trip.platform && trip.platform in platformIcons && <Image accessible={false} source={platformIcons[trip.platform as PlatformName]} resizeMode="contain" style={{width:30,height:24}}/>}</View><View style={s.summaryColumn}/></View>
    <View style={s.summaryRow}>
     <Text style={[s.summaryColumn,s.metricValue,s.miles]}>{trip.distance_miles != null && Number.isFinite(Number(trip.distance_miles)) ? Number(trip.distance_miles).toFixed(2) : '—'}</Text>
     <Text style={[s.summaryColumn,s.metricValue]}>{t(platformName(trip.platform))}</Text>
     <Text style={[s.summaryColumn,s.metricValue]}>{t(trip.category === 'business' ? 'Business' : 'Personal')}</Text>
    </View>
    <View style={s.summaryRow}><Text style={[s.summaryColumn,s.metricLabel]}>{t('miles')}</Text><Text style={[s.summaryColumn,s.metricLabel]}>{t('Platform')}</Text><Text style={[s.summaryColumn,s.metricLabel]}>{t('Category')}</Text></View>
   </View>{duration>0&&<Text style={s.muted}>{t('{minutes} min',{minutes:duration})}</Text>}
   {editing && <View style={{gap:12}}>
    <VehicleAssignment value={vehicle} onChange={setVehicle} disabled={busy}/><CompactSelect label="Category" value={category} choices={[{value:'business',label:t('Business')},{value:'personal',label:t('Personal')}]} onChange={setCategory} disabled={busy}/>
    <CompactSelect label="Platform" value={platform} choices={platformChoices} onChange={setPlatform} disabled={busy}/>
    <Text style={s.muted}>{t('Category changes update mileage deductions. Saving requires a connection.')}</Text>
    <Pressable accessibilityRole="button" disabled={busy} accessibilityState={{disabled:busy,busy:update.isPending}} onPress={() => void save()} style={s.primary}><Text style={{color:'#FFFFFF',fontWeight:'700'}}>{t(update.isPending ? 'Saving…' : 'Save changes')}</Text></Pressable>
   </View>}
  </View>
  <View style={s.card}>
   <Text accessibilityRole="header" style={s.heading}>{t('Route')}</Text>
   <View style={s.route}><View style={s.timeline}/><View style={[s.dot,{backgroundColor:'#2EAF4A'}]}/><View style={{flex:1,gap:6}}><Text style={s.muted}>{t('Driving start')}</Text><Text selectable style={s.address}>{addressDisplay(trip.start_address) || t('Address unavailable')}</Text></View></View>
   <View style={s.route}><View style={[s.dot,{backgroundColor:'#4A6FE3'}]}/><View style={{flex:1,gap:6}}><Text style={s.muted}>{t('Driving end')}</Text><Text selectable style={s.address}>{addressDisplay(trip.end_address) || t('Address unavailable')}</Text></View></View>
  </View>
  <View style={s.card}>
   <Text accessibilityRole="header" style={s.heading}>{t(electric ? 'Estimated energy cost' : 'Estimated fuel cost')}</Text>
   {estimate && assumptions ? <>
    <Text style={{fontWeight:'600'}}>{assumptions.vehicle}</Text>
    <View style={s.metrics}>
     <View style={s.fuelCell}><Text style={{fontWeight:'700'}}>{Number(trip.distance_miles).toFixed(2)}</Text><Text style={s.muted}>{t('miles')}</Text></View>
     <View style={s.fuelCell}><Text style={{fontWeight:'700'}}>{assumptions.economy} {t(electric?'kWh / 100 miles':'MPG')}</Text><Text style={s.muted}>{t('Fuel economy')}</Text></View>
     <View style={s.fuelCell}><Text style={{fontWeight:'700'}}>{estimate.units.toFixed(2)} {t(electric?'kWh':'gal')}</Text><Text style={s.muted}>{t('Estimated consumption')}</Text></View>
     <View style={s.fuelCell}><Text style={{fontWeight:'700'}}>{estimate.cost===null?t('Fuel price unavailable'):`${money(assumptions.price!)}${t(electric?'/kWh':'/gal')}`}</Text><Text style={s.muted}>{t('Saved price')}</Text></View>
    </View>
    {estimate.cost!==null&&<View style={s.estimateTotal}><Text style={{fontSize:18,fontWeight:'700',color:'#15803D'}}>{money(estimate.cost)}</Text><Text style={s.muted}>{t(electric?'Estimated energy cost':'Estimated fuel cost')}</Text></View>}
    <Text style={s.muted}>{t('Based on current saved vehicle and price settings, not historical trip data.')}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showFuel}} onPress={() => setShowFuel(!showFuel)} style={s.action}><Text style={s.blue}>{t('Estimate assumptions')} {showFuel ? '−' : '+'}</Text></Pressable>
    {showFuel && <View style={{gap:8}}><Text>{t(assumptions.source)}</Text>{assumptions.observedAt && <Text>{t('Price observed')}: {new Date(assumptions.observedAt).toLocaleString(locale)}</Text>}<Text style={s.muted}>{t('Estimate only. No expense is recorded and tax deductions are unchanged.')}</Text></View>}

   </> : <Text style={s.muted}>{t('Save a default vehicle with fuel economy in Settings to see an estimate.')}</Text>}
  </View>
  {supportsNotes&&<View style={s.card}><Text accessibilityRole="header" style={s.heading}>{t('Notes (optional)')}</Text>{editing?<TextInput accessibilityLabel={t('Trip notes')} placeholder={t('Add notes about this trip…')} value={notes} onChangeText={setNotes} multiline maxLength={2000} editable={!busy} style={s.notes}/>:<Text selectable style={s.muted}>{trip.notes?.trim() || t('No notes added')}</Text>}{editing&&<Pressable accessibilityRole="button" disabled={busy} onPress={()=>void save()} style={s.primary}><Text style={{color:'#FFFFFF',fontWeight:'700'}}>{t('Save changes')}</Text></Pressable>}</View>}
  <Pressable accessibilityRole="button" disabled={busy} onPress={() => setShowDelete(true)} style={s.destructive}><Text style={{color:'#DC2626',fontWeight:'600'}}>{t('Delete Trip')}</Text></Pressable>
  <DeleteTripModal visible={showDelete} onClose={() => setShowDelete(false)} onDelete={async () => {
   if (busy) return;setShowDelete(false);
   try {await deletion.mutateAsync(trip.id);router.dismissTo('/activity');}
   catch {Alert.alert(t('Could not delete trip'),t('The trip was not removed. Check your connection and try again.'));}
  }}/>
 </ScrollView>;
}
const s = StyleSheet.create({
 screen:{flex:1,backgroundColor:'#F8FAFC'},nav:{paddingHorizontal:20,flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:16,width:'100%',maxWidth:760,alignSelf:'center'},
 title:{fontSize:22,fontWeight:'700',flexShrink:1},content:{padding:20,gap:16,paddingBottom:40,width:'100%',maxWidth:760,alignSelf:'center'},
 card:{backgroundColor:'#FFFFFF',borderRadius:20,borderWidth:1,borderColor:'#E2E8F0',padding:20,gap:12},heading:{fontSize:18,fontWeight:'700',flexShrink:1},
 edit:{minHeight:44,borderWidth:1,borderColor:'#0072B5',borderRadius:16,paddingHorizontal:12,justifyContent:'center',maxWidth:'50%'},
 metrics:{flexDirection:'row',flexWrap:'wrap',gap:12},summaryMetrics:{gap:6},summaryRow:{flexDirection:'row',gap:8,alignItems:'center'},summaryColumn:{flex:1,minWidth:0},metricValue:{fontSize:16,fontWeight:'600',textAlign:'center'},metricLabel:{fontSize:13,color:'#64748B',textAlign:'center'},fuelCell:{flexBasis:'44%',flexGrow:1,minWidth:110,gap:4,padding:10,backgroundColor:'#F8FAFC',borderRadius:10},estimateTotal:{flexDirection:'row',flexWrap:'wrap',gap:8,alignItems:'center',backgroundColor:'#F0FDF4',padding:12,borderRadius:10},notes:{minHeight:88,borderWidth:1,borderColor:'#E2E8F0',borderRadius:12,padding:12,textAlignVertical:'top'},destructive:{minHeight:48,alignItems:'center',justifyContent:'center',padding:14,borderRadius:14,borderWidth:1,borderColor:'#DC2626',backgroundColor:'#FFF5F5'},timeline:{position:'absolute',top:20,bottom:-20,left:4,width:2,backgroundColor:'#E2E8F0'},
 miles:{fontSize:25,fontWeight:'800'},muted:{fontSize:14,color:'#64748B',flexShrink:1},row:{flexDirection:'row',flexWrap:'wrap',gap:8},badge:{backgroundColor:'#F1F5F9',padding:8,borderRadius:8,flexShrink:1},
 action:{minHeight:48,paddingVertical:12,justifyContent:'center'},blue:{color:'#4A6FE3',fontWeight:'600'},primary:{backgroundColor:'#4A6FE3',borderRadius:12,minHeight:48,padding:14,alignItems:'center'},
 route:{flexDirection:'row',gap:12,paddingVertical:10},dot:{height:10,width:10,borderRadius:5,marginTop:6},address:{fontSize:16,flexShrink:1},
});
