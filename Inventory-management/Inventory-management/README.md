# 🧾 Inventory Management System

A full-stack Inventory Management System built with:

- 🌐 **Frontend**: React + Vite
- 🧠 **Backend**: Django + Django REST Framework
- 🗃️ **Database**: PostgreSQL
- 📦 **Containerized with Docker** for easy deployment

---

## 🚀 Features

1. **Authentication**
   - User login system with role-based access (Admin & Viewer)

2. **Inventory Management**
   - Add, update, and delete inventory items
   - Fields: Name, SKU, Quantity, Price, Supplier, Expiration Date
   - Paginated and searchable table view

3. **Stock Alerts**
   - Notifications for low-stock items based on threshold

4. **Reports**
   - Export inventory reports in CSV format

5. **Dashboard**
   - Summary: total items, total stock value, low-stock items

---

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/suyash0604/inventory-management.git
cd inventory-management
2. Backend (Django)
bash
Copy
Edit
cd inventory_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Update database settings in settings.py if needed
python manage.py migrate
python manage.py runserver
3. Frontend (React + Vite)
bash
Copy
Edit
cd frontend
npm install
npm run dev
🐳 Run with Docker (Recommended)
✅ Requirements
Docker installed

Internet access (to pull images from Docker Hub)

🏁 Quick Start Using Shell Script
bash
Copy
Edit
chmod +x run_inventory_app.sh
./run_inventory_app.sh
🐋 Manual Docker Commands
bash
Copy
Edit
# PostgreSQL
docker run -d --name inventory-db \
  -e POSTGRES_DB=inventory_mg_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Pass@123 \
  -p 5432:5432 postgres:13

# Backend
docker pull suyash2810/inventory-management:backend
docker run -d --name inventory-backend \
  --link inventory-db \
  -p 8000:8000 \
  suyash2810/inventory-management:backend

# Frontend
docker pull suyash2810/inventory-management:frontend
docker run -d --name inventory-frontend \
  -p 4173:4173 \
  suyash2810/inventory-management:frontend
🌐 Access the App
Frontend: http://localhost:4173

Backend API: http://localhost:8000

⚠️ Make sure your frontend code is configured to use the correct API URL (e.g., VITE_API_URL=http://localhost:8000)

📤 Docker Images on Docker Hub
Component	Image
Frontend	suyash2810/inventory-management:frontend
Backend	suyash2810/inventory-management:backend

bash
Copy
Edit
# Pull manually if needed
docker pull suyash2810/inventory-management:frontend
docker pull suyash2810/inventory-management:backend
📂 Project Structure
bash
Copy
Edit
Inventory-management/
├── inventory_backend/       # Django backend
│   ├── Dockerfile
│   └── ...
├── frontend/                # React frontend
│   ├── Dockerfile
│   └── ...
├── run_inventory_app.sh     # Shell script for Docker deployment
└── README.md                # Project documentation
👨‍💻 Developer
Suyash Gaikwad


📄 License
MIT License – Free to use, modify, and distribute.