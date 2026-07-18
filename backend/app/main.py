from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.health import router as health_router
from app.routers.hotels import router as hotels_router
from app.routers.room_types import router as room_types_router


settings.upload_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Hotel Booking System API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(hotels_router)
app.include_router(room_types_router)
app.mount("/media", StaticFiles(directory=settings.upload_dir), name="media")
