from django.contrib import admin
from .models import Note

# Registers the Note model with the Django admin site
# Manage Notes in the admin dashboard (http://127.0.0.1:8000/admin/)
@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    # ^ Custom "admin view" for the Note model
    # by extending Django’s built-in ModelAdmin class

    # Which fields should show up as columns in the list view (the admin table of Notes)
    list_display = ('id', 'title', 'owner', 'created_at')

    # Add filter options in the right sidebar to quickly narrow results
    list_filter = ('owner', 'created_at')

    # Add a search bar to search Notes by these fields
    search_fields = ('title', 'content', 'owner_username')