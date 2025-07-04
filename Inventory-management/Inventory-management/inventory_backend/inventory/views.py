from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('-id')
    serializer_class = InventoryItemSerializer

@api_view(['GET'])
def low_stock_alerts(request):
    items = InventoryItem.objects.filter(Quantity__lte=models.F('threshold'))
    serializer = InventoryItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def export_csv(request):
    import csv
    from django.http import HttpResponse

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="inventory.csv"'

    writer = csv.writer(response)
    writer.writerow(['Title', 'SKU', 'Quantity', 'Price', 'Supplier', 'Date'])

    for item in InventoryItem.objects.all():
        writer.writerow([item.title, item.SKU, item.Quantity, item.Price, item.supplier, item.Date])
    
    return response


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import LoginSerializer, UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data
            })
        return Response(serializer.errors, status=400)
    
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated

class UserListView(APIView):
    permission_classes = [IsAuthenticated]  # Only allow logged in users

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import UserSerializer
from django.contrib.auth.hashers import make_password

class RegisterView(APIView):
    def post(self, request):
        data = request.data
        if data.get("password") != data.get("confirm_password"):
            return Response({"error": "Passwords do not match"}, status=400)

        # Set default role = 'user'
        data["role"] = "user"

        try:
            user = CustomUser.objects.create(
                username=data["username"],
                email=data["email"],
                contact=data["contact"],
                password=make_password(data["password"]),
                role="user"
            )
            serializer = UserSerializer(user)
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Supplier
from .serializers import SupplierSerializer

from rest_framework.exceptions import PermissionDenied

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('-created_at')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Supplier.objects.all()
        return Supplier.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin users can add suppliers.")
        serializer.save()

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer

class CurrentUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
from rest_framework import generics
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryListCreateView(generics.ListCreateAPIView):
    serializer_class = InventoryItemSerializer

    def get_queryset(self):
        queryset = InventoryItem.objects.all()

        # FILTER: Scheme (title or SKU contains)
        scheme = self.request.query_params.get("scheme")
        if scheme:
            queryset = queryset.filter(title__icontains=scheme) | queryset.filter(SKU__icontains=scheme)

        # FILTER: Supplier
        supplier = self.request.query_params.get("supplier")
        if supplier:
            queryset = queryset.filter(supplier__icontains=supplier)

        # FILTER: Price Range
        min_price = self.request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(Price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(Price__lte=max_price)

        # FILTER: Date Range
        start_date = self.request.query_params.get("start_date")
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        end_date = self.request.query_params.get("end_date")
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        return queryset
