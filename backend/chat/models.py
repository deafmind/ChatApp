import logging
import os

from cryptography.fernet import Fernet, InvalidToken
from django.db import models, transaction
from django.utils import timezone
from dotenv import load_dotenv

from authentication.models import User

# --- Setup logging ---
# It's a best practice to use Django's logging configuration,
# but for simplicity in this file, we'll get a basic logger.
logger = logging.getLogger(__name__)

# --- Securely load and validate the encryption key ---
load_dotenv()
fernet_key = os.getenv('FERNET_KEY')

# Initialize fernet instance to None initially
fernet = None

if not fernet_key:
    # Fail loudly at startup if the key is missing. This is a critical configuration error.
    logger.critical("CRITICAL: FERNET_KEY not found in environment variables. Application cannot start.")
    # In a real app, this might prevent the server from starting.
    # For now, we raise an exception.
    raise ValueError("FERNET_KEY is not set. Please check your .env file or environment variables.")
else:
    try:
        # The key must be bytes. Fernet will validate its format (URL-safe base64-encoded 32-bytes).
        fernet = Fernet(fernet_key.encode())
    except (ValueError, TypeError) as e:
        logger.critical(f"CRITICAL: The provided FERNET_KEY is invalid. Error: {e}")
        raise ValueError(f"The FERNET_KEY is invalid and cannot be used for encryption. Error: {e}")


class ChatRoom(models.Model):
    """
    Model for chat rooms
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_rooms"
    )
    members = models.ManyToManyField(User, related_name="chat_rooms", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_private = models.BooleanField(default=False)
    max_members = models.IntegerField(default=100)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

class EncryptionRecord(models.Model):
    """
    Stores the encrypted version of a message's content.
    """
    encrypted_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record {self.id} - {self.encrypted_text[:20]}..."

class Message(models.Model):
    """
    Model for chat messages
    """
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(blank=True, null=True)
    
    encrypted_text = models.OneToOneField(
        EncryptionRecord, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"

    def save(self, *args, **kwargs):
        """
        Custom save method to handle encryption within an atomic database transaction.
        """
        if fernet is None:
            # This check ensures we don't proceed if the key failed to load.
            logger.error("Message save aborted: Fernet encryption is not initialized.")
            raise RuntimeError("Cannot save message because the encryption service is not available.")

        # Use a transaction to ensure that both the Message and its EncryptionRecord
        # are saved successfully, or neither is. This prevents orphaned records.
        with transaction.atomic():
            # Encrypt the content before saving.
            encrypted_content = fernet.encrypt(self.content.encode()).decode()

            if self.pk and self.encrypted_text:
                # If the message and its encryption record already exist, update the record.
                self.encrypted_text.encrypted_text = encrypted_content
                self.encrypted_text.save()
            else:
                # If it's a new message, create a new encryption record.
                record = EncryptionRecord.objects.create(encrypted_text=encrypted_content)
                self.encrypted_text = record
            
            # Call the original save() method to save the Message instance.
            # This happens inside the transaction block.
            super().save(*args, **kwargs)

    @property
    def decrypted_content(self):
        """
        A property to safely access the decrypted content of the message.
        Handles potential decryption errors gracefully.
        """
        if not self.encrypted_text or not self.encrypted_text.encrypted_text:
            logger.warning(f"Message {self.id} has no associated encrypted text to decrypt.")
            return "[No Content]"

        try:
            # Decrypt the text from the related EncryptionRecord
            encrypted_bytes = self.encrypted_text.encrypted_text.encode()
            decrypted_bytes = fernet.decrypt(encrypted_bytes)
            return decrypted_bytes.decode()
        except InvalidToken:
            # This is the specific exception for failed decryption.
            # It could mean the data is corrupt or the encryption key has changed.
            logger.error(
                f"DECRYPTION FAILED for Message ID {self.id}. "
                "The token is invalid. This may be due to data corruption or a key change."
            )
            return "[DECRYPTION FAILED: Invalid Token]"
        except Exception as e:
            # Catch any other unexpected errors during decryption.
            logger.error(f"An unexpected error occurred during decryption for Message ID {self.id}: {e}")
            return "[DECRYPTION FAILED: Unexpected Error]"
        
