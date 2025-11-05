from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# =====================================
# Cookie Lifetime Configuration
# =====================================
# Define how long each token cookie should live (in seconds)
ACCESS_MAX_AGE = 3 * 60 * 60        # Access token: 3 hours
REFRESH_MAX_AGE = 14 * 24 * 60 * 60 # Refresh token: 14 days

# Shared cookie configuration applied to all auth cookies.
# These are security-related attributes to mitigate XSS/CSRF risks
COOKIE_KWARGS = dict(
    httponly=True,  # Prevents JavaScript access (helps mitigate XSS)
    secure=False,   # Should be True in production (HTTPS required)
    samesite="Lax", # Restricts cross-site sending; "None" needed if frontend on another domain
    path="/",       # Cookies available site-wide (send cookies to all paths)
)

# =====================================
# Obtain Token View (Login)
# =====================================
class CookieTokenObtainPairView(TokenObtainPairView):
    """
    POST (username/password) → issues JWT tokens as HttpOnly cookies.

    wraps SimpleJWT's TokenObtainPairView but overrides response behavior:
      - Calls SimpleJWT to validate credentials and issue tokens
      - Stores the access and refresh tokens in HttpOnly cookies
      - Returns a simple success message instead of exposing tokens in JSON
    """

    def post(self, request, *args, **kwargs):
        # Let SimpleJWT built-in authentication validate credentials and issue tokens
        response = super().post(request, *args, **kwargs)
        data = response.data

        # Extract the newly issued tokens from SimpleJWT's response
        access = data.get("access")
        refresh = data.get("refresh")
        
        # If token generation failed, return the original error response
        if not access or not refresh:
            return response

        # Store both tokens as cookies
        response.set_cookie("access_token", access, max_age=ACCESS_MAX_AGE, **COOKIE_KWARGS)
        response.set_cookie("refresh_token", refresh, max_age=REFRESH_MAX_AGE, **COOKIE_KWARGS)

        # Hide the raw tokens from the response body
        response.data = {"detail": "logged_in"}
        return response


# =====================================
# Refresh Token View
# =====================================
class CookieTokenRefreshView(TokenRefreshView):
    """
    POST (no body required) → reads the refresh token from cookies,
    issues a new access token, and updates the access cookie.

    extends SimpleJWT's TokenRefreshView:
      - Reads the refresh token from cookies (instead of request body)
      - Calls SimpleJWT to validate and issue a new access token
      - Updates the existing access cookie with the new token
      - Returns a minimal JSON response instead of exposing tokens
    """
    def post(self, request, *args, **kwargs):
        # Attempt to read the refresh token directly from cookies
        refresh = request.COOKIES.get("refresh_token")
        if not refresh:
            return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        # SimpleJWT expects the refresh token in request.data
        request.data["refresh"] = refresh

        # Use the parent class to handle token validation and renewal
        response = super().post(request, *args, **kwargs)

        # Extract new access token from the response
        access = response.data.get("access")
        if not access:
            return Response({"detail": "No access token returned"}, status=status.HTTP_400_BAD_REQUEST)

        # Update the access cookie with the new token
        response.set_cookie("access_token", access, max_age=ACCESS_MAX_AGE, **COOKIE_KWARGS)

        # Replace raw tokens in body with status message
        response.data = {"detail": "refreshed"}
        return response

# =====================================
# Logout View
# =====================================
@method_decorator(csrf_exempt, name="dispatch")
class CookieLogoutView(APIView):
    """
    POST → clears authentication cookies (logout).

    This endpoint provides a clean logout flow for cookie-based JWT auth:
      - Deletes both access and refresh cookies from the browser
      - Returns a simple JSON message confirming logout
      - Is CSRF-exempt since it performs no sensitive state change
    """
    authentication_classes = ()
    permission_classes = ()

    def post(self, request):
        # Create a success response and clear both tokens
        response = Response({"detail": "logged_out"}, status=200)
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")
        return response
