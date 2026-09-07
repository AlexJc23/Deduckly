import { api } from "@/api/client";
import { localDateString } from "../utils/report-display";
import { CurrentReport } from "../types/report.types";

export type GetReportParams = {
  year?: number;
  month?: number;
  day?: number;
  startDate?: Date;
  endDate?: Date;
};

export async function getReport(
  params: GetReportParams
) {
  try {
    const response = await api.get("/api/v1/reports", {
      params: {
        year: params.year,
        month: params.month,
        day: params.day,
        start_date: params.startDate ? localDateString(params.startDate) : undefined,
        end_date: params.endDate ? localDateString(params.endDate) : undefined,
      },
    });

    return response.data;
    } catch (error) {
      throw error;
    }
}

export async function getTodayReport() {
  const response = await api.get("/api/v1/reports/today");
  return response.data
}

export async function exportPdf(report: CurrentReport) {
  const response = await api.post("/api/v1/reports/exports/pdf", 
    report,
    {
      responseType: "arraybuffer",
    }
  );
  return response.data
}

export async function exportCsv(report: CurrentReport) {
  const response = await api.post("/api/v1/reports/exports/csv", 
    report,
    {
      responseType: "arraybuffer",
    }
  );
  return response.data
}