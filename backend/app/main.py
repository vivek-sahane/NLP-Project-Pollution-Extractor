from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import health, analyze, history, dashboard, model_routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Academic AI/NLP API for extracting structured pollution information from unstructured text.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local frontend development requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def enforce_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 12 * 1024 * 1024:
        return JSONResponse(status_code=413, content={"detail": "Request exceeds the 12 MB limit."})
    return await call_next(request)

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(analyze.router, prefix=settings.API_V1_STR, tags=["Analysis & Extraction"])
app.include_router(history.router, prefix=settings.API_V1_STR, tags=["History & Data Management"])
app.include_router(dashboard.router, prefix=settings.API_V1_STR, tags=["Dashboard Analytics"])
app.include_router(model_routes.router, prefix=settings.API_V1_STR, tags=["Model Performance"])

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API v{settings.VERSION}",
        "docs": "/docs",
        "health": "/api/health"
    }
