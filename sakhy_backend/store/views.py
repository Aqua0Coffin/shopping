import razorpay
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .models import Product, Order

client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))


@api_view(['POST'])
def create_razorpay_order(request):
    product_id = request.data['product_id']
    quantity = int(request.data['quantity'])

    product = Product.objects.get(id=product_id)
    total_amount = int(product.price * quantity * 100)

    razorpay_order = client.order.create({
        "amount": total_amount,
        "currency": "INR",
        "payment_capture": 1
    })

    order = Order.objects.create(
        customer_name=request.data['name'],
        customer_email=request.data['email'],
        customer_phone=request.data['phone'],
        shipping_address=request.data['address'],
        product=product,
        quantity=quantity,
        total_amount=product.price * quantity,
        razorpay_order_id=razorpay_order['id']
    )

    return Response({
        "razorpay_order_id": razorpay_order['id'],
        "amount": total_amount,
        "order_id": order.id
    })

@api_view(['POST'])
def verify_payment(request):
    order = Order.objects.get(id=request.data['order_id'])

    order.razorpay_payment_id = request.data['razorpay_payment_id']
    order.status = 'paid'
    order.save()

    # reduce stock
    order.product.stock -= order.quantity
    order.product.save()

    return Response({"message": "Payment successful"})