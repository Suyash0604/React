import csv
from io import StringIO
from .models import InventoryItem, Sale

def generate_stock_report():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Outlet', 'Product', 'Quantity', 'Price', 'Stock Value'])
    for item in InventoryItem.objects.all():
        writer.writerow([
            item.owner.username if item.owner else '',  # fix here
            item.title,
            item.Quantity,
            float(item.price),
            float(item.Quantity) * float(item.price)
        ])
    output.seek(0)
    return output





from io import StringIO
import csv
from .models import BillItem
from datetime import date

def generate_sales_report():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Outlet/User', 'Product', 'Quantity', 'Discount', 'Total Price', 'Buyer Name', 'Contact Number', 'Address', 'Date'])

    today = date.today()
    # Filter BillItems where bill timestamp is today
    bill_items = BillItem.objects.select_related('bill', 'product', 'bill__user').filter(bill__timestamp__date=today)

    for item in bill_items:
        writer.writerow([
            item.bill.user.username,
            item.product.title,
            item.quantity,
            f"{item.discount}%" if item.discount else "0%",
            float(item.total_price()),
            item.bill.buyer_name,
            item.bill.contact_number,
            item.bill.address,
            item.bill.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        ])

    output.seek(0)
    return output
