from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryItemViewSet, low_stock_alerts, export_csv

router = DefaultRouter()
router.register(r'inventory', InventoryItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('alerts/', low_stock_alerts),
    path('export/', export_csv),
]
