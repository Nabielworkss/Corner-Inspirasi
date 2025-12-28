from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'm5N6oP7qR8sT9uV0wX1yZ2aB3cD4eF5g')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
WHITELISTED_EMAILS = ["nabielworks25@gmail.com"]  # Add more as needed

# Login attempts tracking (simple in-memory, use Redis in production)
login_attempts = {}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

# Create uploads directory
UPLOAD_DIR = Path(__file__).parent.parent / "frontend" / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Create the main app
app = FastAPI(title="Corner Inspirasi CMS API")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    slug: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    featured_image: Optional[str] = None
    category: Optional[dict] = None
    author: Optional[dict] = None
    views: int = 0
    is_featured: bool = False
    publishedAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ArticleCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    featured_image: Optional[str] = None
    category_id: Optional[str] = None
    author_id: Optional[str] = None
    is_featured: bool = False

class LoginRequest(BaseModel):
    identifier: str  # email
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

# Auth Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # Check if token is expired
        if datetime.fromtimestamp(payload.get("exp", 0)) < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token telah kadaluarsa. Silakan login kembali.")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token telah kadaluarsa. Silakan login kembali.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token tidak valid. Silakan login kembali.")

def check_login_attempts(email: str):
    """Check if user is locked out due to too many failed attempts"""
    if email in login_attempts:
        attempts, last_attempt = login_attempts[email]
        if attempts >= MAX_LOGIN_ATTEMPTS:
            lockout_end = last_attempt + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            if datetime.utcnow() < lockout_end:
                remaining = int((lockout_end - datetime.utcnow()).total_seconds() / 60)
                raise HTTPException(
                    status_code=429,
                    detail=f"Terlalu banyak percobaan login. Coba lagi dalam {remaining} menit."
                )
            else:
                # Reset after lockout period
                login_attempts.pop(email, None)

def record_failed_login(email: str):
    """Record a failed login attempt"""
    if email in login_attempts:
        attempts, _ = login_attempts[email]
        login_attempts[email] = (attempts + 1, datetime.utcnow())
    else:
        login_attempts[email] = (1, datetime.utcnow())

def clear_login_attempts(email: str):
    """Clear login attempts after successful login"""
    login_attempts.pop(email, None)

# Routes
@api_router.get("/")
async def root():
    return {"message": "Corner Inspirasi CMS API", "version": "1.0.0"}

# Auth Routes
@api_router.post("/auth/register")
async def register(request: RegisterRequest):
    # Check if registration is allowed
    if request.email not in WHITELISTED_EMAILS:
        raise HTTPException(
            status_code=403,
            detail="Registrasi publik tidak diperbolehkan. Hubungi administrator."
        )
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    # Create user
    hashed_password = pwd_context.hash(request.password)
    user_dict = {
        "id": str(uuid.uuid4()),
        "username": request.username,
        "email": request.email,
        "password": hashed_password,
        "full_name": request.full_name,
        "role": "editor",  # Default role
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"user_id": user_dict["id"], "email": user_dict["email"]})
    
    return {
        "jwt": token,
        "user": {
            "id": user_dict["id"],
            "username": user_dict["username"],
            "email": user_dict["email"]
        }
    }

@api_router.post("/auth/local")
async def login(request: LoginRequest):
    # Check login attempts
    check_login_attempts(request.identifier)
    
    # Find user
    user = await db.users.find_one({"email": request.identifier})
    if not user:
        record_failed_login(request.identifier)
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    # Verify password
    if not pwd_context.verify(request.password, user["password"]):
        record_failed_login(request.identifier)
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    # Clear failed attempts on successful login
    clear_login_attempts(request.identifier)
    
    # Create token
    token = create_access_token({
        "user_id": user["id"],
        "email": user["email"],
        "role": user.get("role", "editor")
    })
    
    return {
        "jwt": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user.get("role", "editor")
        }
    }

# Image Upload
@api_router.post("/upload", dependencies=[Depends(verify_token)])
async def upload_image(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF")
    
    # Validate file size (max 5MB)
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB
    for chunk in iter(lambda: file.file.read(chunk_size), b""):
        file_size += len(chunk)
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(status_code=400, detail="Ukuran file terlalu besar. Maksimal 5MB")
    
    # Reset file pointer
    file.file.seek(0)
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": unique_filename,
        "original_filename": file.filename
    }

# Category Routes
@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find().to_list(1000)
    return {
        "data": [
            {
                "id": cat["id"],
                "attributes": {
                    "name": cat["name"],
                    "slug": cat["slug"],
                    "createdAt": cat.get("createdAt"),
                    "updatedAt": cat.get("updatedAt")
                }
            } for cat in categories
        ]
    }

@api_router.post("/categories", dependencies=[Depends(verify_token)])
async def create_category(category: CategoryCreate):
    category_dict = category.dict()
    category_obj = Category(**category_dict)
    await db.categories.insert_one(category_obj.dict())
    return {
        "data": {
            "id": category_obj.id,
            "attributes": category_dict
        }
    }

# Validate token endpoint (for frontend to check auth status)
@api_router.get("/auth/validate", dependencies=[Depends(verify_token)])
async def validate_token_endpoint():
    return {"valid": True}

# Article Routes
@api_router.get("/articles")
async def get_articles(
    filters_slug: Optional[str] = None,
    filters_category_slug: Optional[str] = None,
    filters_is_featured: Optional[bool] = None,
    sort: Optional[str] = None,
    pagination_limit: int = 25,
    pagination_start: int = 0,
    populate: Optional[str] = None
):
    query = {}
    
    # Handle filters
    if filters_slug:
        query["slug"] = filters_slug
    if filters_is_featured is not None:
        query["is_featured"] = filters_is_featured
    if filters_category_slug:
        category = await db.categories.find_one({"slug": filters_category_slug})
        if category:
            query["category_id"] = category["id"]
    
    # Handle sorting
    sort_by = [("createdAt", -1)]  # Default: newest first
    if sort:
        if sort == "views:desc":
            sort_by = [("views", -1)]
        elif sort == "views:asc":
            sort_by = [("views", 1)]
    
    # Query articles
    articles = await db.articles.find(query).sort(sort_by).skip(pagination_start).limit(pagination_limit).to_list(pagination_limit)
    
    # Populate relations if requested
    result = []
    for article in articles:
        article_data = {
            "id": article["id"],
            "attributes": {
                "title": article["title"],
                "slug": article["slug"],
                "excerpt": article["excerpt"],
                "content": article["content"],
                "featured_image": article.get("featured_image"),
                "views": article.get("views", 0),
                "is_featured": article.get("is_featured", False),
                "publishedAt": article.get("publishedAt"),
                "createdAt": article.get("createdAt"),
                "updatedAt": article.get("updatedAt")
            }
        }
        
        # Populate category
        if populate and article.get("category_id"):
            category = await db.categories.find_one({"id": article["category_id"]})
            if category:
                article_data["attributes"]["category"] = {
                    "data": {
                        "id": category["id"],
                        "attributes": {
                            "name": category["name"],
                            "slug": category["slug"]
                        }
                    }
                }
        
        # Populate author
        if populate and article.get("author_id"):
            author = await db.users.find_one({"id": article["author_id"]})
            if author:
                article_data["attributes"]["author"] = {
                    "data": {
                        "id": author["id"],
                        "attributes": {
                            "username": author["username"],
                            "email": author["email"],
                            "full_name": author.get("full_name")
                        }
                    }
                }
        
        result.append(article_data)
    
    return {"data": result}

@api_router.get("/articles/{id}")
async def get_article_by_id(id: str, populate: Optional[str] = None):
    article = await db.articles.find_one({"id": id})
    if not article:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    
    # Increment views
    await db.articles.update_one(
        {"id": id},
        {"$inc": {"views": 1}}
    )
    article["views"] = article.get("views", 0) + 1
    
    article_data = {
        "id": article["id"],
        "attributes": {
            "title": article["title"],
            "slug": article["slug"],
            "excerpt": article["excerpt"],
            "content": article["content"],
            "featured_image": article.get("featured_image"),
            "views": article.get("views", 0),
            "is_featured": article.get("is_featured", False),
            "publishedAt": article.get("publishedAt"),
            "createdAt": article.get("createdAt"),
            "updatedAt": article.get("updatedAt")
        }
    }
    
    # Populate relations
    if populate and article.get("category_id"):
        category = await db.categories.find_one({"id": article["category_id"]})
        if category:
            article_data["attributes"]["category"] = {
                "data": {
                    "id": category["id"],
                    "attributes": {"name": category["name"], "slug": category["slug"]}
                }
            }
    
    if populate and article.get("author_id"):
        author = await db.users.find_one({"id": article["author_id"]})
        if author:
            article_data["attributes"]["author"] = {
                "data": {
                    "id": author["id"],
                    "attributes": {
                        "username": author["username"],
                        "email": author["email"]
                    }
                }
            }
    
    return {"data": article_data}

@api_router.post("/articles", dependencies=[Depends(verify_token)])
async def create_article(article: ArticleCreate, payload: dict = Depends(verify_token)):
    article_dict = article.dict()
    article_dict["id"] = str(uuid.uuid4())
    article_dict["views"] = 0
    article_dict["author_id"] = payload["user_id"]
    article_dict["publishedAt"] = datetime.utcnow()
    article_dict["createdAt"] = datetime.utcnow()
    article_dict["updatedAt"] = datetime.utcnow()
    
    await db.articles.insert_one(article_dict)
    
    return {
        "data": {
            "id": article_dict["id"],
            "attributes": article_dict
        }
    }

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
