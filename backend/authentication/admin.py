from django.contrib import admin
from .models import User, UserActivity
# Register your models here.
admin.site.register(User)
admin.site.register(UserActivity)
