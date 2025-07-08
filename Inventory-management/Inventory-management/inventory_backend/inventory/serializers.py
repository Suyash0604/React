from rest_framework import serializers
from .models import InventoryItem
from .models import InventoryItem, Supplier
# serializers.py
class InventoryItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())
    supplier_name = serializers.CharField(source='supplier.name', read_only=True) 

    class Meta:
        model = InventoryItem
        fields = '__all__'



from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'role']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")
    
from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']  


from django.contrib.auth.hashers import make_password
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'contact', 'password', 'confirm_password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        if len(data['password']) < 8 or sum(c in "!@#$%^&*()" for c in data['password']) < 2:
            raise serializers.ValidationError("Password must be at least 8 characters long and include 2 special characters.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])  # hashes the password
        return CustomUser.objects.create(**validated_data)


from rest_framework import serializers
from .models import Supplier
from .models import Sale

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    product = serializers.StringRelatedField()  # ✅ Return product title as string
    total_price = serializers.SerializerMethodField()
    user = serializers.CharField(source='user.username', read_only=True)  # Optional: include user name

    class Meta:
        model = Sale
        fields = [
            'id',
            'product',
            'quantity',
            'buyer_name',
            'contact_number',
            'address',
            'timestamp',
            'total_price',
            'user',  # Optional: show user who sold
        ]

    def get_total_price(self, obj):
        return obj.total_price()
    

from rest_framework import serializers
from .models import Discount


class DiscountSerializer(serializers.ModelSerializer):
    outlet_username = serializers.CharField(source='outlet.username', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Discount
        fields = [
            'id',
            'product',         # for form submission
            'product_title',   # for readable display
            'outlet',          # for form submission
            'outlet_username', # for readable display
            'discount_type',
            'amount',
            'start_date',
            'end_date',
            'created_at',
        ]

    def validate(self, data):
        discount_type = data.get('discount_type')
        amount = data.get('amount')

        if discount_type == "percentage" and amount > 20:
            raise serializers.ValidationError("Percentage discount cannot exceed 20%.")
        
        if discount_type == "value" and amount > 10000:
            raise serializers.ValidationError("Flat discount value cannot exceed ₹10,000.")

        return data
