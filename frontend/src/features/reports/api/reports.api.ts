import { api } from "@/api/client";
import { localDateString } from "../utils/report-display";
import { CurrentReport } from "../types/report.types";

export type GetReportParams = {
  vehicleId?: string;
  method?: string;
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
    const options = {
      params: {
        vehicle_id:params.vehicleId, method:params.method,
        year: params.year,
        month: params.month,
        day: params.day,
        start_date: params.startDate ? localDateString(params.startDate) : undefined,
        end_date: params.endDate ? localDateString(params.endDate) : undefined,
      },
    };
    try {return (await api.get('/api/v1/reports/vehicle-summary',options)).data;}
    catch(error:any){if(error?.response?.status!==404||error?.response?.data?.detail!=='Not Found')throw error;}
    return (await api.get('/api/v1/reports',options)).data;
    } catch (error) {
      throw error;
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