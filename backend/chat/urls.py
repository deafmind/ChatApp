from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Main chat URLs
    path('', views.chat_home, name='chat_home'),
    path('rooms/', views.room_list, name='room_list'),
    path('rooms/create/', views.create_room, name='create_room'),
    path('rooms/<slug:slug>/', views.room_detail, name='room_detail'),
    path('rooms/<slug:slug>/join/', views.join_room, name='join_room'),
    path('rooms/<slug:slug>/leave/', views.leave_room, name='leave_room'),
    
    # API endpoints for React frontend
    path('api/rooms/', views.RoomListView.as_view(), name='api_rooms'),
    path('api/rooms/<slug:slug>/', views.RoomDetailView.as_view(), name='api_room_detail'),
    path('api/rooms/<slug:slug>/messages/', views.MessageListView.as_view(), name='api_messages'),
    path('api/messages/send/', views.SendMessageView.as_view(), name='api_send_message'),
]