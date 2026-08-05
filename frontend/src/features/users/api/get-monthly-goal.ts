import { api } from "@/api/client"

export async function  getMonthlyGoal() {
    const response = await api.get("/api/v1/users/me/monthly-goal");

    return response.data
}