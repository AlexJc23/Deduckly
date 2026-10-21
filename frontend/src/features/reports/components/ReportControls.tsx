import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { View, Text, TextInput, Pressable } from '@/theme/components';
import { CompactSelect } from '@/components/ui/CompactSelect';
import { useLanguage } from '@/i18n/language';
import { useVehicles } from '@/features/vehicles/use-vehicles';
import { api } from '@/api/client';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { updateCurrentUser } from '@/features/auth/api/user.api';
export function ReportControls({year,premium,vehicleId,onVehicle,method,onMethod}:{year:number;premium:boolean;vehicleId:string;onVehicle:(v:string)=>void;method:string;onMethod:(m:string)=>void}){
 const {t}=useLanguage();const {data,owner}=useVehicles();const user=useCurrentUser();const cache=useQueryClient();
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const effective=method||(user.data as {tax_method?:string}|undefined)?.tax_method||'standard_mileage';
 const vehicles=(data?.vehicles??[]);
 async function changeMethod(value:string){setBusy(true);setError('');try{await updateCurrentUser({tax_method:value as 'standard_mileage'|'actual_expenses'});await cache.invalidateQueries({queryKey:['current-user']});onMethod(value);}catch{setError('Connect to save your reporting preference.');}finally{setBusy(false);}}
 return <View style={{gap:12,marginBottom:18}}>
 <CompactSelect label={t('Reporting preference')} value={effective} choices={[{value:'standard_mileage',label:t('Standard Mileage')},{value:'actual_expenses',label:t('Actual Expenses')}]} onChange={v=>void changeMethod(v)} disabled={busy}/>
 <Text style={{fontSize:13,color:'#64748B'}}>{t('Reporting preference only; this does not file a tax election.')} {t('Saved yearly vehicle methods take precedence over the general preference.')}</Text>
 {premium&&<CompactSelect label={t('Vehicle filter')} value={vehicleId} choices={[{value:'',label:t('All Vehicles')},...vehicles.map(v=>({value:v.id,label:`${v.year} ${v.make} ${v.model}`}))]} onChange={onVehicle}/>}
 {vehicles.length>0&&<View><Text>{t('Vehicle reporting assumptions')}</Text><TaxAssumptions key={`${owner}:${vehicleId}:${year}`} year={year} vehicleId={vehicleId} vehicles={vehicles} method={effective}/></View>}
 {!!error&&<Text accessibilityRole="alert">{t(error)}</Text>}
 </View>;
}
function TaxAssumptions({year,vehicleId,vehicles,method}:{year:number;vehicleId:string;vehicles:{id:string;year:number;make:string;model:string}[];method:string}){
 const {t}=useLanguage();const cache=useQueryClient();const [expanded,setExpanded]=useState(false),[selected,setSelected]=useState(vehicleId||vehicles[0]?.id||'');
 const [vehicleMethod,setVehicleMethod]=useState(method);
 const [total,setTotal]=useState(''),[business,setBusiness]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const query=useQuery({queryKey:['vehicle-tax',selected,year],enabled:!!selected&&expanded,queryFn:async()=> (await api.get(`/api/v1/vehicles/${selected}/tax-settings/${year}`)).data});
 useEffect(()=>{if(query.data){setVehicleMethod(query.data.method);setTotal(query.data.total_miles==null?'':String(query.data.total_miles));setBusiness(query.data.business_miles==null?'':String(query.data.business_miles));}},[query.data]);
 async function save(){const totalMiles=Number(total),businessMiles=Number(business);if((total!==''||business!=='')&&(!/^\d+(\.\d{1,2})?$/.test(total)||!/^\d+(\.\d{1,2})?$/.test(business)||totalMiles<=0||businessMiles>totalMiles)){setError('Enter documented total and business mileage; business cannot exceed total.');return;}setBusy(true);setError('');try{await api.put(`/api/v1/vehicles/${selected}/tax-settings/${year}`,{...(query.data??{}),method:vehicleMethod,total_miles:total||null,business_miles:business||null});await cache.invalidateQueries({queryKey:['vehicle-tax']});await cache.invalidateQueries({queryKey:['report']});setExpanded(false);}catch{setError('Connect to save vehicle assumptions. Your entries remain here.');}finally{setBusy(false);}}
 return <View style={{gap:10}}><Pressable accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:'#0072B5'}}>{t(expanded?'Close assumptions':'Review yearly mileage assumptions')} · {year}</Text></Pressable>{expanded&&<>
 <CompactSelect label={t('Vehicle used')} value={selected} choices={vehicles.map(v=>({value:v.id,label:`${v.year} ${v.make} ${v.model}`}))} onChange={id=>{setTotal('');setBusiness('');setSelected(id);}}/>
 <CompactSelect label={t('Method for this vehicle and year')} value={vehicleMethod} choices={[{value:'standard_mileage',label:t('Standard Mileage')},{value:'actual_expenses',label:t('Actual Expenses')}]} onChange={setVehicleMethod}/>
 <Text>{t('Leave mileage blank if records are incomplete. Actual Expenses will remain an incomplete estimate.')}</Text>
 <Text>{t('Use documented business and total mileage for the same vehicle and tax year, including personal and commuting miles in the total.')}</Text>
 <Text>{t('Documented total vehicle miles')}</Text><TextInput accessibilityLabel={t('Documented total vehicle miles')} value={total} onChangeText={setTotal} keyboardType="decimal-pad" style={{minHeight:48,padding:12,borderWidth:1,borderColor:'#E2E8F0',borderRadius:12}}/>
 <Text>{t('Documented business miles')}</Text><TextInput accessibilityLabel={t('Documented business miles')} value={business} onChangeText={setBusiness} keyboardType="decimal-pad" style={{minHeight:48,padding:12,borderWidth:1,borderColor:'#E2E8F0',borderRadius:12}}/>
 <Text>{t('Eligibility requires tax-professional review')}</Text>
 <Pressable disabled={busy||query.isPending||query.isError} accessibilityRole="button" onPress={()=>void save()} style={{minHeight:48,justifyContent:'center'}}><Text>{t(busy?'Saving...':'Save assumptions')}</Text></Pressable>
 {query.isError&&<Text accessibilityRole="alert">{t('Vehicle reporting settings are unavailable. Check your connection or backend update.')}</Text>}
 {!!error&&<Text accessibilityRole="alert">{t(error)}</Text>}
 </>}</View>;
}
