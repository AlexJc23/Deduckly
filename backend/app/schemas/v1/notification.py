from pydantic import BaseModel


class PushTokenUpdate(BaseModel):
    expo_push_token: str