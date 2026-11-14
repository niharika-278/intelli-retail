#!/usr/bin/env python3
"""
filter_dataset.py
-----------------
Filters raw e-commerce CSVs to a demo-grade subset with full referential integrity.

Pipeline order  (products-first — avoids cascade collapse):
  products (80, category-balanced)
    → order_items (all referencing selected products)
    → orders      (200-800 anchor, time-spread trimmed)
    → customers   (derived, no sampling)
    → inventory   (100-300, for selected products)
    → categories  (ALL 71 kept — small enough, avoids FK type-mismatch issues)
    → sellers     (trim to referenced)

Usage:
    python filter_dataset.py [--input-dir PATH] [--output-dir PATH]
"""

import sys
import argparse
import pandas as pd
import numpy as np
from pathlib import Path

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEED            = 42
N_PRODUCTS      = 80    # target product rows (category-balanced)
N_ORDERS_MIN    = 200   # hard minimum orders
N_ORDERS_MAX    = 800   # hard maximum orders
N_INVENTORY_MIN = 100   # warn below this
N_INVENTORY_MAX = 300   # hard cap

FILE_MAP = {
    "categories":  "categories.csv",
    "customers":   "customers_updated.csv",
    "products":    "products_updated.csv",
    "sellers":     "sellers_updated.csv",
    "inventory":   "inventory.csv",
    "orders":      "orders_updated.csv",
    "order_items": "order_items_updated.csv",
}

# Hardcoded column names (confirmed from actual CSV headers)
COLS = {
    "cust_pk":     "customer_id",
    "prod_pk":     "product_id",
    "seller_pk":   "seller_id",
    "cat_pk":      "category_id",
    "ord_pk":      "order_id",
    "ord_cust_fk": "customer_id",
    "oi_ord_fk":   "order_id",
    "oi_prod_fk":  "product_id",
    "oi_sel_fk":   "seller_id",
    "inv_prod_fk": "product_id",
    "inv_sel_fk":  "seller_id",
    "prod_cat_fk": "product_category_id",
    "ord_ts":      "order_purchase_timestamp",
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def banner(msg):
    print(f"\n{'─' * 55}\n  {msg}\n{'─' * 55}")

def log(msg):   print(f"  {msg}")
def warn(msg):  print(f"  [WARN] {msg}")
def fail(msg):  print(f"\n  [FATAL] {msg}"); sys.exit(1)

def load_csv(path):
    if not path.exists():
        fail(f"File not found: {path}")
    df = pd.read_csv(path, low_memory=False)
    before = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    removed = before - len(df)
    if removed:
        log(f"Removed {removed} duplicate rows from {path.name}")
    return df

def _norm(series):
    """Normalise IDs to strings: '15.0' and 15 both become '15'."""
    s = series.astype(str).str.strip()
    s = s.str.replace(r'\.0$', '', regex=True)
    return s

def isin_str(series, id_set):
    """FK-safe isin: normalises floats so '15.0' matches '15'."""
    return _norm(series).isin(id_set)

def ids(df, col):
    return set(_norm(df[col])) - {"nan", "None", "", "<NA>"}

def validate_cols(df, col_list, table_name):
    for c in col_list:
        if c not in df.columns:
            fail(f"Column '{c}' not found in {table_name}. Actual: {list(df.columns)}")

def sample_products_balanced(prod_df, n, cat_col, prod_pk, seed):
    """Category-stratified product sample."""
    if len(prod_df) <= n:
        return prod_df.copy()
    if cat_col and cat_col in prod_df.columns:
        tmp = prod_df.copy()
        tmp["_ck"] = tmp[cat_col].astype(str)
        groups = tmp.groupby("_ck", group_keys=False)
        per_cat = max(1, n // len(groups))
        parts = [g.sample(n=min(len(g), per_cat), random_state=seed) for _, g in groups]
        result = pd.concat(parts, ignore_index=True).drop(columns=["_ck"])
        if len(result) < n:
            have = ids(result, prod_pk)
            rest = prod_df[~isin_str(prod_df[prod_pk], have)]
            need = min(n - len(result), len(rest))
            if need:
                result = pd.concat([result, rest.sample(n=need, random_state=seed)], ignore_index=True)
        elif len(result) > n:
            result = result.sample(n=n, random_state=seed)
        return result
    return prod_df.sample(n=n, random_state=seed).copy()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def main(input_dir, output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)

    # ── Load ─────────────────────────────────────────────────────────────────
    banner("Loading CSVs")
    categories  = load_csv(input_dir / FILE_MAP["categories"])
    customers   = load_csv(input_dir / FILE_MAP["customers"])
    products    = load_csv(input_dir / FILE_MAP["products"])
    sellers     = load_csv(input_dir / FILE_MAP["sellers"])
    inventory   = load_csv(input_dir / FILE_MAP["inventory"])
    orders      = load_csv(input_dir / FILE_MAP["orders"])
    order_items = load_csv(input_dir / FILE_MAP["order_items"])

    for name, df in [("categories", categories), ("customers", customers),
                     ("products", products), ("sellers", sellers),
                     ("inventory", inventory), ("orders", orders),
                     ("order_items", order_items)]:
        log(f"Loaded {FILE_MAP[name]:<32} → {len(df):>7,} rows, {len(df.columns)} cols")

    # ── Validate columns ──────────────────────────────────────────────────────
    banner("Validating column names")
    validate_cols(customers,   [COLS["cust_pk"]],                       "customers")
    validate_cols(products,    [COLS["prod_pk"], COLS["prod_cat_fk"]],  "products")
    validate_cols(sellers,     [COLS["seller_pk"]],                     "sellers")
    validate_cols(categories,  [COLS["cat_pk"]],                        "categories")
    validate_cols(orders,      [COLS["ord_pk"], COLS["ord_cust_fk"]],   "orders")
    validate_cols(order_items, [COLS["oi_ord_fk"], COLS["oi_prod_fk"], COLS["oi_sel_fk"]], "order_items")
    validate_cols(inventory,   [COLS["inv_prod_fk"], COLS["inv_sel_fk"]], "inventory")

    ord_ts = COLS["ord_ts"]
    if ord_ts not in orders.columns:
        warn(f"Timestamp column '{ord_ts}' not in orders. Time-spread sampling disabled.")
        ord_ts = None

    log("All required columns present.")

    # Unpack for readability
    cust_pk     = COLS["cust_pk"]
    prod_pk     = COLS["prod_pk"]
    seller_pk   = COLS["seller_pk"]
    cat_pk      = COLS["cat_pk"]
    ord_pk      = COLS["ord_pk"]
    ord_cust_fk = COLS["ord_cust_fk"]
    oi_ord_fk   = COLS["oi_ord_fk"]
    oi_prod_fk  = COLS["oi_prod_fk"]
    oi_sel_fk   = COLS["oi_sel_fk"]
    inv_prod_fk = COLS["inv_prod_fk"]
    inv_sel_fk  = COLS["inv_sel_fk"]
    prod_cat_fk = COLS["prod_cat_fk"]

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 1: Sample products (category-balanced)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 1 — Sample products (category-balanced)")
    sel_prods = sample_products_balanced(products, N_PRODUCTS, prod_cat_fk, prod_pk, SEED)
    final_prod_ids = ids(sel_prods, prod_pk)
    log(f"Products selected: {len(sel_prods)}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 2: All order_items that reference selected products
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 2 — Get order_items for selected products")
    sel_oi = order_items[isin_str(order_items[oi_prod_fk], final_prod_ids)].copy()
    log(f"Order_items found: {len(sel_oi)}")
    if len(sel_oi) == 0:
        fail("No order_items match selected products. Check product_id alignment.")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 3: Orders — anchor at 200-800
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 3 — Filter orders (anchor: 200-800)")
    candidate_ord_ids = ids(sel_oi, oi_ord_fk)
    sel_orders = orders[isin_str(orders[ord_pk], candidate_ord_ids)].copy()
    log(f"Orders reachable from selected products: {len(sel_orders)}")

    # Expand product pool if under minimum
    if len(sel_orders) < N_ORDERS_MIN:
        warn(f"Only {len(sel_orders)} orders. Expanding product pool...")
        extra_n = N_PRODUCTS
        while len(sel_orders) < N_ORDERS_MIN and extra_n < len(products):
            extra_n = min(extra_n + 20, len(products))
            sel_prods = sample_products_balanced(products, extra_n, prod_cat_fk, prod_pk, SEED)
            final_prod_ids = ids(sel_prods, prod_pk)
            sel_oi = order_items[isin_str(order_items[oi_prod_fk], final_prod_ids)].copy()
            candidate_ord_ids = ids(sel_oi, oi_ord_fk)
            sel_orders = orders[isin_str(orders[ord_pk], candidate_ord_ids)].copy()
            log(f"  products={len(sel_prods)} → orders reachable={len(sel_orders)}")
        if len(sel_orders) < N_ORDERS_MIN:
            warn("Falling back to ALL products.")
            sel_prods = products.copy()
            final_prod_ids = ids(sel_prods, prod_pk)
            sel_oi = order_items[isin_str(order_items[oi_prod_fk], final_prod_ids)].copy()
            candidate_ord_ids = ids(sel_oi, oi_ord_fk)
            sel_orders = orders[isin_str(orders[ord_pk], candidate_ord_ids)].copy()

    log(f"Orders before cap: {len(sel_orders)}")

    # Trim to N_ORDERS_MAX — stratified by month for line-chart spread
    if len(sel_orders) > N_ORDERS_MAX:
        if ord_ts:
            log("Stratified monthly sampling for time-series spread...")
            sel_orders[ord_ts] = pd.to_datetime(sel_orders[ord_ts], errors="coerce")
            sel_orders = sel_orders.dropna(subset=[ord_ts])
            sel_orders["_ym"] = sel_orders[ord_ts].dt.to_period("M")
            months = sorted(sel_orders["_ym"].unique())
            per_month = max(1, N_ORDERS_MAX // len(months))
            parts = [
                sel_orders[sel_orders["_ym"] == m].sample(
                    n=min(len(sel_orders[sel_orders["_ym"] == m]), per_month),
                    random_state=SEED
                )
                for m in months
            ]
            sel_orders = pd.concat(parts, ignore_index=True)
            # top-up if stratified sampling left gaps
            if len(sel_orders) < N_ORDERS_MAX:
                have = ids(sel_orders, ord_pk)
                rest = orders[
                    isin_str(orders[ord_pk], candidate_ord_ids) &
                    ~isin_str(orders[ord_pk], have)
                ]
                need = N_ORDERS_MAX - len(sel_orders)
                if len(rest) and need:
                    sel_orders = pd.concat(
                        [sel_orders, rest.sample(n=min(need, len(rest)), random_state=SEED)],
                        ignore_index=True,
                    )
            elif len(sel_orders) > N_ORDERS_MAX:
                sel_orders = sel_orders.sample(n=N_ORDERS_MAX, random_state=SEED)
            sel_orders = sel_orders.drop(columns=["_ym"], errors="ignore")
        else:
            sel_orders = sel_orders.sample(n=N_ORDERS_MAX, random_state=SEED)

    sel_orders = sel_orders.reset_index(drop=True)
    sel_order_ids = ids(sel_orders, ord_pk)
    log(f"Orders selected: {len(sel_orders)}")

    # Trim order_items to match selected orders
    sel_oi = sel_oi[isin_str(sel_oi[oi_ord_fk], sel_order_ids)].copy()
    log(f"Order_items after order trim: {len(sel_oi)}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 4: Customers — derived directly from selected orders
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 4 — Derive customers from orders")
    valid_cust_ids = ids(sel_orders, ord_cust_fk)
    sel_cust = customers[isin_str(customers[cust_pk], valid_cust_ids)].copy()
    log(f"Customers: {len(sel_cust)}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 5: Inventory for selected products
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 5 — Filter inventory")
    sel_inv = inventory[isin_str(inventory[inv_prod_fk], final_prod_ids)].copy()
    log(f"Inventory rows for selected products: {len(sel_inv)}")
    if len(sel_inv) > N_INVENTORY_MAX:
        sel_inv = sel_inv.sample(n=N_INVENTORY_MAX, random_state=SEED)
        log(f"Trimmed inventory to: {len(sel_inv)}")
    if len(sel_inv) < N_INVENTORY_MIN:
        warn(f"Only {len(sel_inv)} inventory rows (below min {N_INVENTORY_MIN}).")
    sel_inv = sel_inv.reset_index(drop=True)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 6: Categories — keep ALL 71 (small table, avoids FK type mismatch)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 6 — Keep all categories")
    sel_cats = categories.copy().reset_index(drop=True)
    log(f"Categories: {len(sel_cats)} (all retained)")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # STEP 7: Sellers — trim to those referenced in order_items or inventory
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Step 7 — Trim sellers")
    used_seller_ids = ids(sel_oi, oi_sel_fk) | ids(sel_inv, inv_sel_fk)
    sel_sellers = sellers[isin_str(sellers[seller_pk], used_seller_ids)].copy().reset_index(drop=True)
    log(f"Sellers: {len(sel_sellers)}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # WRITE OUTPUT
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Normalise float-cast integer FK columns before writing
    # (pandas reads nullable-int columns as float64: 15 becomes 15.0)
    # Cast to Int64 so CSVs get '15' not '15.0', and NaN becomes empty
    # cell (= NULL in MySQL) instead of the string 'nan'.
    for _col in [prod_cat_fk]:
        if _col in sel_prods.columns:
            sel_prods[_col] = pd.to_numeric(sel_prods[_col], errors='coerce').astype('Int64')

    banner(f"Writing filtered CSVs → {output_dir}/")
    outputs = {
        FILE_MAP["categories"]:  sel_cats,
        FILE_MAP["customers"]:   sel_cust,
        FILE_MAP["products"]:    sel_prods,
        FILE_MAP["sellers"]:     sel_sellers,
        FILE_MAP["inventory"]:   sel_inv,
        FILE_MAP["orders"]:      sel_orders,
        FILE_MAP["order_items"]: sel_oi,
    }
    for filename, df in outputs.items():
        df.reset_index(drop=True).to_csv(output_dir / filename, index=False)
        log(f"Wrote {filename:<32} → {len(df):>7,} rows")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SUMMARY
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Filtered Dataset Summary")
    rows = [
        ("categories",  len(sel_cats),    None,            None),
        ("customers",   len(sel_cust),    None,            None),
        ("products",    len(sel_prods),   50,              120),
        ("sellers",     len(sel_sellers), None,            None),
        ("inventory",   len(sel_inv),     N_INVENTORY_MIN, N_INVENTORY_MAX),
        ("orders",      len(sel_orders),  N_ORDERS_MIN,    N_ORDERS_MAX),
        ("order_items", len(sel_oi),      None,            None),
    ]
    print(f"\n  {'Table':<20} {'Rows':>8}  {'Target Range'}")
    print(f"  {'─'*20} {'─'*8}  {'─'*20}")
    for table, n_rows, lo, hi in rows:
        range_str = f"{lo}–{hi}" if lo and hi else "derived"
        status = ""
        if lo and hi:
            status = "  ✓" if lo <= n_rows <= hi else ("  ← BELOW MIN" if n_rows < lo else "  ← ABOVE MAX")
        print(f"  {table:<20} {n_rows:>8,}  {range_str:<20}{status}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # REFERENTIAL INTEGRITY CHECK
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    banner("Referential Integrity Check")
    violations = []

    def check_fk(child_df, child_col, parent_df, parent_col, label):
        child_vals  = ids(child_df, child_col) - {"nan", "None", ""}
        parent_vals = ids(parent_df, parent_col)
        orphans = child_vals - parent_vals
        if orphans:
            violations.append(f"{label}: {len(orphans)} orphaned — e.g. {list(orphans)[:3]}")
        else:
            log(f"  ✓ {label}")

    check_fk(sel_orders,  ord_cust_fk,  sel_cust,     cust_pk,   "orders.customer_id → customers.customer_id")
    check_fk(sel_oi,      oi_ord_fk,    sel_orders,   ord_pk,    "order_items.order_id → orders.order_id")
    check_fk(sel_oi,      oi_prod_fk,   sel_prods,    prod_pk,   "order_items.product_id → products.product_id")
    check_fk(sel_inv,     inv_prod_fk,  sel_prods,    prod_pk,   "inventory.product_id → products.product_id")
    check_fk(sel_oi,      oi_sel_fk,    sel_sellers,  seller_pk, "order_items.seller_id → sellers.seller_id")
    check_fk(sel_inv,     inv_sel_fk,   sel_sellers,  seller_pk, "inventory.seller_id → sellers.seller_id")
    check_fk(sel_prods,   prod_cat_fk,  sel_cats,     cat_pk,    "products.product_category_id → categories.category_id")

    if violations:
        print("\n  [FAIL] Integrity violations:")
        for v in violations:
            print(f"    ✗ {v}")
        sys.exit(1)
    else:
        print("\n  All referential integrity checks passed.")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TIME SPREAD CHECK
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if ord_ts and ord_ts in sel_orders.columns:
        banner("Time Spread Check")
        ts = pd.to_datetime(sel_orders[ord_ts], errors="coerce").dropna()
        if len(ts):
            span_months = (ts.max() - ts.min()).days / 30.44
            monthly = ts.dt.to_period("M").value_counts().sort_index()
            log(f"Date range      : {ts.min().date()}  →  {ts.max().date()}")
            log(f"Span            : {span_months:.1f} months")
            log(f"Months w/ orders: {len(monthly)}")
            log(f"Orders/month    : avg={monthly.mean():.1f}  min={monthly.min()}  max={monthly.max()}")
            if span_months < 6:
                warn("Span < 6 months — line charts may look thin.")
            else:
                log("  ✓ Sufficient time spread for line charts.")

    banner("Done")
    print(f"  Output: {output_dir.resolve()}\n")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENTRY POINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir",  type=Path, default=Path("."))
    parser.add_argument("--output-dir", type=Path, default=Path("filtered_dataset"))
    args = parser.parse_args()
    main(args.input_dir, args.output_dir)
