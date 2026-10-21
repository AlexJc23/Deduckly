import { Image, StyleSheet } from 'react-native';
import { View, Text, Pressable } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { platformIcons, type PlatformName } from '@/constants/platform-icons';
import { SHIFT_PLATFORMS, platformName } from '@/features/shifts/presentation';
export function PlatformTiles({value,onChange,disabled=false,platforms=[...SHIFT_PLATFORMS,null]}:{value:string|null;onChange:(value:string|null)=>void;disabled?:boolean;platforms?:readonly (string|null)[]}) {
 const {t}=useLanguage();
 return <View style={s.grid}>{platforms.map(p=><Pressable key={p??'none'} accessibilityRole="button" accessibilityLabel={t(platformName(p))} accessibilityState={{selected:p===value,disabled}} disabled={disabled} onPress={()=>onChange(p)} style={[s.tile,p===value&&s.selected,disabled&&{opacity:.5}]}>
  {p&&p in platformIcons&&<Image accessibilityIgnoresInvertColors accessible={false} source={platformIcons[p as PlatformName]} style={{width:28,height:24,borderRadius:4,backgroundColor:p==='uber'||p==='amazon_flex'?'#FFFFFF':undefined}} resizeMode="contain"/>}<Text style={{fontSize:12,fontWeight:'600',textAlign:'center'}}>{t(platformName(p))}</Text>
 </Pressable>)}</View>;
}
const s=StyleSheet.create({grid:{flexDirection:'row',flexWrap:'wrap',gap:8},tile:{flexBasis:88,flexGrow:1,maxWidth:160,minHeight:64,borderRadius:12,padding:8,alignItems:'center',justifyContent:'center',gap:6,backgroundColor:'#F8FAFC',borderWidth:1,borderColor:'#E2E8F0'},selected:{borderColor:'#0072B5',backgroundColor:'#E8EEFF',borderWidth:2}});
