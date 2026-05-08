from rest_framework import serializers
from .models import *


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'


class HouseSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = '__all__'

    def get_tenant_name(self,obj):
        return obj.tenant.username



class HouseLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseLog
        fields = '__all__'