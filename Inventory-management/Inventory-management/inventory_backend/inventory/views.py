from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer
from django.db.models import Q
from rest_framework import generics
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('-id')
    serializer_class = InventoryItemSerializer
    class InventoryItemViewSet(viewsets.ModelViewSet):
        serializer_class = InventoryItemSerializer

    def get_queryset(self):
        queryset = InventoryItem.objects.all()

        scheme = self.request.query_params.get("scheme")
        if scheme:
            queryset = queryset.filter(Q(title__icontains=scheme) | Q(SKU__icontains=scheme))

        supplier = self.request.query_params.get("supplier")
        if supplier:
            queryset = queryset.filter(supplier__icontains=supplier)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        start_date = self.request.query_params.get("start_date")
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        end_date = self.request.query_params.get("end_date")
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        print("✅ ViewSet filter query:", queryset.query)
        return queryset


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
    


from rest_framework import status
from rest_framework.views import APIView
from .models import Sale, InventoryItem
from .serializers import SaleSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class BuyProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        try:
            product = InventoryItem.objects.get(id=data["product"])
            qty = int(data["quantity"])

            if qty > product.Quantity:
                return Response({"error": "Not enough stock"}, status=400)

            # Update product quantity
            product.Quantity -= qty
            product.save()

            # Save the sale
            sale = Sale.objects.create(
                product=product,
                quantity=qty,
                organization=data["organization"],
                address=data["address"]
            )
            serializer = SaleSerializer(sale)
            return Response(serializer.data, status=201)

        except InventoryItem.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Sale
from datetime import timedelta
from django.utils import timezone

@api_view(['GET'])
def dashboard_stats(request):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return Response({"error": "Unauthorized"}, status=403)

    sales_summary = (
        Sale.objects.values('product__title')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')
    )

    total_sold = sales_summary.aggregate(total=Sum('total_sold'))['total'] or 0
    most_sold = sales_summary[0]['product__title'] if sales_summary else None

    recent = (
        Sale.objects.select_related("product")
        .order_by("-timestamp")[:5]
        .values("product__title", "quantity", "organization", "timestamp")
    )

    return Response({
        "total_sold": total_sold,
        "most_sold_product": most_sold,
        "recent_purchases": list(recent),
        "sales_breakdown": list(sales_summary),
    })

# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Sale

@api_view(['GET'])
def product_sales_summary(request):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return Response({"error": "Unauthorized"}, status=403)

    data = (
        Sale.objects.values('product__title')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')
    )
    return Response(data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Sale

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_sales(request):
    if request.user.role != 'admin':
        return Response({"error": "Unauthorized"}, status=403)

    Sale.objects.all().delete()
    return Response({"message": "All sales data cleared successfully."}, status=200)
