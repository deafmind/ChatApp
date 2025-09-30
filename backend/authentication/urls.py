from django.urls import path, include
from . import views

app_name = 'authentication'

urlpatterns = [
    # Social auth URLs
    path('social/', include('social_django.urls', namespace='social')),
    
    # Authentication URLs
    # path('login/', views.CustomLoginView.as_view(), name='login'),
    # path('logout/', views.CustomLogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'),
    
    # API endpoints for authentication
    path('api/profile/', views.UserProfileView.as_view(), name='api_profile'),
]