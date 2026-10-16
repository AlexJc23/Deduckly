const finite=(v:unknown):number|null=>v==null||v===''?null:Number.isFinite(Number(v))?Number(v):null;
export function dashboardSummary(report: {total_income?:unknown;total_miles?:unknown;saved_trip_count?:unknown;trip_breakdown?:{trip_count?:unknown}[]} | null | undefined, goal: {goal?:unknown;current?:unknown} | null | undefined) {
 const income=finite(report?.total_income)??finite(goal?.current),target=finite(goal?.goal);
 const percentage=target!==null&&target>0&&income!==null?Math.max(0,Math.round(income/target*100)):0;
 const all=finite(report?.saved_trip_count);
 const business=Array.isArray(report?.trip_breakdown)?report.trip_breakdown.reduce((n:number,r:{trip_count?:unknown})=>n+(finite(r.trip_count)??0),0):null;
 return {income,goal:target!==null&&target>0?target:null,percentage,progress:Math.min(100,percentage),businessMiles:finite(report?.total_miles),trips:all??business,businessTrips:business,allTrips:all!==null};
}
