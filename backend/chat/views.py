from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils.text import slugify
from rest_framework import generics, status, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ChatRoom, Message
from .serializers import (
    ChatRoomListSerializer,
    ChatRoomDetailSerializer,
    ChatRoomCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)

class StandardResultsSetPagination(pagination.PageNumberPagination):
    """Custom pagination class for consistent API responses."""
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Room Views ---

class RoomListCreateView(generics.ListCreateAPIView):
    """
    API Endpoint for Rooms:
    - GET: Lists all public rooms and private rooms the user is a member of.
    - POST: Creates a new room.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Filter rooms to show public ones and private ones the user belongs to
        return ChatRoom.objects.filter(
            Q(is_private=False) | Q(members=self.request.user)
        ).distinct()

    def get_serializer_class(self):
        # Use different serializers for listing (GET) and creating (POST)
        if self.request.method == 'POST':
            return ChatRoomCreateSerializer
        return ChatRoomListSerializer

    def perform_create(self, serializer):
        # Automatically set the creator and generate a slug
        user = self.request.user
        # Generate a unique slug
        base_slug = slugify(serializer.validated_data['name'])
        slug = base_slug
        counter = 1
        while ChatRoom.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        room = serializer.save(created_by=user, slug=slug)
        room.members.add(user) # The creator is automatically a member

class RoomDetailView(generics.RetrieveAPIView):
    """
    API Endpoint for a single Room:
    - GET: Retrieves the detailed information for a specific room.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomDetailSerializer
    queryset = ChatRoom.objects.all()
    lookup_field = 'slug'

    def get_object(self):
        # Add a permission check for private rooms
        room = super().get_object()
        user = self.request.user
        if room.is_private and user not in room.members.all():
            self.permission_denied(self.request, message="You do not have permission to access this private room.")
        return room

# --- Message Views ---

class MessageListCreateView(generics.ListCreateAPIView):
    """
    API Endpoint for Messages in a Room:
    - GET: Lists all messages within a specific room.
    - POST: Creates (sends) a new message to the room.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_room(self):
        """Helper method to get the room and check user membership."""
        slug = self.kwargs['slug']
        room = get_object_or_404(ChatRoom, slug=slug)
        if self.request.user not in room.members.all():
            self.permission_denied(self.request, message="You must be a member of the room to view or send messages.")
        return room

    def get_queryset(self):
        room = self.get_room()
        return Message.objects.filter(room=room).order_by('-timestamp')

    def perform_create(self, serializer):
        room = self.get_room()
        serializer.save(user=self.request.user, room=room)


# --- Action Views ---

class JoinRoomView(APIView):
    """
    API Endpoint for a User to Join a Room:
    - POST: Adds the authenticated user to the room's members.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug, format=None):
        room = get_object_or_404(ChatRoom, slug=slug)
        user = request.user

        if room.is_private:
            return Response({'error': 'Cannot join a private room directly.'}, status=status.HTTP_403_FORBIDDEN)
        
        if room.members.count() >= room.max_members:
            return Response({'error': 'This room is full.'}, status=status.HTTP_409_CONFLICT)
        
        if user in room.members.all():
            return Response({'message': 'You are already a member of this room.'}, status=status.HTTP_200_OK)

        room.members.add(user)
        return Response({'message': f'Successfully joined room "{room.name}".'}, status=status.HTTP_200_OK)


class LeaveRoomView(APIView):
    """
    API Endpoint for a User to Leave a Room:
    - POST: Removes the authenticated user from the room's members.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug, format=None):
        room = get_object_or_404(ChatRoom, slug=slug)
        user = request.user

        if user not in room.members.all():
            return Response({'error': 'You are not a member of this room.'}, status=status.HTTP_400_BAD_REQUEST)
        
        room.members.remove(user)
        return Response({'message': f'Successfully left room "{room.name}".'}, status=status.HTTP_200_OK)