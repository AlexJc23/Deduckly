from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints.legal import public_router
from app.core.scheduler import start_scheduler

app = FastAPI(title=settings.app_name)

app.include_router(api_router, prefix="/api/v1")
app.include_router(public_router)


@app.on_event("startup")
async def startup_event():
    start_scheduler()