import { api } from "@/api/client"

export async function  getWeeklyGoal() {
    const response = await api.get("/api/v1/users/me/weekly-goal");

    return response.data
}