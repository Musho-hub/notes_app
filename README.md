# 📝 Notes App — Django + Next.js Full-Stack Project

This project is a **full-stack Notes application** built as a part of my self study for school.  
It uses a **Django REST Framework backend** and a **Next.js + TypeScript frontend**.

---

## Tech Stack

### Backend (Django REST Framework)
- Python 3.13  
- Django 5.2  
- Django REST Framework  
- JWT authentication (`djangorestframework-simplejwt`)
- SQLite database (default)

### Frontend (Next.js)
- Next.js + TypeScript  
- Tailwind CSS for styling  
- Axios for API requests  

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Musho-hub/notes_app.git
cd notes_app
```

### 2. Backend setup
```bash
cd notes_app_backend
python -m venv venv
source venv/bin/activate     # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend setup
```bash
cd ../notes_app_frontend
npm install
npm run dev
```
### 4. Create .env file inside notes_app_backend
```bash
SECRET_KEY=your_django_secret_key
DEBUG=True
```