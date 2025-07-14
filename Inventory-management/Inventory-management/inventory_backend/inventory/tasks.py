from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from .utils import generate_stock_report, generate_sales_report

@shared_task
def send_stock_report():
    csv_file = generate_stock_report()
    email = EmailMessage(
        subject='Daily Stock Report - 4 AM',
        body='Please find attached the daily stock report.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=['admin@example.com']
    )
    email.attach('stock_report.csv', csv_file.getvalue(), 'text/csv')
    email.send()

@shared_task
def send_sales_and_stock_report():
    stock_csv = generate_stock_report()
    sales_csv = generate_sales_report()
    email = EmailMessage(
        subject='Sales and Stock Report',
        body='Please find attached the sales and stock reports.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=['suyash.gaikwad22@vit.edu']
    )
    email.attach('stock_report.csv', stock_csv.getvalue(), 'text/csv')
    email.attach('sales_report.csv', sales_csv.getvalue(), 'text/csv')
    email.send()
