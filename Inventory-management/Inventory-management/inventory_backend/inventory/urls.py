from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, InventoryItemViewSet, low_stock_alerts, export_csv
from .views import UserListView
from .views import SupplierViewSet
from .views import CurrentUserView
from .views import BuyProductView
from .views import product_sales_summary
from .views import dashboard_stats
from .views import clear_all_sales
from .views import ConfirmPurchaseView, get_bill
from .views import all_bills
from .views import all_bills_admin
router = DefaultRouter()
router.register(r'inventory', InventoryItemViewSet)
router.register(r'suppliers', SupplierViewSet)



urlpatterns = [
    path('', include(router.urls)),
    path('alerts/', low_stock_alerts),
    path('export/', export_csv),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
    path('buy/', BuyProductView.as_view(), name='buy-product'),
    path('confirm_purchase/', ConfirmPurchaseView.as_view(), name='confirm-purchase'),  # ✅ ADD THIS
    path('bill/<int:bill_id>/', get_bill, name='get-bill'),  # ✅ Optional, but useful
    path('sales-summary/', product_sales_summary),
    path("dashboard-stats/", dashboard_stats),
    path("clear-sales/", clear_all_sales, name="clear-sales"),
    path("my-bills/", all_bills),
    path("all-bills/", all_bills_admin),
]

