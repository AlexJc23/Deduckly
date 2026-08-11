import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import { CurrentReport } from "../types/report.types";
import { exportCsv, exportPdf } from "../api/reports.api";
import { saveFile } from "../utils/save-file";

type ExportReportModalProps = {
  report: CurrentReport;
  visible: boolean;
  onClose: () => void;
};

export function ExportReportModal({
  report,
  visible,
  onClose,
}: ExportReportModalProps) {
  const [isMounted, setIsMounted] =
    useState(visible);

  const [format, setFormat] =
    useState<"pdf" | "csv">("pdf");

  const [isExporting, setIsExporting] =
    useState(false);

  const translateY = useRef(
    new Animated.Value(420),
  ).current;

  const handleClose = () => {
    if (isExporting) return;

    setFormat("pdf");
    onClose();
  };

  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      if (format === "pdf") {
        const pdf = await exportPdf(report);

        await saveFile(
          pdf,
          "Deduckly_Report.pdf",
          "application/pdf",
        );
      } else {
        const csv = await exportCsv(report);

        await saveFile(
          csv,
          "Deduckly_Report.csv",
          "text/csv",
        );
      }

      handleClose();
    } catch (error) {
      console.error(
        "Failed to export report:",
        error,
      );
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const animation = Animated.timing(
      translateY,
      {
        toValue: visible ? 0 : 420,
        duration: 300,
        easing: visible
          ? Easing.out(Easing.ease)
          : Easing.in(Easing.ease),
        useNativeDriver: true,
      },
    );

    if (visible) {
      setIsMounted(true);
      animation.start();
      return;
    }

    animation.start(() => {
      setIsMounted(false);
    });
  }, [visible, translateY]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                REPORTS
              </Text>

              <Text style={styles.title}>
                Export Report
              </Text>

              <Text style={styles.subtitle}>
                Choose how you'd like to save
                your report.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="download-outline"
                size={19}
                color="#4A6FE3"
              />
            </View>
          </View>

          <View style={styles.options}>
            <Pressable
              onPress={() =>
                setFormat("pdf")
              }
              style={({ pressed }) => [
                styles.option,
                format === "pdf" &&
                  styles.optionSelected,
                pressed &&
                  styles.optionPressed,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  format === "pdf" &&
                    styles.optionIconSelected,
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={
                    format === "pdf"
                      ? "#4A6FE3"
                      : "#64748B"
                  }
                />
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    format === "pdf" &&
                      styles.optionTitleSelected,
                  ]}
                >
                  PDF
                </Text>

                <Text style={styles.optionSubtitle}>
                  Formatted report for sharing
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  format === "pdf" &&
                    styles.radioSelected,
                ]}
              >
                {format === "pdf" && (
                  <View
                    style={styles.radioDot}
                  />
                )}
              </View>
            </Pressable>

            <Pressable
              onPress={() =>
                setFormat("csv")
              }
              style={({ pressed }) => [
                styles.option,
                format === "csv" &&
                  styles.optionSelected,
                pressed &&
                  styles.optionPressed,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  format === "csv" &&
                    styles.optionIconSelected,
                ]}
              >
                <Ionicons
                  name="grid-outline"
                  size={19}
                  color={
                    format === "csv"
                      ? "#4A6FE3"
                      : "#64748B"
                  }
                />
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    format === "csv" &&
                      styles.optionTitleSelected,
                  ]}
                >
                  CSV
                </Text>

                <Text style={styles.optionSubtitle}>
                  Spreadsheet-ready data
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  format === "csv" &&
                    styles.radioSelected,
                ]}
              >
                {format === "csv" && (
                  <View
                    style={styles.radioDot}
                  />
                )}
              </View>
            </Pressable>
          </View>

          <Pressable
            disabled={isExporting}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed &&
                styles.primaryButtonPressed,
              isExporting &&
                styles.buttonDisabled,
            ]}
            onPress={handleExport}
          >
            <Ionicons
              name={
                isExporting
                  ? "hourglass-outline"
                  : "download-outline"
              }
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.primaryText}>
              {isExporting
                ? "Exporting..."
                : `Export ${format.toUpperCase()}`}
            </Text>
          </Pressable>

          <Pressable
            disabled={isExporting}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed &&
                styles.secondaryButtonPressed,
            ]}
            onPress={handleClose}
          >
            <Text style={styles.secondaryText}>
              Cancel
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(15, 23, 42, 0.42)",
  },

  sheet: {
    backgroundColor: "#FCFDFE",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: "#E8ECF2",
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 14,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#273449",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  options: {
    gap: 10,
  },

  option: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E7EBF1",
  },

  optionSelected: {
    backgroundColor: "#F5F7FF",
    borderColor: "#C9D5FA",
  },

  optionPressed: {
    transform: [{ scale: 0.985 }],
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  optionIconSelected: {
    backgroundColor: "#E8EEFF",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },

  optionTitleSelected: {
    color: "#273449",
    fontWeight: "800",
  },

  optionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#94A3B8",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#4A6FE3",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A6FE3",
  },

  primaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    backgroundColor: "#4A6FE3",
    borderRadius: 14,
  },

  primaryButtonPressed: {
    backgroundColor: "#3F61C9",
    transform: [{ scale: 0.985 }],
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonPressed: {
    opacity: 0.55,
  },

  secondaryText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
});