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

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from .models import InventoryItem
from .serializers import InventoryItemSerializer

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()  # ✅ Required by DRF router
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # ✅ Admin sees all, others only their own items
        if user.role == 'admin':
            queryset = InventoryItem.objects.all()
        else:
            queryset = InventoryItem.objects.filter(owner=user)

        # ✅ Apply filters
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
        return queryset.order_by("-id")

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can add products.")
        
        # ✅ `owner` is passed from frontend dropdown (admin selects user)
        serializer.save()



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
    permission_classes = [AllowAny]
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

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Sale, BillItem

@api_view(['GET'])
def dashboard_stats(request):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return Response({"error": "Unauthorized"}, status=403)

    # 1. Sales Summary from Sale model
    sale_summary = (
        Sale.objects.values('product__title')
        .annotate(total_sold=Sum('quantity'))
    )

    # 2. Sales Summary from BillItem model
    billitem_summary = (
        BillItem.objects.values('product__title')
        .annotate(total_sold=Sum('quantity'))
    )

    # 3. Combine summaries into one dictionary
    combined_summary = {}

    for entry in sale_summary:
        title = entry['product__title']
        combined_summary[title] = combined_summary.get(title, 0) + entry['total_sold']

    for entry in billitem_summary:
        title = entry['product__title']
        combined_summary[title] = combined_summary.get(title, 0) + entry['total_sold']

    # 4. Convert combined_summary into sorted list of dicts
    sorted_summary = sorted(
        [{"product__title": k, "total_sold": v} for k, v in combined_summary.items()],
        key=lambda x: x["total_sold"],
        reverse=True
    )

    total_sold = sum([entry['total_sold'] for entry in sorted_summary])
    most_sold = sorted_summary[0]['product__title'] if sorted_summary else None

    # 5. Recent purchases from both Sale and BillItem
    recent_sales = list(
        Sale.objects.select_related("product")
        .order_by("-timestamp")[:3]
        .values("product__title", "quantity", "organization", "timestamp")
    )

    bill_items = (
        BillItem.objects.select_related("product", "bill")
        .order_by("-bill__timestamp")[:3]
    )
    recent_bills = [
        {
            "product__title": item.product.title,
            "quantity": item.quantity,
            "organization": item.bill.organization,
            "timestamp": item.bill.timestamp,
        }
        for item in bill_items
    ]

    recent_combined = sorted(
        recent_sales + recent_bills,
        key=lambda x: x["timestamp"],
        reverse=True
    )[:5]

    return Response({
        "total_sold": total_sold,
        "most_sold_product": most_sold,
        "recent_purchases": recent_combined,
        "sales_breakdown": sorted_summary,
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

# views.py
from .models import Bill, BillItem

class ConfirmPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        items = data.get("items", [])
        organization = data.get("organization")
        address = data.get("address")
        
        if not items or not organization or not address:
            return Response({"error": "Incomplete data"}, status=400)

        total = 0

        # ✅ Step 1: Calculate total without modifying DB
        for entry in items:
            try:
                product = InventoryItem.objects.get(id=entry["product"])
                qty = int(entry["quantity"])
                if qty > product.Quantity:
                    return Response({"error": f"Not enough stock for {product.title}"}, status=400)
                item_total = qty * float(product.price)
                total += item_total
            except Exception as e:
                return Response({"error": str(e)}, status=400)

        # ✅ Step 2: Determine discount and GST
        discount_percentage = 0
        if total > 10000:
            discount_percentage = 20
        elif total > 5000:
            discount_percentage = 15
        elif total > 2000:
            discount_percentage = 10
        elif total > 1000:
            discount_percentage = 5

        discount_amount = (discount_percentage / 100) * total
        gst_percentage = 18
        gst_amount = ((total - discount_amount) * gst_percentage) / 100
        final_amount = total - discount_amount + gst_amount

        # ✅ Step 3: Create Bill
        bill = Bill.objects.create(
            user=request.user,
            organization=organization,
            address=address,
            discount_percentage=discount_percentage,
            discount_amount=round(discount_amount, 2),
            gst_percentage=gst_percentage,
            gst_amount=round(gst_amount, 2)
        )

        # ✅ Step 4: Create BillItems and update stock
        for entry in items:
            try:
                product = InventoryItem.objects.get(id=entry["product"])
                qty = int(entry["quantity"])

                # Update stock
                product.Quantity -= qty
                product.save()

                BillItem.objects.create(
                    bill=bill,
                    product=product,
                    quantity=qty,
                    discount=discount_percentage,
                    gst=gst_percentage
                )

            except Exception as e:
                bill.delete()
                return Response({"error": str(e)}, status=400)

        # ✅ Step 5: Return bill summary
        return Response({
            "bill_id": bill.id,
            "original_amount": round(total, 2),
            "discount_percentage": discount_percentage,
            "discount_amount": round(discount_amount, 2),
            "gst_percentage": gst_percentage,
            "gst_amount": round(gst_amount, 2),
            "final_amount": round(final_amount, 2)
        }, status=201)




from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bill

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bill(request, bill_id):
    try:
        bill = Bill.objects.get(id=bill_id, user=request.user)
        items = bill.items.select_related("product")

        data = {
            "id": bill.id,
            "user_name": bill.user.username,  # ✅ Add this line
            "organization": bill.organization,
            "address": bill.address,
            "timestamp": bill.timestamp,
            "discount_percentage": bill.discount_percentage,
            "gst_percentage": bill.gst_percentage,
            "items": [
                {
                    "title": item.product.title,
                    "quantity": item.quantity,
                    "price": float(item.product.price),
                    "total": float(item.total_price()),
                }
                for item in items
            ],
            "total_amount": bill.total_amount()
        }

        return Response(data)

    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=404)




# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bill

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_bills(request):
    bills = Bill.objects.filter(user=request.user).order_by("-timestamp")
    data = [
        {
            "id": bill.id,
            "organization": bill.organization,
            "address": bill.address,
            "timestamp": bill.timestamp,
            "total_amount": bill.total_amount(),
        }
        for bill in bills
    ]
    return Response(data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bill

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_bills_admin(request):
    if not request.user.is_staff and request.user.role != "admin":
        return Response({"error": "Not authorized"}, status=403)

    bills = Bill.objects.all().order_by("-timestamp")
    data = []

    for bill in bills:
        items = bill.items.select_related("product")
        data.append({
            "id": bill.id,
            "user": bill.user.username,
            "organization": bill.organization,
            "address": bill.address,
            "timestamp": bill.timestamp,
            "total_amount": bill.total_amount(),
            "items": [
                {
                    "title": item.product.title,
                    "quantity": item.quantity,
                    "price": float(item.product.price),
                    "total": float(item.total_price()),
                }
                for item in items
            ],
        })

    return Response(data)
