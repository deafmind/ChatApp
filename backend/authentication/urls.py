from django.urls import path, include
from . import views

app_name = 'authentication'

urlpatterns = [
    # Social auth URLs
    path('social/', include('social_django.urls', namespace='social')),
    
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('refresh-token/', views.RefreshTokenView.as_view(), name='refresh_token'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
]