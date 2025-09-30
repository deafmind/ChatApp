from django import forms
from .models import ChatRoom

class ChatRoomForm(forms.ModelForm):
    class Meta:
        model = ChatRoom
        fields = ['name', 'description', 'is_private', 'max_members']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'is_private': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'max_members': forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 1000}),
        }