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

    # Many-to-many relations to Tag model
    # A note can multiple tags, and each tag can belong to multiple notes.
    tags = models.ManyToManyField(
        "Tag",              # Quotes allow refferring to Tag before it's defined
        related_name="notes",
        blank=True          # Allow notes with no tags
    )

    # String representation of the model (shown in admin, shell, etc.)
    def __str__(self):
        return self.title
    
class Tag(models.Model):
    """
    per-user tag model.

    Each tag:
        - Belongs to a user (owner)
        - has a short text name (e.g., "work", "school")
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tags"
    )
    name = models.CharField(max_length=30)

    class Meta:
        # Prevent duplicate tag names per user, but allow same names across users.
        unique_together = ("owner", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name