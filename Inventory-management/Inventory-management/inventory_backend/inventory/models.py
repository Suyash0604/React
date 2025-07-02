from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"{self.username} ({self.role})"

class InventoryItem(models.Model):
    title = models.CharField(max_length=100)
    SKU = models.CharField(max_length=50, unique=True)
    Quantity = models.IntegerField()
    Price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=100)
    Date = models.DateField()
    threshold = models.IntegerField(default=5)

    def __str__(self):
        return self.title
