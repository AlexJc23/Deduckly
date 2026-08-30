import { api } from "@/api/client"

export async function  getDailyGoal() {
    const response = await api.get("/api/v1/users/me/daily-goal");

    return response.data
}