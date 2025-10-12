from rest_framework import viewsets, permissions
from .models import Note
from .serializers import NoteSerializer

class IsOwner(permissions.BasePermission):      # Base class to build custom permissions.
    def has_object_permission(self, request, view, obj):    # Called for each object (note) when a user tries to access it.
        return obj.owner == request.user        # Returns True only if the note’s owner matches the logged-in user.
    
class NoteViewSet(viewsets.ModelViewSet):       # A prebuilt DRF view that supports all CRUD actions.
    serializer_class = NoteSerializer      # Tells DRF how to convert Note objects <-> JSON.
    permission_classes = [permissions.IsAuthenticated, IsOwner]     # Must be logged in (isAuthenticated) - can only touch own notes (IsOwner)

    def get_queryset(self):     # Defines what notes a user sees when they hit /api/notes/.
        # Only return notes belonging to the logged-in user
        return Note.objects.filter(owner = self.request.user)    # Limits results to notes owned by the logged-in user.
    
    def perform_create(self, serializer):    # Runs when a user does POST /api/notes/ (creates a new note).
        # Automatically set the owner when a new note is created
        serializer.save(owner = self.request.user)    # Assigns the logged-in user as the owner automatically.