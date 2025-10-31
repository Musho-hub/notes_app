# 🗓️ Notes App — Roadmap

En plan til mit **Notes App** full-stack web app med **Django REST Framework** (backend) og **Next.js (TypeScript)** (fronted) project

---

## Hvad der er brugt eller skal bruges
- **Frontend** | Next.js(React) + TypeScript + Tailwind | UI, routing, API calls
- **Backend**  | Django(DRF)                            | API + authentication
- **Auth**     | SimpleJWT                              | Token-baseret login
- **Database** | SQLite(Nu) PostgreSQL(Fremtidig)       | user data
- **Hosting**  | Render (API) + Vercel (Frontend)       | Skalerbar cloud løsning

---

## 🔒 Fase 1: Flere brugere (Uge 1?)

**Mål:** Få appen til at støtte flere brugere sikkert.

- Tilføj **user registration** (`/api/register/`) endpoint i Django.
- Opdrat **register page** i Next.js.
- Bliv ved med at bruge **JWT authentication** (`djangorestframework-simplejwt`).
- Sørg for, at brugerne kun kan se deres egne noter (`NoteViewSet` → `filter(owner=request.user)`).
- Opbevar tokens sikkert i localStorage (access + refresh).

---

## 🧰 Fase 2: Sikkerhed & UX / UI (Uge 2–3?)

**Mål:** Forbedr sikkerhed og brugeroplevelse.

- Flyt alle hemmeligheder til `.env` (SECRET_KEY, DEBUG, API URLs).
- Tilføj **token refresh** flow for at gøre login sessioner smoother.
- Tilføj **form validation** og error handling.
- Tilføj **toast notifications** for success/error feedback.
- Tilføj **theme selector** (light/dark) gemt i localStorage.
- Tilføj **HTTPS** security headers
- Tilføj **Logging & monitoring** (Sentry)

#### Extra Backend
- Gem tokens i **HTTP-only cookies** istedet for localStorage
- Tilføj **/api/me** endpoint i Django backend der retunere bruger information

#### Extra UX/UI
- Søg og filter notes
- Tags og eller categories
- Password reset + email verification
- Flere themes?
- Instillinger knap - til themes (custom themes?) / logout?

---

## 🌐 Fase 3: Få lagt online (Uge 3-4?)

**Mål:** Implementer backend og frontend på nettet.

### 🛠 Backend (Django)
- Host på **Render** ?
- Database: skift fra SQLite til PostgreSQL

### 🖥️ Frontend (Next.js)
- Host på **Vercel** ?


