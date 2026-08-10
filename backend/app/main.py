from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import RoleEnum, User
from app.routers import admin, auth, movies, ratings
from app.security import hash_password

app = FastAPI(title="Personal Movie Showcase API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(ratings.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    # Create tables if they don't exist yet.
    Base.metadata.create_all(bind=engine)

    # Bootstrap a first admin account so there's always a way in.
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == RoleEnum.admin).first()
        if not existing_admin:
            admin_user = User(
                username=settings.FIRST_ADMIN_USERNAME,
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=RoleEnum.admin,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "service": "movie-showcase-api"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

