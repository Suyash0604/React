from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from django.db.models import Q, Sum
from django.contrib.auth.hashers import make_password
from django.utils.timezone import now
from .models import InventoryItem, CustomUser, Supplier, Sale, Bill, BillItem
from rest_framework.authtoken.models import Token
from .serializers import (
    InventoryItemSerializer, UserSerializer, LoginSerializer,
    SupplierSerializer, SaleSerializer
)

# Inventory ViewSet
class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            queryset = InventoryItem.objects.all()
        else:
            queryset = InventoryItem.objects.filter(owner=user)

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

        return queryset.order_by("-id")

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can add products.")
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

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})
        return Response(serializer.errors, status=400)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        if data.get("password") != data.get("confirm_password"):
            return Response({"error": "Passwords do not match"}, status=400)
        data["role"] = "user"
        try:
            user = CustomUser.objects.create(
                username=data["username"],
                email=data["email"],
                contact=data["contact"],
                password=make_password(data["password"]),
                role="user"
            )
            return Response(UserSerializer(user).data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        users = CustomUser.objects.all()
        return Response(UserSerializer(users, many=True).data)

class CurrentUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('-created_at')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Supplier.objects.all() if self.request.user.role == 'admin' else Supplier.objects.none()
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin users can add suppliers.")
        serializer.save()

class BuyProductView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data
        try:
            product = InventoryItem.objects.get(id=data["product"])
            qty = int(data["quantity"])
            if qty > product.Quantity:
                return Response({"error": "Not enough stock"}, status=400)
            product.Quantity -= qty
            product.save()
            sale = Sale.objects.create(
                product=product,
                quantity=qty,
                buyer_name=data["buyer_name"],
                contact_number=data["contact_number"],
                address=data["address"]
            )
            return Response(SaleSerializer(sale).data, status=201)
        except InventoryItem.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Sale, InventoryItem
from collections import defaultdict
from django.utils import timezone
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    if user.role != 'admin':
        return Response(status=403)

    today = timezone.now().date()
    bill_items = BillItem.objects.select_related('product', 'bill', 'bill__user')

    total_sold_today = bill_items.filter(bill__timestamp__date=today).count()

    recent_purchases = bill_items.order_by('-bill__timestamp')[:5]
    recent_data = [
        {
            "product__title": item.product.title,
            "quantity": item.quantity,
            "buyer_name": item.bill.buyer_name,
            "timestamp": item.bill.timestamp,
        }
        for item in recent_purchases
    ]

    sales_by_date = {}
    for item in bill_items:
        date = item.bill.timestamp.date().isoformat()
        if date not in sales_by_date:
            sales_by_date[date] = []
        sales_by_date[date].append({
            "product": item.product.title,
            "buyer_name": item.bill.buyer_name,
            "timestamp": item.bill.timestamp,
            "quantity": item.quantity,
        })

    product_sales = bill_items.values("product__title").annotate(total_sold=Sum("quantity")).order_by("-total_sold")
    most_sold = product_sales.first()["product__title"] if product_sales else None

    return Response({
        "total_sold": total_sold_today,
        "most_sold_product": most_sold,
        "recent_purchases": recent_data,
        "sales_by_date": sales_by_date,
        "sales_breakdown": list(product_sales),
    })


@api_view(['GET'])
def product_sales_summary(request):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return Response({"error": "Unauthorized"}, status=403)
    data = Sale.objects.values('product__title').annotate(total_sold=Sum('quantity')).order_by('-total_sold')
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_sales(request):
    if request.user.role != 'admin':
        return Response({"error": "Unauthorized"}, status=403)
    Sale.objects.all().delete()
    return Response({"message": "All sales data cleared successfully."}, status=200)
     # import the new model

from datetime import date
from .models import Discount

from decimal import Decimal
from datetime import date
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import InventoryItem, Bill, BillItem, Discount

class ConfirmPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        items = data.get("items", [])
        buyer_name = data.get("buyer_name")
        contact_number = data.get("contact_number")
        address = data.get("address")

        if not items or not buyer_name or not contact_number or not address:
            return Response({"error": "Incomplete data"}, status=400)

        total = Decimal("0")
        total_discount_amount = Decimal("0")
        discount_percentage_total = Decimal("0")

        bill = Bill.objects.create(
            user=request.user,
            buyer_name=buyer_name,
            contact_number=contact_number,
            address=address,
        )

        for entry in items:
            try:
                product = InventoryItem.objects.get(id=entry["product"])
                qty = int(entry["quantity"])

                if qty > product.Quantity:
                    bill.delete()
                    return Response({"error": f"Not enough stock for {product.title}"}, status=400)

                product_total = Decimal(qty) * product.price
                today = date.today()

                # Check for applicable discount
                discount = Discount.objects.filter(
                    product=product,
                    outlet=request.user,
                    start_date__lte=today,
                    end_date__gte=today
                ).first()

                discount_amount = Decimal("0")
                discount_percentage = Decimal("0")

                if discount:
                    if discount.discount_type == "percentage":
                        discount_percentage = Decimal(str(discount.amount))
                        discount_amount = (discount_percentage / Decimal("100")) * product_total
                    elif discount.discount_type == "value":
                        discount_amount = Decimal(str(discount.amount))
                        discount_percentage = Decimal("0")

                total += product_total
                total_discount_amount += discount_amount
                discount_percentage_total += discount_percentage

                product.Quantity -= qty
                product.save()

                BillItem.objects.create(
                    bill=bill,
                    product=product,
                    quantity=qty,
                    discount=float(discount_percentage),  # still store as float
                    gst=18
                )

            except Exception as e:
                bill.delete()
                return Response({"error": str(e)}, status=400)

        gst_percentage = Decimal("18")
        gst_amount = ((total - total_discount_amount) * gst_percentage) / Decimal("100")
        final_amount = total - total_discount_amount + gst_amount

        bill.discount_percentage = float(discount_percentage_total)
        bill.discount_amount = float(total_discount_amount)
        bill.gst_percentage = float(gst_percentage)
        bill.gst_amount = float(gst_amount)
        bill.save()

        return Response({
            "bill_id": bill.id,
            "original_amount": float(total),
            "discount_percentage": float(discount_percentage_total),
            "discount_amount": float(total_discount_amount),
            "gst_percentage": float(gst_percentage),
            "gst_amount": float(gst_amount),
            "final_amount": float(final_amount)
        }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bill(request, bill_id):
    try:
        bill = Bill.objects.get(id=bill_id, user=request.user)
        items = BillItem.objects.filter(bill=bill).select_related("product")

        return Response({
            "id": bill.id,
            "user_name": bill.user.username,
            "buyer_name": bill.buyer_name,
            "contact_number": bill.contact_number,
            # "organization": bill.organization,
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
        })

    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=404)

from .models import BillItem
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_bills(request):
    bills = Bill.objects.filter(user=request.user).order_by("-timestamp")
    return Response([
        {
            "id": bill.id,
            "address": bill.address,
            "timestamp": bill.timestamp,
            "total_amount": bill.total_amount(),
        } for bill in bills
    ])

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_bills_admin(request):
    if not request.user.is_staff and request.user.role != "admin":
        return Response({"error": "Not authorized"}, status=403)
    bills = Bill.objects.all().order_by("-timestamp")
    return Response([
        {
            "id": bill.id,
            "user": bill.user.username,
            "address": bill.address,
            "timestamp": bill.timestamp,
            "total_amount": bill.total_amount(),
            "items": [
                {
                    "title": item.product.title,
                    "quantity": item.quantity,
                    "price": float(item.product.price),
                    "total": float(item.total_price()),
                } for item in bill.items.select_related("product")
            ]
        } for bill in bills
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_sales(request):
    user = request.user
    bill_items = (
        BillItem.objects.select_related('product', 'bill', 'bill__user')
        if user.role == 'admin'
        else BillItem.objects.select_related('product', 'bill').filter(bill__user=user)
    )

    return Response([
        {
            "product": item.product.title,
            "quantity": item.quantity,
            "buyer_name": item.bill.buyer_name,            
            "contact_number": item.bill.contact_number,     
            "address": item.bill.address,
            "timestamp": item.bill.timestamp,
            "user": item.bill.user.username,
            "total_price": float(item.total_price()),
        }
        for item in bill_items
    ])

from rest_framework import viewsets, permissions
from .models import Discount
from .serializers import DiscountSerializer

class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"

class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all().order_by("-created_at")
    serializer_class = DiscountSerializer
    permission_classes = [IsAdminOnly]
    
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import EmailMessage

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bill_email(request):
    email = request.data.get('email')
    bill_id = request.data.get('bill_id')
    pdf_file = request.FILES.get('pdf')

    if not email or not pdf_file:
        return Response({'error': 'Missing email or PDF'}, status=400)

    subject = f"Your Bill #{bill_id} from Inventory System"
    body = "Please find your bill attached."

    message = EmailMessage(
        subject,
        body,
        'suyash.gaikwad@vit.edu',  
        [email]
    )
    message.attach(f"Bill-{bill_id}.pdf", pdf_file.read(), 'application/pdf')
    message.send()

    return Response({'status': 'success'})
