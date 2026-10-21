import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
export const reportingDisclosures = [
 'Expo delivers app updates using a persistent installation identifier and runtime/update metadata. Push delivery uses Expo and Apple or Android notification services. These identifiers may persist after logout.',
 'Transactional and support emails use Resend. Endpoint address lookup sends coordinates to the device platform geocoding service. External provider retention is separate from account deletion.',
 'Account deletion removes associated server records and initiates device cleanup. Interrupted device cleanup is retried. Copies you shared elsewhere and provider or backup retention may remain outside this process.',

 'Vehicle profiles, fuel preferences, vehicle assignments and yearly reporting assumptions are stored with your account. Saved vehicles and fuel preferences may also be cached on your device for offline use.',
 'Vehicle catalog requests send selected year, make, model or configuration to the public DOE/EPA FuelEconomy.gov service. Fuel economy is an estimate and can be corrected manually.',
 'No automatic local fuel-price provider is currently configured. Manual or previously cached prices are estimates, not live price guarantees.',
 'During a shift you start, background location detects drives. Included drives become normal Trips only after saving or automatic due processing. You can review Business, Personal and Excluded classifications.',
 'Reports and exports use recorded Trips and expenses. Analyzer fuel estimates are not recorded purchases or tax deductions. Vehicle assignments are not inferred for historical records.',
 'Reporting methods are exploratory preferences, not IRS elections or tax advice. Eligibility, depreciation, lease adjustments, business-use allocation and complete tax returns require review of supporting records.',
 'PDF and CSV exports are available with Deduckly Pro. Vehicle setup and manual fuel-aware analysis remain available without Pro. Automatic pricing is available only where a supported provider is configured.',
] as const;
export function ReportingDisclosures(){const {t}=useLanguage();return <View style={{gap:12,paddingVertical:16}}><Text accessibilityRole="header" style={{fontSize:18,fontWeight:'700'}}>{t('Vehicle, Shift and reporting disclosures')}</Text>{reportingDisclosures.map(c=><Text key={c} style={{fontSize:14,lineHeight:22}}>{t(c)}</Text>)}</View>;}
