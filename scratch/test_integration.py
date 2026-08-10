import urllib.request
import json
import time
import sys

print("--------------------------------------------------")
print("Bootstrap Integration Test Suite")
print("--------------------------------------------------")

gateway_url = "http://localhost:8080"

def make_request(url, method="GET", data=None, token=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    body = None
    if data:
        body = json.dumps(data).encode("utf-8")
        
    try:
        with urllib.request.urlopen(req, data=body) as response:
            resp_body = response.read().decode("utf-8")
            return response.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(resp_body) if resp_body else {}
        except:
            return e.code, {"message": resp_body}
    except Exception as e:
        return 500, {"message": str(e)}

# 1. Register customer
customer_payload = {
    "firstName": "John",
    "lastName": "Doe",
    "email": "customer@example.com",
    "password": "P@ssword123",
    "phoneNumber": "1234567890"
}
status, resp = make_request(f"{gateway_url}/api/identity/users", "POST", customer_payload)
print(f"Customer registration response code: {status}")

# 2. Login customer
login_payload = {
    "email": "customer@example.com",
    "password": "P@ssword123"
}
status, resp = make_request(f"{gateway_url}/api/identity/auth/login", "POST", login_payload)
print(f"Customer login response code: {status}")
if status != 200 or "accessToken" not in resp:
    print("Login failed. Cannot retrieve access token.")
    sys.exit(1)

token = resp["accessToken"]
print("Successfully retrieved Bearer JWT.")

# 3. Public API Check
status, resp = make_request(f"{gateway_url}/api/catalog/products/slug/pixel-9-pro", "GET")
print(f"Public GET catalog product response code: {status}")
if status == 200:
    print(f"Product Brand: {resp.get('data', {}).get('brand')}, Name: {resp.get('data', {}).get('name')}")

# 4. Create Order (Happy Path)
order_payload = {
    "customerId": 1,
    "items": [
        {
            "sku": "PIXEL-9",
            "price": 999.00,
            "quantity": 2
        }
    ]
}
status, resp = make_request(f"{gateway_url}/api/orders", "POST", order_payload, token)
print(f"Happy path order creation status: {status}")
order_num = None
if status == 201:
    order_data = resp.get("data", {})
    order_num = order_data.get("orderNumber")
    print(f"Order submitted successfully! Order Number: {order_num}")

# Allow async Saga processing to complete
if order_num:
    print("Waiting 5 seconds for Saga choreography processing...")
    time.sleep(5)
    
    status, resp = make_request(f"{gateway_url}/api/orders/{order_num}", "GET", token=token)
    print(f"Check Order Status code: {status}")
    if status == 200:
        print(f"Saga Completed - Order Status is: {resp.get('data', {}).get('orderStatus')}")

# 5. Create Order (Payment Failure Compensating Flow)
order_fail_payload = {
    "customerId": 1,
    "items": [
        {
            "sku": "PIXEL-9-PAYFAIL",
            "price": 999.00,
            "quantity": 1
        }
    ]
}
status, resp = make_request(f"{gateway_url}/api/orders", "POST", order_fail_payload, token)
print(f"Failure simulation order creation status: {status}")
order_fail_num = None
if status == 201:
    order_data = resp.get("data", {})
    order_fail_num = order_data.get("orderNumber")
    print(f"Order submitted successfully! Order Number: {order_fail_num}")

if order_fail_num:
    print("Waiting 5 seconds for rollback/compensation processing...")
    time.sleep(5)
    
    status, resp = make_request(f"{gateway_url}/api/orders/{order_fail_num}", "GET", token=token)
    print(f"Check Failed Order Status code: {status}")
    if status == 200:
        print(f"Saga Rolled Back - Order Status is: {resp.get('data', {}).get('orderStatus')}")

print("--------------------------------------------------")
print("Tests Completed.")
print("--------------------------------------------------")
