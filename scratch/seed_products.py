import urllib.request
import json
import base64
import hmac
import hashlib
import time

gateway_url = "http://localhost:8080"
secret_b64 = "dGVzdF9zZWNyZXRfa2V5X211c3RfYmVfbWluXzMyX2J5dGVzX2xvbmdfZm9yX2hzMjU2X3NlY3VyZQ=="
secret_bytes = base64.b64decode(secret_b64)

# Create an Admin JWT token
header = {"alg": "HS256", "typ": "JWT"}
payload = {
    "sub": "admin@apexshop.com",
    "userId": 999,
    "role": "ROLE_ADMIN",
    "iat": int(time.time()),
    "exp": int(time.time()) + 86400
}

def b64url(data):
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

h_encoded = b64url(json.dumps(header).encode('utf-8'))
p_encoded = b64url(json.dumps(payload).encode('utf-8'))
signing_input = f"{h_encoded}.{p_encoded}".encode('utf-8')
signature = hmac.new(secret_bytes, signing_input, hashlib.sha256).digest()
sig_encoded = b64url(signature)
admin_token = f"{h_encoded}.{p_encoded}.{sig_encoded}"

print("Generated Admin Token:", admin_token)

products_to_seed = [
    {
        "sku": "MACBOOK-PRO-16",
        "name": "Apple MacBook Pro 16\" (M3 Max)",
        "brand": "Apple",
        "description": "Supercharged by M3 Max with a 16-core CPU, 40-core GPU, Liquid Retina XDR display, and 36GB unified memory.",
        "price": 2499.00,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "http://localhost:5173/images/products/macbook-pro.png"
    },
    {
        "sku": "SONY-WH1000XM5",
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "brand": "Sony",
        "description": "Industry-leading noise canceling with two processors, 8 microphones, Auto NC Optimizer, and 30-hour battery life.",
        "price": 399.00,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "http://localhost:5173/images/products/sony-xm5.png"
    },
    {
        "sku": "NIKE-AIR-ZOOM",
        "name": "Nike Air Zoom Pegasus 40 Running Shoes",
        "brand": "Nike",
        "description": "A springy ride for every run, familiar, just-for-you feel returns to help you accomplish your fitness goals.",
        "price": 140.00,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "http://localhost:5173/images/products/nike-air-zoom.png"
    },
    {
        "sku": "APPLE-WATCH-ULTRA",
        "name": "Apple Watch Ultra 2 (Titanium)",
        "brand": "Apple",
        "description": "The most rugged and capable Apple Watch. Designed for outdoor endurance, water sports, and extreme exploration.",
        "price": 799.00,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "http://localhost:5173/images/products/apple-watch-ultra.png"
    },
    {
        "sku": "ESPRESSO-MASTER-X",
        "name": "Breville Barista Touch Espresso Machine",
        "brand": "Breville",
        "description": "Commercial performance meets touchscreen automation. Automated microfoam milk texturing and precise PID temperature.",
        "price": 899.00,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "http://localhost:5173/images/products/espresso-master.png"
    }
]

for prod in products_to_seed:
    req = urllib.request.Request(
        f"{gateway_url}/api/catalog/products",
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {admin_token}"
        },
        data=json.dumps(prod).encode("utf-8")
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Created {prod['sku']}: Status {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"Failed {prod['sku']}: Status {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error {prod['sku']}: {str(e)}")
