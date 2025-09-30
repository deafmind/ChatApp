from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView
from django.views import View
from django.http import JsonResponse
from django.contrib import messages
from django.urls import reverse_lazy
from django.db.models import Q
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from authentication.models import User, UserActivity
from .models import ChatRoom, Message
from .forms import ChatRoomForm

# Main Chat Views
@login_required
def chat_home(request):
    """Main chat home page"""
    recent_rooms = ChatRoom.objects.filter(
        Q(members=request.user) | Q(created_by=request.user)
    ).distinct()[:10]
    
    return render(request, 'chat/home.html', {
        'recent_rooms': recent_rooms
    })

@login_required
def room_list(request):
    """List all available chat rooms"""
    rooms = ChatRoom.objects.filter(
        Q(is_private=False) | Q(members=request.user) | Q(created_by=request.user)
    ).distinct()
    
    paginator = Paginator(rooms, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'chat/room_list.html', {
        'page_obj': page_obj
    })

@login_required
def create_room(request):
    """Create a new chat room"""
    if request.method == 'POST':
        form = ChatRoomForm(request.POST)
        if form.is_valid():
            room = form.save(commit=False)
            room.created_by = request.user
            room.save()
            room.members.add(request.user)
            messages.success(request, f'Room "{room.name}" created successfully!')
            return redirect('chat:room_detail', slug=room.slug)
    else:
        form = ChatRoomForm()
    
    return render(request, 'chat/create_room.html', {'form': form})

@login_required
def room_detail(request, slug):
    """View a specific chat room and its messages"""
    room = get_object_or_404(ChatRoom, slug=slug)
    
    # Check if user has access to the room
    if room.is_private and request.user not in room.members.all() and request.user != room.created_by:
        messages.error(request, 'You do not have permission to access this room.')
        return redirect('chat:room_list')
    
    # Add user to room if not already a member
    if request.user not in room.members.all():
        room.members.add(request.user)
    
    # Get recent messages
    messages = Message.objects.filter(room=room).order_by('-timestamp')[:50]
    
    # Update user activity
    user_activity, created = UserActivity.objects.get_or_create(user=request.user)
    user_activity.is_online = True
    user_activity.save()
    
    return render(request, 'chat/room_detail.html', {
        'room': room,
        'messages': reversed(messages),  # Show newest first
    })

@login_required
def join_room(request, slug):
    """Join a chat room"""
    room = get_object_or_404(ChatRoom, slug=slug)
    
    if room.is_private:
        messages.error(request, 'Cannot join private rooms directly.')
        return redirect('chat:room_list')
    
    if room.members.count() >= room.max_members:
        messages.error(request, 'Room is full.')
        return redirect('chat:room_list')
    
    room.members.add(request.user)
    messages.success(request, f'Joined room: {room.name}')
    return redirect('chat:room_detail', slug=slug)

@login_required
def leave_room(request, slug):
    """Leave a chat room"""
    room = get_object_or_404(ChatRoom, slug=slug)
    
    if request.user in room.members.all():
        room.members.remove(request.user)
        messages.success(request, f'Left room: {room.name}')
    
    return redirect('chat:room_list')

# API Views for React Frontend
class RoomListView(LoginRequiredMixin, APIView):
    """API endpoint to list all available rooms"""
    def get(self, request):
        rooms = ChatRoom.objects.filter(
            Q(is_private=False) | Q(members=request.user) | Q(created_by=request.user)
        ).distinct()
        
        data = []
        for room in rooms:
            data.append({
                'id': room.id,
                'name': room.name,
                'slug': room.slug,
                'description': room.description,
                'member_count': room.members.count(),
                'is_private': room.is_private,
                'created_by': room.created_by.username,
            })
        
        return Response(data)

class RoomDetailView(LoginRequiredMixin, APIView):
    """API endpoint to get room details"""
    def get(self, request, slug):
        room = get_object_or_404(ChatRoom, slug=slug)
        
        # Check permissions
        if room.is_private and request.user not in room.members.all() and request.user != room.created_by:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        data = {
            'id': room.id,
            'name': room.name,
            'slug': room.slug,
            'description': room.description,
            'is_private': room.is_private,
            'created_by': room.created_by.username,
            'members': [user.username for user in room.members.all()],
            'member_count': room.members.count(),
        }
        
        return Response(data)

class MessageListView(LoginRequiredMixin, APIView):
    """API endpoint to get messages from a room"""
    def get(self, request, slug):
        room = get_object_or_404(ChatRoom, slug=slug)
        
        # Check permissions
        if room.is_private and request.user not in room.members.all() and request.user != room.created_by:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        messages = Message.objects.filter(room=room).order_by('-timestamp')[:50]
        
        data = []
        for msg in messages:
            data.append({
                'id': msg.id,
                'content': msg.content,
                'user': msg.user.username,
                'user_avatar': getattr(msg.user, 'avatar', ''),
                'timestamp': msg.timestamp.isoformat(),
                'edited': msg.edited,
            })
        
        return Response(list(reversed(data)))  # Newest first

class SendMessageView(LoginRequiredMixin, APIView):
    """API endpoint to send a new message"""
    def post(self, request):
        room_slug = request.data.get('room_slug')
        content = request.data.get('content')
        
        if not room_slug or not content:
            return Response({'error': 'Room slug and content required'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = get_object_or_404(ChatRoom, slug=room_slug)
        
        # Check if user can send message to this room
        if request.user not in room.members.all() and request.user != room.created_by:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        message = Message.objects.create(
            room=room,
            user=request.user,
            content=content
        )
        
        data = {
            'id': message.id,
            'content': message.content,
            'user': message.user.username,
            'user_avatar': getattr(message.user, 'avatar', ''),
            'timestamp': message.timestamp.isoformat(),
            'edited': message.edited,
        }
        
        return Response(data, status=status.HTTP_201_CREATED)