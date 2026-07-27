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
import { CurrentReport } from "../types/report.types";
import { exportCsv, exportPdf } from "../api/reports.api";
import { saveFile } from "../utils/save-file";

type ExportReportModalProps = {
    report: CurrentReport,
    visible: boolean;
    onClose: () => void;
};

export function ExportReportModal({
    report,
    visible,
    onClose,
}: ExportReportModalProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");

  const translateY = useRef(new Animated.Value(420)).current;

  const handleClose = () => {
    setFormat("pdf");
    onClose();
  };

  const handleExport = async () => {
    if (format === "pdf") {
        const pdf = await exportPdf(report);

        await saveFile(
        pdf,
        "Deduckly_Report.pdf",
        "application/pdf"
        );
    } else {
        const csv = await exportCsv(report);

        await saveFile(
        csv,
        "Deduckly_Report.csv",
        "text/csv"
        );
    }

    handleClose();
    };

  useEffect(() => {
    const animation = Animated.timing(translateY, {
      toValue: visible ? 0 : 420,
      duration: 300,
      easing: visible
        ? Easing.out(Easing.ease)
        : Easing.in(Easing.ease),
      useNativeDriver: true,
    });

    if (visible) {
      setIsMounted(true);
      animation.start();
      return;
    }

    animation.start(() => {
      setIsMounted(false);
    });
  }, [visible, translateY]);

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
          <Text style={styles.title}>
            Export Report
          </Text>

          <Text style={styles.subtitle}>
            Choose a file format.
          </Text>

          <Pressable
            onPress={() => setFormat("pdf")}
            style={[
              styles.option,
              {
                borderColor:
                  format === "pdf"
                    ? "#007AFF"
                    : "#DDD",
              },
            ]}
          >
            <Text>PDF</Text>
          </Pressable>

          <Pressable
            onPress={() => setFormat("csv")}
            style={[
              styles.option,
              {
                borderColor:
                  format === "csv"
                    ? "#007AFF"
                    : "#DDD",
              },
            ]}
          >
            <Text>CSV</Text>
          </Pressable>

          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
            try {
                await handleExport();
                handleClose();
            } catch (error) {
                console.error(error);
            }
            }}
          >
            <Text>Export</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleClose}
          >
            <Text>Cancel</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 340,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  option: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 32,
    alignItems: "center",
    paddingVertical: 16,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 16,
  },
});