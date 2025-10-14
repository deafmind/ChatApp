from django.urls import path
from . import views

app_name = 'chat'

# These URLs are designed to be included in your project's main urls.py
# under a prefix, for example: path('api/chat/', include('chat.urls'))

urlpatterns = [
    # List rooms or create a new room
    # GET, POST -> /api/chat/rooms/
    path('rooms/', views.RoomListCreateView.as_view(), name='room-list-create'),

    # Retrieve details for a single room
    # GET -> /api/chat/rooms/<slug>/
    path('rooms/<slug:slug>/', views.RoomDetailView.as_view(), name='room-detail'),
    
    # List messages in a room or send a new message
    # GET, POST -> /api/chat/rooms/<slug>/messages/
    path('rooms/<slug:slug>/messages/', views.MessageListCreateView.as_view(), name='message-list-create'),

    # Action to join a room
    # POST -> /api/chat/rooms/<slug>/join/
    path('rooms/<slug:slug>/join/', views.JoinRoomView.as_view(), name='room-join'),

    # Action to leave a room
    # POST -> /api/chat/rooms/<slug>/leave/
    path('rooms/<slug:slug>/leave/', views.LeaveRoomView.as_view(), name='room-leave'),
]