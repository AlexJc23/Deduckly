import { api } from "@/api/client";
import { localDateString } from "../utils/report-display";
import { CurrentReport } from "../types/report.types";

export type GetReportParams = {
  vehicleId?: string;
  vehicleSummary?: boolean;
  method?: string;
  year?: number;
  month?: number;
  day?: number | null;
  startDate?: Date;
  endDate?: Date;
};

export async function getReport(params: GetReportParams): Promise<CurrentReport> {
  const options = { params: {
    vehicle_id: params.vehicleId, method: params.method,
    year: params.year, month: params.month, day: params.day,
    start_date: params.startDate ? localDateString(params.startDate) : undefined,
    end_date: params.endDate ? localDateString(params.endDate) : undefined,
  } };
  // Vehicle reporting is an explicit addition, never a replacement for basic reports.
  if (params.vehicleId || params.vehicleSummary) {
    return (await api.get('/api/v1/reports/vehicle-summary', options)).data;
  }
  try {
    return (await api.get('/api/v1/reports', options)).data;
  } catch (error: unknown) {
    const failure = error as { response?: { status: number; data?: { detail?: string } } };
    // Missing tax tables must not hide historical income, expenses and mileage.
    // Do not swallow authorization, network, or unrelated server failures.
    if (failure.response?.status !== 404 || failure.response.data?.detail !== 'No tax brackets found') throw error;
    return (await api.get('/api/v1/reports/vehicle-summary', options)).data;
  }
}

export async function getTodayReport() {
  const response = await api.get("/api/v1/reports/today");
  return response.data
}

export async function exportPdf(report: CurrentReport) {
  if(report.report_version===2) {
    const response=await api.get('/api/v1/reports/vehicle-exports/pdf',{params:{year:report.year,month:report.month,day:report.day,start_date:report.start_date,end_date:report.end_date,vehicle_id:report.vehicle_filter,method:report.tax_method,expected_fingerprint:report.report_fingerprint},responseType:'arraybuffer'});return response.data;
  }
  const response = await api.post("/api/v1/reports/exports/pdf", 
    report,
    {
      responseType: "arraybuffer",
    }
  );
  return response.data
}

export async function exportCsv(report: CurrentReport) {
  if(report.report_version===2) {
    const response=await api.get('/api/v1/reports/vehicle-exports/csv',{params:{year:report.year,month:report.month,day:report.day,start_date:report.start_date,end_date:report.end_date,vehicle_id:report.vehicle_filter,method:report.tax_method,expected_fingerprint:report.report_fingerprint},responseType:'arraybuffer'});return response.data;
  }
  const response = await api.post("/api/v1/reports/exports/csv", 
    report,
    {
      responseType: "arraybuffer",
    }
  );
  return response.data
}