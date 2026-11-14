import pandas as pd
import random

products = pd.read_csv("products_updated.csv")
sellers = pd.read_csv("sellers_updated.csv")

inventory = []

for _, product in products.iterrows():
    seller_sample = sellers.sample(2)

    for _, seller in seller_sample.iterrows():
        inventory.append({
            "product_id": product["product_id"],   
            "seller_id": seller["seller_id"],
            "stock": random.randint(20, 150)
        })

inventory_df = pd.DataFrame(inventory)
inventory_df.to_csv("inventory.csv", index=False)