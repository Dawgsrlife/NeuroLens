from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import api

app = FastAPI()

# Allow frontend to communicate (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific domains in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(api.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Backend is running 🚀"}
