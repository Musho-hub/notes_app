from rest_framework import viewsets, permissions
from .models import Tag
from .serializers import TagSerializer

class IsTagOwner(permissions.BasePermission):
    """Only allow users to access their own tags."""
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class TagViewSet(viewsets.ModelViewSet):
    """
    CRUD API for user-owned tags.
    - GET /api/tags/    → list user's tags
    - POST /api/tags/   → create a tag
    - DELETE /api/tags  → delete a tag
    """
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsTagOwner]

    def get_queryset(self):
        """Return only tags belonging to the logged-in user."""
        return Tag.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        """When creating a tag, assign the logged-in user as its owner."""
        serializer.save(owner=self.request.user)