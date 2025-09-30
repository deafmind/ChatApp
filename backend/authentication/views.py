import json
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status

import requests
from oauth2_provider.models import Application
from oauth2_provider.contrib.rest_framework import TokenHasScope, OAuth2Authentication
import dotenv
import os
from django.shortcuts import render, redirect
from django.contrib.auth import login
from rest_framework.decorators import permission_classes
from .forms import UserRegistrationForm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import requests
import os
import dotenv
User = get_user_model()

# Authentication Views
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # For custom user model with email as USERNAME_FIELD
        form = UserRegistrationForm(request.data)
        if form.is_valid():
            user = form.save()
            # Set email as username equivalent for login
            user.username = user.email
            user.save()
            login(request._request, user)  # Access the underlying Django request
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            try:
                dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
                dotenv.load_dotenv(dotenv_path=dotenv_path)
                client_id = os.getenv("ID")
                client_secret = os.getenv("SECRET")
                base_url = os.getenv("BASE_URL")
                token_url = f'{base_url}/oauth/token/'
                data = {
                    'grant_type': 'password',
                    'username': username,
                    'password': password,
                }
                response = requests.post(token_url, data=data, auth=(client_id, client_secret))

                if response.status_code == 200:
                    
                    tokens = response.json()
                    return Response({
                        'access_token': tokens.get('access_token'),
                        'refresh_token': tokens.get('refresh_token'),
                        'expired_time': tokens.get('expires_in')
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Failed to obtain access token'}, status=response.status_code)
            except Application.DoesNotExist:
                return Response({'error': 'OAuth2 application not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            access_token = request.data.get('access_token')
            dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
            dotenv.load_dotenv(dotenv_path=dotenv_path)
            client_id = os.getenv("ID")
            client_secret = os.getenv("SECRET")
            base_url = os.getenv("BASE_URL")
            token_url = f'{base_url}/o/revoke_token/'
            data = {
                'token': access_token,
                'client_id': client_id,
                'client_secret': client_secret,
            }
            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                return Response({'message':'logout successfully!'},status=status.HTTP_205_RESET_CONTENT)
            else:
                return Response({'error': 'Failed to revoke token'}, status=status.HTTP_400_BAD_REQUEST)
        except Application.DoesNotExist:
            return Response({'error': 'OAuth2 application not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import requests
import os
import dotenv

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Read the request body ONCE

            refresh_token = request.data.get('refresh_token')

            if not refresh_token:
                return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

            # Load environment variables 
            dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
            dotenv.load_dotenv(dotenv_path=dotenv_path)
            client_id = os.getenv("ID")
            client_secret = os.getenv("SECRET")
            base_url = os.getenv("BASE_URL")
            
            payload = {
                'grant_type': 'refresh_token',
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token,
            }
            token_url = f'{base_url}/o/token/'
            response = requests.post(token_url, data=payload)
            response.raise_for_status()

            return Response(response.json(), status=response.status_code)

        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.RequestException as e:
            error_message = f"Error during internal token refresh request: {e}"
            if e.response is not None:
                try:
                    error_details = e.response.json()
                    error_message = error_details.get('error_description', error_details.get('error', error_message))
                except json.JSONDecodeError:
                    error_message = e.response.text
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API Views
@permission_classes([IsAuthenticated])
class UserProfileView(APIView):
    """API endpoint to get user profile"""
    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': getattr(user, 'avatar', ''),
        }
        return Response(data)