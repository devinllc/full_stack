from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address, UploadedFile

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('phone_number',)}),
    )

class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'street', 'city', 'state', 'postal_code', 'country', 'is_default']
    list_filter = ['user', 'city', 'state', 'country']
    search_fields = ['user__username', 'street', 'city', 'postal_code']

class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['user', 'filename', 'file_type', 'upload_date']
    list_filter = ['user', 'file_type', 'upload_date']
    search_fields = ['user__username', 'filename']
    readonly_fields = ['file_type', 'upload_date']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(UploadedFile, UploadedFileAdmin)
