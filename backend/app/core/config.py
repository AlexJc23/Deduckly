from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    apple_client_id: str = "com.karlsonworks.deduckly"
    apple_team_id: str = ""
    apple_key_id: str = ""
    apple_private_key: str = ""

    app_name: str
    debug: bool
    database_url: str
    secret_key: str
    access_token_expire_minutes: int
    algorithm: str
    fernet_key: str
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    google_frontend_redirect_uri: str
    aws_access_key: str
    aws_secret_key: str
    aws_region: str
    s3_bucket: str
    resend_api_key: str
    from_email: str
    support_email: str

    class Config:
        env_file = ".env"


settings = Settings()




