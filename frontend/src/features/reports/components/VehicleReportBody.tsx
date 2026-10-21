import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import type { CurrentReport } from '../types/report.types';
export function VehicleReportBody({report:r}:{report:CurrentReport}){
 const {t,locale}=useLanguage();
 const money=(v:unknown)=>v==null?'—':new Intl.NumberFormat(locale,{style:'currency',currency:'USD'}).format(Number(v));
 const row=(label:string,value:string)=><View key={label} style={{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:8,paddingVertical:8}}><Text style={{flexShrink:1}}>{t(label)}</Text><Text style={{fontWeight:'700'}}>{value}</Text></View>;
 return <View style={{gap:16}}>
 <View style={{padding:16,borderRadius:18,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'}}>
 {row('Total income',money(r.total_income))}{row('Recorded expenses',money(r.total_expenses))}{row('Business miles',String(r.total_miles))}{row('Personal miles',String(r.personal_miles??0))}
 {row('Estimated deductions',money(r.total_deductions))}{row('Business parking and tolls',money(r.parking_tolls))}{row('Other business deductions',money(r.non_vehicle_deductions))}
 <Text>{t(r.calculation_complete?'Estimate based on recorded inputs':'Incomplete estimate: required inputs are missing')}</Text>
 <Text>{t('Reporting preference only; this does not file a tax election.')}</Text>
 </View>
 {r.vehicle_rows?.map(v=><View key={v.vehicle_id??'none'} style={{padding:14,borderRadius:16,backgroundColor:'#FFFFFF',gap:8}}><Text accessibilityRole="header" style={{fontWeight:'700'}}>{v.vehicle_name==='Unassigned vehicle'?t(v.vehicle_name):v.vehicle_name}</Text><Text>{t(v.method==='standard_mileage'?'Standard Mileage':'Actual Expenses')}</Text>{r.advanced&&<><Text>{t('Business miles')}: {v.business_miles} · {t('Personal miles')}: {v.personal_miles}</Text><Text>{t('Business use')}: {v.business_use_percentage==null?'—':`${v.business_use_percentage}%`}</Text>{row('Standard estimate',money(v.standard))}{row('Actual operating subtotal',money(v.actual))}</>}<Text>{t('Eligibility requires tax-professional review')}</Text></View>)}
 {r.advanced&&<View>{row('Standard estimate',money(r.comparison_standard))}{row('Actual operating subtotal',money(r.comparison_actual))}<Text>{t('Comparisons are informational and may be incomplete.')}</Text></View>}
 {!!r.trends?.length&&<View><Text accessibilityRole="header">{t('Income and expense trends')}</Text>{r.trends.map(v=>row(v.period,`${money(v.income)} / ${money(v.expenses)}`))}</View>}
 {!!r.rate_periods?.length&&<View><Text>{t('IRS rates used')}</Text>{r.rate_periods.map(v=><Text key={v.rate}>${v.rate} / {t('mile')} · {v.miles} {t('miles')} · {v.effective_start} – {v.effective_end}</Text>)}</View>}
 <View style={{gap:8}}>{r.caveats?.map(c=><Text key={c} style={{fontSize:13,lineHeight:19,color:'#64748B'}}>{t(c)}</Text>)}</View>
 </View>;
}
