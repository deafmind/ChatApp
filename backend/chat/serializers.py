from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

User = get_user_model()

# A simple serializer to represent User objects in nested relationships
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

# --- Message Serializers ---

class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for listing/retrieving chat messages.
    It now decrypts the message content for display.
    """
    user = UserSerializer(read_only=True)
    
    content = serializers.SerializerMethodField()

    class Meta:
        model = Message
        # The 'content' in this list now refers to our SerializerMethodField above.
        fields = ['id', 'user', 'content', 'timestamp', 'edited']
        read_only_fields = ['user', 'timestamp', 'edited']

    def get_content(self, obj):
        """
        This method is called by the SerializerMethodField to get the value for 'content'.
        It safely accesses the decrypted content from the model property.
        """
        return obj.decrypted_content


class MessageCreateSerializer(serializers.ModelSerializer):
    """
    Serializer used specifically for creating (sending) a new message.
    --- NO CHANGES NEEDED ---
    This serializer correctly accepts plaintext 'content' from the user.
    The model's custom .save() method will handle the encryption automatically.
    """
    class Meta:
        model = Message
        fields = ['content']

# --- ChatRoom Serializers (No Changes Needed) ---

class ChatRoomListSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'slug', 'description', 'is_private',
            'created_by', 'member_count'
        ]

    def get_member_count(self, obj):
        return obj.members.count()


class ChatRoomDetailSerializer(ChatRoomListSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta(ChatRoomListSerializer.Meta):
        fields = ChatRoomListSerializer.Meta.fields + ['members', 'max_members']


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['name', 'description', 'is_private', 'max_members']