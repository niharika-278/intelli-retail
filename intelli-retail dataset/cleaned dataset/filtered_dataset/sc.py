import csv
with open("clean.csv", newline="") as f:
    row = next(csv.DictReader(f))
    print(repr(row["role"]))   # should be 'seller', NOT 'seller\r'