from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import *
from .serializers import *


class HouseView(APIView):
    def get(self, request):
        house_id = request.query_params.get('id')

        if house_id:
            try:
                house = House.objects.get(id=house_id)
                serializer = HouseSerializer(house)
                return Response(serializer.data)
            except House.DoesNotExist:
                return Response({'error': 'House not found'}, status=404)
        else:
            houses = House.objects.all()
            serializer = HouseSerializer(houses, many=True)
            return Response(serializer.data)

    def post(self, request):
        serializer = HouseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request):
        house_id = request.query_params.get('id')

        if not house_id:
            return Response({'error': 'ID is required'}, status=400)

        try:
            house = House.objects.get(id=house_id)
        except House.DoesNotExist:
            return Response({'error': 'House not found'}, status=404)

        serializer = HouseSerializer(house, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


    def delete(self, request):
        house_id = request.query_params.get('id')

        if not house_id:
            return Response({'error': 'ID is required'}, status=400)

        try:
            house = House.objects.get(id=house_id)
            house.delete()
            return Response({'message': 'Deleted successfully'}, status=204)
        except House.DoesNotExist:
            return Response({'error': 'House not found'}, status=404)


class HouseLogView(APIView):

    def get(self, request):
        pk = request.query_params.get('pk')
        if pk:
            try:
                obj = HouseLog.objects.get(pk=pk)
                serializer = HouseLogSerializer(obj)
                return Response(serializer.data)
            except HouseLog.DoesNotExist:
                return Response({'error': 'Not found'}, status=404)
        else:
            queryset = HouseLog.objects.all()
            serializer = HouseLogSerializer(queryset, many=True)
            return Response(serializer.data)

    def post(self, request):
        serializer = HouseLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request):
        pk = request.query_params.get('pk')
        try:
            obj = HouseLog.objects.get(pk=pk)
        except HouseLog.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        serializer = HouseLogSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request):
        pk = request.query_params.get('pk')
        try:
            obj = HouseLog.objects.get(pk=pk)
            obj.delete()
            return Response({'message': 'Deleted successfully'}, status=204)
        except HouseLog.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        

 
# ─────────────────────────────────────────────
# USER VIEW  (Admin/Owner only)
# ─────────────────────────────────────────────
class UserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
 
    def get(self, request):
        user_id = request.query_params.get('id')
        if user_id:
            try:
                user = CustomUser.objects.get(id=user_id)
                serializer = CustomUserSerializer(user)
                return Response(serializer.data)
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        else:
            users = CustomUser.objects.all()
            serializer = CustomUserSerializer(users, many=True)
            return Response(serializer.data)
 
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            # Use create_user so password gets hashed properly
            password = request.data.get('password')
            user = serializer.save()
            if password:
                user.set_password(password)
                user.save()
            return Response(CustomUserSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)
 
    def put(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'ID is required'}, status=400)
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
 
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            # Update password if provided
            password = request.data.get('password')
            if password:
                updated_user.set_password(password)
                updated_user.save()
            return Response(CustomUserSerializer(updated_user).data)
        return Response(serializer.errors, status=400)
 
    def delete(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'ID is required'}, status=400)
        try:
            user = CustomUser.objects.get(id=user_id)
            # Prevent deleting yourself
            if user == request.user:
                return Response({'error': 'You cannot delete your own account'}, status=400)
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=204)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
 
 
# ─────────────────────────────────────────────
# TENANT VIEW  (Tenants only — non-staff users)
# ─────────────────────────────────────────────
class TenantView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        """
        Owner  → sees all tenants (non-staff users)
        Tenant → sees only their own profile
        """
        if request.user.is_staff or request.user.is_superuser:
            tenants = CustomUser.objects.filter(is_staff=False, is_superuser=False)
            serializer = CustomUserSerializer(tenants, many=True)
            return Response(serializer.data)
        else:
            # Tenant can only see their own profile
            serializer = CustomUserSerializer(request.user)
            return Response(serializer.data)
 
    def put(self, request):
        """
        Owner  → can update any tenant by ?id=
        Tenant → can only update their own profile
        """
        if request.user.is_staff or request.user.is_superuser:
            user_id = request.query_params.get('id')
            if not user_id:
                return Response({'error': 'ID is required'}, status=400)
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Tenant not found'}, status=404)
        else:
            user = request.user
 
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            password = request.data.get('password')
            if password:
                updated.set_password(password)
                updated.save()
            return Response(CustomUserSerializer(updated).data)
        return Response(serializer.errors, status=400)
 
 
 
class LoginView(APIView):

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'role' :user.role,
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=401)
        

