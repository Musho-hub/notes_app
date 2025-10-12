from django.db import models
from django.contrib.auth.models import User    # Default Django user model

# The Note model represents a single note in the database.
class Note(models.Model):
    # Note title - short text field, max length 200 chars
    title = models.CharField(max_length=200)

    # Main note body - unlimited text, blank allowed
    content = models.TextField(blank=True)

    # Auto-filled timestamp when note is first created
    created_at = models.DateTimeField(auto_now_add=True)

    # Each note is linked to a specific user (the owner).
    # - on_delete=models.CASCADE → if a user is deleted, delete their notes too
    # - related_name='notes' → lets us access user.notes to get all their notes
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes'
    )

    # String representation of the model (shown in admin, shell, etc.)
    def __str__(self):
        return self.title