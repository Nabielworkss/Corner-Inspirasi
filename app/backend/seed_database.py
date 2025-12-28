import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import uuid
from datetime import datetime

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    print("🌱 Seeding Corner Inspirasi CMS Database...")
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.users.delete_many({})
    await db.articles.delete_many({})
    
    # Create Categories
    categories = [
        {"id": str(uuid.uuid4()), "name": "Nasional", "slug": "nasional", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "name": "Daerah", "slug": "daerah", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "name": "Ekonomi", "slug": "ekonomi", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "name": "Pendidikan", "slug": "pendidikan", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "name": "Lifestyle", "slug": "lifestyle", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "name": "Komunitas", "slug": "komunitas", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    ]
    
    await db.categories.insert_many(categories)
    print(f"✅ Created {len(categories)} categories")
    
    # Create Super Admin User
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "superadmin",
        "email": "nabielworks25@gmail.com",
        "password": pwd_context.hash("admin123"),  # Change this password!
        "full_name": "Super Admin",
        "bio": "Administrator Corner Inspirasi",
        "role": "super_admin",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    await db.users.insert_one(admin_user)
    print(f"✅ Created admin user: {admin_user['email']}")
    print(f"   Password: admin123 (PLEASE CHANGE THIS!)")
    
    # Create Sample Editor
    editor_user = {
        "id": str(uuid.uuid4()),
        "username": "editor1",
        "email": "editor@cornerinspirasi.id",
        "password": pwd_context.hash("editor123"),
        "full_name": "Editor Redaksi",
        "bio": "Editor Corner Inspirasi",
        "role": "editor",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    await db.users.insert_one(editor_user)
    print(f"✅ Created editor user: {editor_user['email']}")
    
    # Create Sample Articles
    sample_articles = [
        {
            "id": str(uuid.uuid4()),
            "title": "Pemerintah Luncurkan Program Digitalisasi Pendidikan Nasional 2025",
            "slug": "pemerintah-luncurkan-program-digitalisasi-pendidikan-nasional-2025",
            "excerpt": "Kementerian Pendidikan mengumumkan program transformasi digital yang akan menjangkau 50.000 sekolah di seluruh Indonesia.",
            "content": "<p>Jakarta - Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek) resmi meluncurkan Program Digitalisasi Pendidikan Nasional 2025. Program ambisius ini ditargetkan akan menjangkau 50.000 sekolah di seluruh Indonesia.</p><p>Menteri Pendidikan menyatakan bahwa program ini merupakan bagian dari upaya pemerintah untuk meningkatkan kualitas pendidikan dan mempersiapkan generasi muda Indonesia menghadapi tantangan era digital.</p>",
            "featured_image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
            "category_id": categories[3]["id"],  # Pendidikan
            "author_id": admin_user["id"],
            "views": 1524,
            "is_featured": True,
            "publishedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Ekonomi Indonesia Tumbuh 5.8% di Kuartal IV 2024",
            "slug": "ekonomi-indonesia-tumbuh-58-persen-kuartal-iv-2024",
            "excerpt": "Badan Pusat Statistik mencatat pertumbuhan ekonomi yang melampaui target pemerintah, didorong oleh konsumsi domestik yang kuat.",
            "content": "<p>Jakarta - Badan Pusat Statistik (BPS) mengumumkan bahwa ekonomi Indonesia tumbuh 5.8% pada kuartal IV 2024, melampaui target pemerintah sebesar 5.5%.</p><p>Pertumbuhan ini didorong oleh konsumsi rumah tangga yang kuat serta peningkatan investasi di sektor infrastruktur dan manufaktur.</p>",
            "featured_image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
            "category_id": categories[2]["id"],  # Ekonomi
            "author_id": admin_user["id"],
            "views": 892,
            "is_featured": True,
            "publishedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Surabaya Raih Penghargaan Kota Terbersih Se-Asia Tenggara",
            "slug": "surabaya-raih-penghargaan-kota-terbersih-se-asia-tenggara",
            "excerpt": "Program pengelolaan sampah terpadu dan partisipasi warga menjadi kunci keberhasilan.",
            "content": "<p>Surabaya - Kota Surabaya berhasil meraih penghargaan sebagai Kota Terbersih Se-Asia Tenggara 2025 dalam ASEAN Clean City Award yang diselenggarakan di Bangkok.</p><p>Walikota Surabaya menyampaikan bahwa pencapaian ini merupakan hasil kerja keras seluruh masyarakat Surabaya dalam menjaga kebersihan dan kelestarian lingkungan.</p>",
            "featured_image": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
            "category_id": categories[1]["id"],  # Daerah
            "author_id": editor_user["id"],
            "views": 654,
            "is_featured": False,
            "publishedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    await db.articles.insert_many(sample_articles)
    print(f"✅ Created {len(sample_articles)} sample articles")
    
    print("\n🎉 Database seeding completed!")
    print("\n📝 Login Credentials:")
    print(f"   Admin: nabielworks25@gmail.com / admin123")
    print(f"   Editor: editor@cornerinspirasi.id / editor123")
    print("\n⚠️  IMPORTANT: Change default passwords after first login!")

if __name__ == "__main__":
    asyncio.run(seed_database())
