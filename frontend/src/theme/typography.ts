import { Platform, type TextStyle } from 'react-native';
export const dashboardType: Record<string, TextStyle> = {
 body:{fontFamily:Platform.OS==='ios'?'System':'sans-serif',fontSize:14,lineHeight:20},
 title:{fontSize:18,lineHeight:24,fontWeight:'700'},
 amount:{fontSize:34,lineHeight:40,fontWeight:'700',fontVariant:['tabular-nums']},
 metric:{fontSize:20,lineHeight:25,fontWeight:'700',fontVariant:['tabular-nums']},
 label:{fontSize:12,lineHeight:17,fontWeight:'400'},
};
