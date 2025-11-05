class JWTAuthCookieMiddleware:
    """
    enables frontend clients (like React/Next.js apps) that store JWTs in cookies
    to authenticate seamlessly with Django REST Framework:

      - Reads the "access_token" cookie from incoming requests
      - Injects it into the "Authorization" header if missing
      - Allows DRF's standard JWTAuthentication to handle the rest normally
    """
    def __init__(self, get_response):
        # Django initializes middleware once at startup.
        # Store the get_response callable so we can pass the request onward in __call__.
        self.get_response = get_response
        
    def __call__(self, request):
        # Retrieve the JWT token stored in cookies under 'access_token'.
        access = request.COOKIES.get("access_token")

        # If a cookie token exists but the Authorization header is missing,
        # attach the header in the format expected by DRF: "Bearer <token>".
        if access and "HTTP_AUTHORIZATION" not in request.META:
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access}"

        # Continue the middleware chain and return the standard response.
        return self.get_response(request)