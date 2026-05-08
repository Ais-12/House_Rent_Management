from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('tenant', 'Tenant'),
    ]
    username = models.CharField(max_length=150, unique=True, blank=False)
    role = models.CharField(max_length=40 , choices=ROLE_CHOICES , null= True , blank=True)
    email = models.EmailField(unique=True, blank=False)
    phone_number = models.CharField(max_length=15, blank=True)
    aadhar_number = models.CharField(max_length=12, unique=True, blank=True, null=True)
    def __str__(self):
        return self.username

 
class House(models.Model):
    STATUS_CHOICES = [
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
    ]
 
    house_number = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True)
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    water_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    last_current_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_per_cost = models.DecimalField(max_digits=6, decimal_places=2, default=7.00, help_text='Cost per electricity unit (₹)')
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=[('vacant','Vacant'),('occupied','Occupied')], default='vacant')
    tenant = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name='rented_houses')
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name='houses_created')
    updated_by = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name='houses_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    

class HouseLog(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='logs')
    previous_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_month_unit = models.DecimalField(max_digits=10, decimal_places=2)
    current_cost = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=[('pending','Pending'),('paid','Paid'),('overdue','Overdue')], default='pending')
    tenant = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='house_logs')
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='house_logs_created')
    updated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='house_logs_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
