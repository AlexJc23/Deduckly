import { VehicleReportBody } from '@/features/reports/components/VehicleReportBody';
import { ReportControls } from '@/features/reports/components/ReportControls';
import { useLanguage, Translated } from "@/i18n/language";
import { ScrollView, Text, View, SafeAreaView, Pressable } from "@/theme/components";
import { StyleSheet } from "react-native";

import { useState } from "react";
import { ReportBody } from "@/features/reports/components/ReportBody";
import { ReportLoadState, ReportSection } from "@/features/reports/components/ReportPresentation";
import { ReportPeriod, ReportPeriodSelector } from "@/features/reports/components/ReportPeriodSelector";
import { QuickActionsCard } from "@/features/reports/components/QuickActionCard";
import { CustomReportModal } from "@/features/reports/modals/CustomReportModal";
import { ExportReportModal } from "@/features/reports/modals/ExportReportModal";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { buildReportParams } from "@/features/reports/utils/build-report-params";
import { reportPeriodLabel } from "@/features/reports/utils/report-display";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function PremiumReportScreen() {
  const { locale, t } = useLanguage();
  const isTablet = useIsTablet();
  const [vehicleId,setVehicleId]=useState('');const [method,setMethod]=useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("month");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState<{ startDate?: Date; endDate?: Date }>({});
  const [exportVisible, setExportVisible] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const reportParams: import("@/features/reports/api/reports.api").GetReportParams = selectedPeriod === "custom" ? customRange : buildReportParams(selectedPeriod);
  const { data, isLoading, isError, isPlaceholderData, refetch } = useCurrentReport({...reportParams,vehicleId:vehicleId||undefined,method:method||undefined});
  const ready = !!data && !isError && !isPlaceholderData && !isLoading;
  const vehicleDetails = useCurrentReport({ ...reportParams, method: method || undefined, vehicleSummary: true }, { enabled: ready && showVehicleDetails && !vehicleId });
  const periodLabel = reportPeriodLabel(reportParams, locale);
  return <SafeAreaView edges={["top", "left", "right"]} style={s.screen}>
    <ScrollView contentContainerStyle={[s.content, isTablet && s.tablet]} showsVerticalScrollIndicator={false}>
      <View style={s.inner}>
        <View style={s.titleRow}><Text accessibilityRole="header" style={s.title}><Translated text={"Reports"} /></Text><Text style={s.badge}><Translated text={"PRO"} /></Text></View>
        <Text style={s.subtitle}><Translated text={"Choose a period to review your activity and estimates."} /></Text>
        <ReportPeriodSelector selected={selectedPeriod} onSelect={period => {
          setExportVisible(false);
          if (period === "custom") setShowCustomModal(true); else setSelectedPeriod(period);
        }} />
        <Text style={s.period}>{<Translated text={periodLabel} />}{selectedPeriod === "month" ? <Translated text={" · Month to date"} /> : selectedPeriod === "year" ? <Translated text={" · Year to date"} /> : ""}</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showPreferences }} onPress={() => setShowPreferences(!showPreferences)} style={s.detailsButton}>
          <Text style={s.detailsLabel}>{t('Filters and reporting preferences')} {showPreferences ? '−' : '+'}{vehicleId ? ` · ${t('Vehicle filter active')}` : ''}</Text>
        </Pressable>
        {showPreferences && <ReportControls year={reportParams.year??reportParams.startDate?.getFullYear()??new Date().getFullYear()} premium vehicleId={vehicleId} onVehicle={v=>{setExportVisible(false);setVehicleId(v);}} method={method} onMethod={setMethod}/>}

        {!ready ? <ReportLoadState loading={isLoading || isPlaceholderData} retry={() => void refetch()} /> : <>
          <ReportBody report={data} />
          {!vehicleId && <ReportSection title="Vehicle breakdown">
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: showVehicleDetails }} onPress={() => setShowVehicleDetails(!showVehicleDetails)} style={s.detailsButton}>
              <Text style={s.detailsLabel}>{t(showVehicleDetails ? 'Hide vehicle details' : 'Show vehicle details')}</Text>
            </Pressable>
            {showVehicleDetails && <>
              <Text style={s.subtitle}>{t('Vehicle estimates use your saved yearly assumptions.')}</Text>
              {vehicleDetails.data && !vehicleDetails.isError && !vehicleDetails.isPlaceholderData
                ? <VehicleReportBody report={vehicleDetails.data} detailsOnly />
                : <ReportLoadState loading={vehicleDetails.isLoading || vehicleDetails.isPlaceholderData} retry={() => void vehicleDetails.refetch()} />}
            </>}
          </ReportSection>}
          <ReportSection title="Use this report" description="Export the figures above or review their tax details.">
            <QuickActionsCard report={data} reportParams={reportParams} onExport={() => setExportVisible(true)} />
          </ReportSection>
        </>}
      </View>
    </ScrollView>
    {ready && <ExportReportModal report={data} periodLabel={periodLabel} visible={exportVisible} onClose={() => setExportVisible(false)} />}
    <CustomReportModal visible={showCustomModal} onClose={() => setShowCustomModal(false)} onGenerate={(startDate, endDate) => {
      setCustomRange({ startDate, endDate }); setSelectedPeriod("custom"); setShowCustomModal(false);
    }} />
  </SafeAreaView>;
}
const s = StyleSheet.create({ detailsButton: { minHeight: 48, justifyContent: 'center' }, detailsLabel: { color: '#0072B5', fontWeight: '600' }, screen: { flex: 1, backgroundColor: "#F6F8FB" }, content: { padding: 20, paddingBottom: 40 }, tablet: { padding: 34 }, inner: { width: "100%", maxWidth: 1000, alignSelf: "center" }, titleRow: { flexDirection: "row", alignItems: "center", gap: 12 }, title: { fontSize: 32, fontWeight: "700", color: "#273449", letterSpacing: -0.7 }, badge: { fontSize: 11, color: "#0072B5", backgroundColor: "#EAF3FA", padding: 7, borderRadius: 6, fontWeight: "700" }, subtitle: { fontSize: 14, lineHeight: 21, color: "#64748B", marginTop: 8, marginBottom: 20 }, period: { color: "#0072B5", fontSize: 15, fontWeight: "600", marginTop: 18, marginBottom: 26 } });
