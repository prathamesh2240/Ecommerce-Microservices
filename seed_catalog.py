import urllib.request
import json
import subprocess
import time

PRODUCT_API = "http://localhost:8082/api/catalog/products"
INVENTORY_API = "http://localhost:8084/api/inventory/items"

CATEGORIES = [
    {"id": 1, "name": "Electronics", "slug": "electronics"},
    {"id": 2, "name": "Fashion & Apparel", "slug": "fashion"},
    {"id": 3, "name": "Home & Kitchen", "slug": "home-kitchen"},
    {"id": 4, "name": "Sports & Outdoors", "slug": "sports"},
    {"id": 5, "name": "Books & Accessories", "slug": "books"},
]

PRODUCTS = [
    # Electronics
    {
        "sku": "TECH-WH-001",
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "brand": "Sony",
        "description": "Industry-leading noise cancelling with two processors and 8 microphones. Ultra-comfortable lightweight design with 30-hour battery life and quick charging.",
        "price": 399.99,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
        "stock": 45
    },
    {
        "sku": "TECH-KB-002",
        "name": "Logitech MX Mechanical Wireless Keyboard",
        "brand": "Logitech",
        "description": "Tactile quiet switches, fluid ergonomic typing, dual-colored keycaps, and multi-device Bluetooth/Logi Bolt connectivity with smart backlighting.",
        "price": 169.99,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80",
        "stock": 30
    },
    {
        "sku": "TECH-MS-003",
        "name": "Logitech MX Master 3S Wireless Mouse",
        "brand": "Logitech",
        "description": "Any-surface 8K DPI sensor, quiet click switches, electromagnetic MagSpeed scrolling, and ergonomic silhouette tailored for long coding and creative sessions.",
        "price": 99.99,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80",
        "stock": 60
    },
    {
        "sku": "TECH-SW-004",
        "name": "Apple Watch Series 9 GPS 45mm",
        "brand": "Apple",
        "description": "S9 SiP chip, double tap gesture interaction, brighter display, precision phone finding, and advanced health sensors including ECG and blood oxygen metrics.",
        "price": 429.00,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80",
        "stock": 25
    },
    {
        "sku": "TECH-SP-005",
        "name": "JBL Charge 5 Portable Bluetooth Speaker",
        "brand": "JBL",
        "description": "Bold JBL Original Pro Sound with long excursion driver, separate tweeter, and dual pumping radiators. IP67 waterproof and built-in powerbank.",
        "price": 179.95,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&auto=format&fit=crop&q=80",
        "stock": 40
    },
    {
        "sku": "TECH-CH-006",
        "name": "Anker 737 GaNPrime 120W Fast Charger",
        "brand": "Anker",
        "description": "Ultra-fast charging for 3 devices simultaneously with 2 USB-C ports and 1 USB-A port. ActiveShield 2.0 temperature protection in a compact form factor.",
        "price": 89.99,
        "currency": "USD",
        "categoryId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80",
        "stock": 80
    },

    # Fashion & Apparel
    {
        "sku": "FASH-SN-001",
        "name": "Nike Air Zoom Pegasus 40 Running Shoes",
        "brand": "Nike",
        "description": "Springy ride for daily mileage. Dual Zoom Air units and React foam midsole deliver responsive cushioning with engineered mesh upper for airflow.",
        "price": 129.99,
        "currency": "USD",
        "categoryId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
        "stock": 35
    },
    {
        "sku": "FASH-BP-002",
        "name": "Herschel Little America Casual Backpack",
        "brand": "Herschel",
        "description": "Iconic mountaineering silhouette with padded fleece-lined 15-inch laptop sleeve, magnetic strap closures, and breathable air mesh back padding.",
        "price": 109.99,
        "currency": "USD",
        "categoryId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80",
        "stock": 20
    },
    {
        "sku": "FASH-TS-003",
        "name": "Patagonia Organic Cotton Crewneck T-Shirt",
        "brand": "Patagonia",
        "description": "Fair Trade Certified sewn from 100% regeneratively grown organic cotton jersey. Taped shoulder seams for comfort and shape retention.",
        "price": 45.00,
        "currency": "USD",
        "categoryId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80",
        "stock": 90
    },
    {
        "sku": "FASH-JK-004",
        "name": "The North Face Resolve 2 Waterproof Jacket",
        "brand": "The North Face",
        "description": "DryVent 2L breathable shell with mesh lining, adjustable stowable hood, elastic cuffs, and storm flap for outdoor hiking and stormy weather.",
        "price": 110.00,
        "currency": "USD",
        "categoryId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1544441893-675973e31985?w=300&auto=format&fit=crop&q=80",
        "stock": 15
    },
    {
        "sku": "FASH-SG-005",
        "name": "Ray-Ban Classic Polarized Aviator Sunglasses",
        "brand": "Ray-Ban",
        "description": "Timeless teardrop frame in polished gold finish with polarized G-15 green mineral crystal lenses offering 100% UV protection and superior clarity.",
        "price": 165.00,
        "currency": "USD",
        "categoryId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&auto=format&fit=crop&q=80",
        "stock": 40
    },

    # Home & Kitchen
    {
        "sku": "HOME-DL-001",
        "name": "BenQ WiT Eye-Care LED Desk Lamp",
        "brand": "BenQ",
        "description": "Wide curved illumination head providing 150% wider lighting area. Ambient light sensor automatically adjusts brightness for eye protection.",
        "price": 189.00,
        "currency": "USD",
        "categoryId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=300&auto=format&fit=crop&q=80",
        "stock": 22
    },
    {
        "sku": "HOME-WB-002",
        "name": "Hydro Flask 32 oz Stainless Steel Water Bottle",
        "brand": "Hydro Flask",
        "description": "TempShield double-wall vacuum insulation keeps drinks cold up to 24 hours or hot up to 12 hours. Pro-grade 18/8 stainless steel construction.",
        "price": 44.95,
        "currency": "USD",
        "categoryId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop&q=80",
        "stock": 75
    },
    {
        "sku": "HOME-CK-003",
        "name": "Ninja Foodi NeverStick 10-Piece Cookware Set",
        "brand": "Ninja",
        "description": "Premium nonstick cookware manufactured at 30,000°F that will never chip, flake, or stick. Oven safe up to 500°F with stainless steel handles.",
        "price": 299.99,
        "currency": "USD",
        "categoryId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1584990347449-a6e5a6a7d512?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1584990347449-a6e5a6a7d512?w=300&auto=format&fit=crop&q=80",
        "stock": 18
    },
    {
        "sku": "HOME-CF-004",
        "name": "Nespresso VertuoPlus Coffee & Espresso Maker",
        "brand": "Nespresso",
        "description": "Centrifusion extraction technology brews freshly brewed coffee with crema or authentic espresso at the touch of a single button. 40oz reservoir.",
        "price": 159.00,
        "currency": "USD",
        "categoryId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&auto=format&fit=crop&q=80",
        "stock": 30
    },
    {
        "sku": "HOME-BL-005",
        "name": "NutriBullet Pro 900W Personal Blender",
        "brand": "NutriBullet",
        "description": "Compact high-speed blender with 900 watts of power to pulverize seeds, leafy greens, tough stems, and frozen fruit into silky smoothies.",
        "price": 79.99,
        "currency": "USD",
        "categoryId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&auto=format&fit=crop&q=80",
        "stock": 50
    },

    # Sports & Outdoors
    {
        "sku": "SPRT-YM-001",
        "name": "Lululemon 5mm Reversible Yoga Mat",
        "brand": "Lululemon",
        "description": "Natural rubber base gives cushioning with textured grip on both sides. Antimicrobial additive repels mold, mildews, and odor-causing bacteria.",
        "price": 88.00,
        "currency": "USD",
        "categoryId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=300&auto=format&fit=crop&q=80",
        "stock": 40
    },
    {
        "sku": "SPRT-RB-002",
        "name": "Theraband Professional Resistance Bands Set",
        "brand": "Theraband",
        "description": "Color-coded progressive resistance exercise bands for physical therapy, strength conditioning, and pilates flexibility workouts.",
        "price": 24.99,
        "currency": "USD",
        "categoryId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=300&auto=format&fit=crop&q=80",
        "stock": 85
    },
    {
        "sku": "SPRT-DB-003",
        "name": "Bowflex SelectTech 552 Adjustable Dumbbells",
        "brand": "Bowflex",
        "description": "Replaces 15 sets of weights with a single dial system. Adjusts from 5 to 52.5 lbs in 2.5-lb increments for full-body home workouts.",
        "price": 429.00,
        "currency": "USD",
        "categoryId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=300&auto=format&fit=crop&q=80",
        "stock": 12
    },
    {
        "sku": "SPRT-FL-004",
        "name": "Coleman Sundome 4-Person Camping Tent",
        "brand": "Coleman",
        "description": "WeatherTec system with inverted seams, ground vent, and mesh storage pockets. 10-minute setup with snag-free continuous pole sleeves.",
        "price": 99.99,
        "currency": "USD",
        "categoryId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&auto=format&fit=crop&q=80",
        "stock": 16
    },
    {
        "sku": "SPRT-TR-005",
        "name": "Black Diamond Trail Pro Trekking Poles",
        "brand": "Black Diamond",
        "description": "Dual FlickLock Pro adjustability with updated aluminum construction and SmashLock quick-release technology for rugged mountain trails.",
        "price": 139.95,
        "currency": "USD",
        "categoryId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&auto=format&fit=crop&q=80",
        "stock": 25
    },

    # Books & Accessories
    {
        "sku": "BOOK-EB-001",
        "name": "Amazon Kindle Paperwhite 16GB Display",
        "brand": "Amazon",
        "description": "6.8-inch glare-free 300 ppi display with warm light adjustment, weeks of battery life, IPX8 waterproof rating, and 20% faster page turns.",
        "price": 149.99,
        "currency": "USD",
        "categoryId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
        "stock": 40
    },
    {
        "sku": "BOOK-NT-002",
        "name": "Moleskine Classic Hardcover Dotted Notebook",
        "brand": "Moleskine",
        "description": "Acid-free 70 gsm ivory paper, rounded corners, ribbon bookmark, and expandable inner pocket. Perfect for bullet journaling and sketching.",
        "price": 22.95,
        "currency": "USD",
        "categoryId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80",
        "stock": 65
    },
    {
        "sku": "BOOK-CS-003",
        "name": "Tom Bihn Cache Protective Laptop Sleeve",
        "brand": "Tom Bihn",
        "description": "Heavy-duty 1050D ballistic nylon exterior lined with 6mm thick closed-cell foam padding and ultrasuede interior for laptops and tablets.",
        "price": 48.00,
        "currency": "USD",
        "categoryId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80",
        "stock": 30
    },
    {
        "sku": "BOOK-BK-004",
        "name": "Clean Code - A Handbook of Agile Software Craftsmanship",
        "brand": "Prentice Hall",
        "description": "Legendary software engineering reference by Robert C. Martin. Learn principles, patterns, and best practices to write robust, maintainable code.",
        "price": 49.99,
        "currency": "USD",
        "categoryId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=800&auto=format&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=300&auto=format&fit=crop&q=80",
        "stock": 50
    }
]

def get_existing_skus():
    try:
        url = f"{PRODUCT_API}/search?size=100"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get("data", {}).get("content", [])
            return {item["sku"]: item["id"] for item in items}
    except Exception as e:
        print(f"Error checking existing products: {e}")
        return {}

def seed_products():
    existing_skus = get_existing_skus()
    print(f"Found {len(existing_skus)} existing products.")

    added = 0
    for p in PRODUCTS:
        sku = p["sku"]
        if sku in existing_skus:
            print(f"[SKIP] SKU {sku} already exists.")
            continue

        req_body = {
            "sku": p["sku"],
            "name": p["name"],
            "brand": p["brand"],
            "description": p["description"],
            "price": p["price"],
            "currency": p["currency"],
            "categoryId": p["categoryId"],
            "imageUrl": p["imageUrl"],
            "thumbnailUrl": p["thumbnailUrl"]
        }

        req = urllib.request.Request(
            PRODUCT_API,
            data=json.dumps(req_body).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status in (200, 201):
                    res_data = json.loads(resp.read().decode('utf-8'))
                    prod_id = res_data.get("data", {}).get("id")
                    print(f"[CREATED] ID: {prod_id} | SKU: {sku} | {p['name']}")
                    added += 1
                else:
                    print(f"[ERROR] HTTP {resp.status} for {sku}")
        except urllib.error.HTTPError as e:
            print(f"[FAIL] HTTP {e.code} for {sku}: {e.read().decode('utf-8')}")
        except Exception as e:
            print(f"[FAIL] Unexpected error for {sku}: {e}")

    print(f"\nSuccessfully added {added} new products. Total catalog size: {len(existing_skus) + added}")

def seed_inventory():
    print("\nEnsuring inventory records in inventorydb...")
    sql_statements = []
    for p in PRODUCTS:
        sku = p["sku"]
        qty = p["stock"]
        sql_statements.append(
            f"INSERT INTO inventories (sku, warehouse_id, available_quantity, reserved_quantity, committed_quantity, reorder_level, status, version, created_at, updated_at) "
            f"VALUES ('{sku}', 1, {qty}, 0, 0, 10, 'ACTIVE', 0, NOW(), NOW()) "
            f"ON CONFLICT (sku, warehouse_id) DO UPDATE SET available_quantity = {qty};"
        )
    
    full_sql = " ".join(sql_statements)
    cmd = ["kubectl", "exec", "-n", "ecommerce", "deploy/postgres", "--", "psql", "-U", "postgres", "-d", "inventorydb", "-c", full_sql]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("Inventory records updated successfully for all SKUs!")
    else:
        print(f"Error seeding inventory: {res.stderr}")

if __name__ == "__main__":
    seed_products()
    seed_inventory()
