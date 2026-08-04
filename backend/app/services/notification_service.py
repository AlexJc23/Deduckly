import httpx


EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_push_notification(
    token: str,
    title: str,
    body: str,
):
    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            EXPO_PUSH_URL,
            json=payload,
        )

    response.raise_for_status()

    return response.json()