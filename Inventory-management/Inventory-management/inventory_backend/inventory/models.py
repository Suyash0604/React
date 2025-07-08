from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    contact = models.CharField(max_length=15, blank=True)
    def __str__(self):
        return f"{self.username} ({self.role})"

from django.db import models
from django.conf import settings

class InventoryItem(models.Model):
    title = models.CharField(max_length=100)
    SKU = models.CharField(max_length=50, unique=True)
    Quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    Date = models.DateField()
    threshold = models.IntegerField(default=5)
    supplier = models.ForeignKey("Supplier", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(  
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="owned_products"
    )
    

    def __str__(self):
        return self.title


from django.db import models
import uuid     

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Unique ID
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    gst_number = models.CharField(max_length=15, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Sale(models.Model):
    product = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    buyer_name = models.CharField(max_length=100)           # ✅ NEW
    contact_number = models.CharField(max_length=15)  
    address = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def total_price(self):
        return self.quantity * self.product.price

    def __str__(self):
        return f"{self.quantity} sold of {self.product.title}"
# models.py
class Bill(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    buyer_name = models.CharField(max_length=100)       # ✅ New
    contact_number = models.CharField(max_length=15)
    discount_percentage = models.FloatField(default=0)
    discount_amount = models.FloatField(default=0)
    gst_percentage = models.FloatField(default=18)
    gst_amount = models.FloatField(default=0)
    address = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def total_amount(self):
        return sum(item.total_price() for item in self.items.all())

    def __str__(self):
        return f"Bill #{self.id} for {self.user.username}"


from django.core.exceptions import ValidationError
from decimal import Decimal
class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    discount = models.FloatField(default=0)  # percentage
    gst = models.FloatField(default=18)      # percentage

    def total_price(self):
        base_price = Decimal(self.quantity) * self.product.price
        discount_amount = (Decimal(str(self.discount)) / Decimal("100")) * base_price
        taxable_price = base_price - discount_amount
        gst_amount = (Decimal(str(self.gst)) / Decimal("100")) * taxable_price
        return taxable_price + gst_amount
# models.py

from django.db import models
from django.conf import settings

class Discount(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("value", "Value"),
    ]

    outlet = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey("InventoryItem", on_delete=models.CASCADE)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.outlet.username} - {self.product.title} - {self.discount_type} {self.amount}"
