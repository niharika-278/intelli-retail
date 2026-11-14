import pandas as pd
from faker import Faker
import random
import hashlib
import bcrypt

fake = Faker()


customers = pd.read_csv("olist_customers_dataset.csv")
#formatting city titles
customers["customer_city"] = customers["customer_city"].str.title()
#generating customer names 
customers["customer_name"] = [fake.name() for _ in range(len(customers))]
customers.to_csv("customers_updated.csv", index=False)
print("Cleaned successfully!")


orders=pd.read_csv("olist_orders_dataset.csv")
# Drop unnecessary columns
orders = orders.drop(columns=["order_status","order_approved_at","order_delivered_carrier_date","order_delivered_customer_date","order_estimated_delivery_date"])
# Save the cleaned dataset
import pandas as pd
payments = pd.read_csv("olist_order_payments_dataset.csv")
payment_totals = payments.groupby("order_id")["payment_value"].sum().reset_index()
payment_totals.rename(columns={"payment_value": "total_amount"}, inplace=True)
orders = orders.merge(payment_totals, on="order_id", how="left")
orders.to_csv("orders_updated.csv", index=False)
print("Last 4 columns removed.")


products= pd.read_csv('olist_products_dataset.csv')
categories = pd.read_csv('product_category_name_translation.csv')
translation_dict = dict(zip(categories['product_category_name'], categories['product_category_name_english']))
# replace the original column with English translation
products['product_category_name'] = products['product_category_name'].map(translation_dict)
# Save the translated table
products.to_csv('products_updated.csv', index=False)
print("Translation completed!")


products = pd.read_csv('products_updated.csv')
# Drop unnecessary columns
products = products.drop(columns=["product_name_lenght","product_description_lenght","product_photos_qty","product_weight_g","product_length_cm","product_height_cm","product_width_cm"])

name_templates = {
    'health_beauty': ['Skin Cream', 'Vitamin Pack', 'Health Supplement'],
    'computers_accessories': ['Wireless Mouse', 'Laptop Bag', 'USB Hub'],
    'auto': ['Car Air Freshener', 'Tire Pressure Gauge', 'LED Headlights'],
    'bed_bath_table': ['Cotton Bedsheet', 'Bath Towel Set', 'Table Runner'],
    'furniture_decor': ['Wooden Chair', 'Modern Lamp', 'Coffee Table'],
    'sports_leisure': ['Yoga Mat', 'Football', 'Tennis Racket'],
    'perfumery': ['Luxury Perfume', 'Floral Essence', 'Fresh Scent'],
    'housewares': ['Kitchen Utensil Set', 'Cleaning Brush', 'Storage Box'],
    'telephony': ['Smartphone Case', 'Screen Protector', 'Bluetooth Headset'],
    'watches_gifts': ['Analog Watch', 'Gift Set', 'Leather Wallet'],
    'food_drink': ['Organic Honey', 'Energy Bar', 'Coffee Beans'],
    'baby': ['Baby Onesie', 'Soft Blanket', 'Baby Bottle'],
    'stationery': ['Notebook', 'Pen Set', 'Sketch Pad'],
    'tablets_printing_image': ['Graphic Tablet', 'Ink Cartridge', 'Printer Paper'],
    'toys': ['Puzzle Game', 'Action Figure', 'Building Blocks'],
    'fixed_telephony': ['Corded Phone', 'Office Telephone', 'Phone Stand'],
    'garden_tools': ['Pruning Shears', 'Garden Hose', 'Rake'],
    'fashion_bags_accessories': ['Leather Handbag', 'Backpack', 'Wallet'],
    'small_appliances': ['Electric Kettle', 'Toaster', 'Blender'],
    'consoles_games': ['Gaming Console', 'Game Controller', 'VR Headset'],
    'audio': ['Wireless Speaker', 'Headphones', 'Bluetooth Soundbar'],
    'fashion_shoes': ['Sneakers', 'Leather Shoes', 'Sandals'],
    'cool_stuff': ['Novelty Mug', 'LED Desk Lamp', 'Magic Cube'],
    'luggage_accessories': ['Travel Bag', 'Suitcase', 'Luggage Tag'],
    'air_conditioning': ['Portable Fan', 'Air Cooler', 'Dehumidifier'],
    'construction_tools_construction': ['Hammer Drill', 'Cement Mixer', 'Measuring Tape'],
    'kitchen_dining_laundry_garden_furniture': ['Dining Chair', 'Kitchen Stool', 'Laundry Rack'],
    'costruction_tools_garden': ['Shovel', 'Garden Gloves', 'Wheelbarrow'],
    'fashion_male_clothing': ['Casual Shirt', 'Jeans', 'Jacket'],
    'pet_shop': ['Dog Leash', 'Cat Bed', 'Pet Toy'],
    'office_furniture': ['Office Chair', 'Desk Organizer', 'Filing Cabinet'],
    'market_place': ['Voucher', 'Gift Card', 'Coupon Pack'],
    'electronics': ['Smartphone', 'Tablet', 'Portable Charger'],
    'home_appliances': ['Microwave', 'Vacuum Cleaner', 'Blender'],
    'party_supplies': ['Birthday Banner', 'Party Balloons', 'Party Hats'],
    'home_confort': ['Scented Candle', 'Throw Pillow', 'Rug'],
    'costruction_tools_tools': ['Screwdriver Set', 'Electric Drill', 'Wrench Set'],
    'agro_industry_and_commerce': ['Fertilizer Bag', 'Seeds Pack', 'Agricultural Gloves'],
    'furniture_mattress_and_upholstery': ['Queen Mattress', 'Sofa Cushion', 'Recliner Chair'],
    'books_technical': ['Engineering Handbook', 'Programming Guide', 'Physics Textbook'],
    'home_construction': ['Concrete Mix', 'Bricks Pack', 'Construction Helmet'],
    'musical_instruments': ['Acoustic Guitar', 'Keyboard', 'Drum Set'],
    'furniture_living_room': ['Sofa', 'Coffee Table', 'TV Stand'],
    'construction_tools_lights': ['LED Work Lamp', 'Portable Floodlight', 'Ceiling Lamp'],
    'industry_commerce_and_business': ['Invoice Book', 'Barcode Scanner', 'Business Card Holder'],
    'food': ['Organic Rice', 'Canned Beans', 'Olive Oil'],
    'art': ['Paint Set', 'Canvas', 'Clay Pack'],
    'furniture_bedroom': ['Bed Frame', 'Wardrobe', 'Nightstand'],
    'books_general_interest': ['Novel', 'Biography', 'Cookbook'],
    'construction_tools_safety': ['Safety Helmet', 'Work Gloves', 'Protective Goggles'],
    'fashion_underwear_beach': ['Swimwear', 'Boxer Briefs', 'Sports Bra'],
    'fashion_sport': ['Running Shorts', 'Yoga Pants', 'Sports Jacket'],
    'signaling_and_security': ['Fire Extinguisher', 'Alarm Bell', 'Safety Sign'],
    'computers': ['Laptop', 'Desktop PC', 'SSD Drive'],
    'christmas_supplies': ['Christmas Tree', 'Decorative Lights', 'Ornaments Set'],
    'fashio_female_clothing': ['Dress', 'Blouse', 'Skirt'],
    'home_appliances_2': ['Juicer', 'Electric Grill', 'Rice Cooker'],
    'books_imported': ['Foreign Language Novel', 'Travel Guide', 'Science Journal'],
    'drinks': ['Fruit Juice', 'Mineral Water', 'Soda Pack'],
    'cine_photo': ['Digital Camera', 'Tripod', 'Camera Lens'],
    'la_cuisine': ['Cooking Pan', 'Chef Knife', 'Spatula Set'],
    'music': ['CD Album', 'Vinyl Record', 'Sheet Music'],
    'home_comfort_2': ['Cushion', 'Blanket', 'Decorative Lamp'],
    'small_appliances_home_oven_and_coffee': ['Coffee Maker', 'Toaster Oven', 'Espresso Machine'],
    'cds_dvds_musicals': ['CD Album', 'DVD Music Collection', 'Live Concert DVD'],
    'dvds_blu_ray': ['Blu-ray Movie', 'DVD Movie', 'Box Set'],
    'flowers': ['Rose Bouquet', 'Orchid Plant', 'Mixed Flowers'],
    'arts_and_craftmanship': ['Sketch Book', 'Watercolor Set', 'Knitting Kit'],
    'diapers_and_hygiene': ['Disposable Diapers', 'Baby Wipes', 'Diaper Bag'],
    'fashion_childrens_clothes': ['Kids T-Shirt', 'Children’s Pants', 'Kids Jacket'],
    'security_and_services': ['Insurance Voucher', 'Home Security Device', 'Service Plan']
}
# generate product names
def generate_name(row):
    category = row['product_category_name']
    if category in name_templates:
        return random.choice(name_templates[category])
    else:
        return 'Generic Product'

products['product_name'] = products.apply(generate_name, axis=1)
products.to_csv('products_updated.csv', index=False)
print("Products table cleaned.")


unique_categories = products['product_category_name'].dropna().unique()
# Create category table
category_table = pd.DataFrame({
    'category_id': range(1, len(unique_categories)+1),
    'category_name': unique_categories
})
category_table.to_csv('categories.csv', index=False)
print("Category table created.")


products = products.merge(category_table, left_on='product_category_name', right_on='category_name', how='left')
products = products.drop(columns=['product_category_name', 'category_name'])
products.rename(columns={'category_id': 'product_category_id'}, inplace=True)
products.to_csv('products_updated.csv', index=False)


order_items = pd.read_csv("olist_order_items_dataset.csv")
order_items = order_items.drop(columns=["shipping_limit_date","freight_value"])
order_items.insert(order_items.columns.get_loc("price"), "quantity", 1)
order_items.to_csv("order_items_updated.csv", index=False)
print("order_items cleaned")


sellers = pd.read_csv("olist_sellers_dataset.csv")
sellers['seller_city'] = sellers['seller_city'].str.title()
sellers['seller_state'] = sellers['seller_state'].str.upper()
sellers["seller_name"] = [fake.company() for _ in range(len(sellers))]

sellers["email"] = sellers["seller_name"].str.split().str[0].str.replace(",", "", regex=False).str.replace(" ", "", regex=False).str.lower() + "_" + sellers["seller_id"].str[:4] + "@seller.com"

password = "seller123"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
sellers["password_hash"] = hashed.decode()
sellers.to_csv("sellers_updated.csv", index=False)
print("Sellers table cleaned!")