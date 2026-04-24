from django.db import models

class Product(models.Model):
    SAREE_TYPES = [
        ('kanjivaram', 'Kanjivaram'),
        ('banarasi', 'Banarasi'),
        ('linen', 'Linen'),
        ('cotton', 'Cotton'),
        ('silk', 'Silk'),
    ]

    name = models.CharField(max_length=200)
    saree_type = models.CharField(max_length=100, choices=SAREE_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.URLField()  # Cloudinary URL
    stock = models.IntegerField(default=1)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=15)
    shipping_address = models.TextField()

    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} — {self.customer_name}"