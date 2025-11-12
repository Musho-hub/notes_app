"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter    # Router that auto-creates REST-style routes for viewsets.

# -= Local imports =- #
from notes.views import NoteViewSet
from notes.views_auth import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CookieLogoutView,
    RegisterView,
)

# -----------------------------------------------------------------------------
# API ROUTER
# -----------------------------------------------------------------------------
# The DRF DefaultRouter automatically creates REST-style endpoints for viewsets.
# When we register a viewset, it handles CRUD route generation automatically.
#
# Example generated endpoints:
#   GET    /api/notes/        → list all notes
#   POST   /api/notes/        → create a new note
#   GET    /api/notes/<id>/   → retrieve a note by ID
#   PUT    /api/notes/<id>/   → update an entire note
#   PATCH  /api/notes/<id>/   → partially update a note
#   DELETE /api/notes/<id>/   → delete a note
# -----------------------------------------------------------------------------
router = DefaultRouter()
router.register(r"notes", NoteViewSet, basename="note")

# -----------------------------------------------------------------------------
# URL PATTERNS
# -----------------------------------------------------------------------------
urlpatterns = [
    # --- Admin site ---
    # Django’s built-in admin interface (superusers)
    path('admin/', admin.site.urls),

    # --- Notes API (main app routes) ---
    # Includes all auto-generated endpoints from the DRF router.
    path("api/", include(router.urls)),

    # --- Browsable API login/logout ---
    # Enables session-based authentication for the DRF web UI (for testing only).
    path("api/", include("rest_framework.urls")),

    # --- JWT Authentication (cookie-based) ---
    # Handles login, token refresh, logout and user registration using HttpOnly cookies.

    # Obtain new access + refresh tokens via credentials (username/password)
    path("api/token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # Exchange an existing refresh token for a new access token
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),

    # Clear authentication cookies and log the user out
    path("api/auth/logout/", CookieLogoutView.as_view(), name="logout"),

    # Register new users - username/password → creates account and issues JWT cookies
    path("api/auth/register/", RegisterView.as_view(), name="register"),
]
