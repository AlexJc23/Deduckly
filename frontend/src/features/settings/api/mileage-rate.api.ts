import { api } from "@/api/client";

export async function getMileageRates() {
    const response = await api.get('/api/v1/admin/mileage-rate')

    return response.data
}