import { useVehicles } from './use-vehicles';
import { CompactSelect } from '@/components/ui/CompactSelect';
import { useLanguage } from '@/i18n/language';
export function VehicleAssignment({value,onChange,disabled=false}:{value:string|null;onChange:(id:string|null)=>void;disabled?:boolean}){
 const {data}=useVehicles();const {t}=useLanguage();
 const choices=[{value:'',label:t('Unassigned vehicle')},...Object.values(data?.vehicles??{}).filter(v=>!v.deleted||v.id===value).map(v=>({value:v.id,label:`${v.year} ${v.make} ${v.model}${v.deleted?' · '+t('Archived'):''}`}))];
 if(value&&!choices.some(c=>c.value===value))choices.push({value,label:t('Saved vehicle')});
 return <CompactSelect label={t('Vehicle used')} value={value??''} choices={choices} onChange={id=>onChange(id||null)} disabled={disabled}/>;
}
