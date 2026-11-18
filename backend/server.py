"""Dependency-free JSON API for the BeautyTrend CSV and XLSX datasets."""
from __future__ import annotations

import csv
import datetime as dt
import json
import os
import posixpath
import re
import zipfile
from threading import Lock
from collections import defaultdict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("DATASET_DIR", ROOT / "dataset"))
PORT = int(os.environ.get("PORT", "8000"))
FILES = {
    "South Korea": "korean_cleaned_updated.csv",
    "Malaysia": "malaysia_clean_updated.xlsx",
    "Singapore": "singapore_clean_updated.xlsx",
    "Thailand": "thailand_clean_updated.xlsx",
}
MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
DATA = None
DATA_LOCK = Lock()


def norm(value):
    return re.sub(r"[^a-z0-9]", "", str(value or "").strip().lower())


def col_index(reference):
    letters = re.match(r"[A-Z]+", reference.upper())
    if not letters:
        return 0
    number = 0
    for char in letters.group(0):
        number = number * 26 + ord(char) - 64
    return number - 1


def read_xlsx(path):
    """Read the first worksheet using Python's standard ZIP/XML libraries."""
    with zipfile.ZipFile(path) as book:
        workbook = ET.fromstring(book.read("xl/workbook.xml"))
        relationships = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
        rel_map = {item.attrib["Id"]: item.attrib["Target"] for item in relationships.findall(f"{{{PKG_REL_NS}}}Relationship")}
        sheet = workbook.find(f"{{{MAIN_NS}}}sheets/{{{MAIN_NS}}}sheet")
        if sheet is None:
            return
        target = rel_map[sheet.attrib[f"{{{REL_NS}}}id"]]
        sheet_path = posixpath.normpath(target.lstrip("/") if target.startswith("/") else posixpath.join("xl", target))
        shared = []
        if "xl/sharedStrings.xml" in book.namelist():
            strings = ET.fromstring(book.read("xl/sharedStrings.xml"))
            shared = ["".join(node.text or "" for node in item.iter(f"{{{MAIN_NS}}}t")) for item in strings.findall(f"{{{MAIN_NS}}}si")]
        root = ET.fromstring(book.read(sheet_path))
        rows = root.find(f"{{{MAIN_NS}}}sheetData")
        if rows is None:
            return
        headers = None
        for row in rows.findall(f"{{{MAIN_NS}}}row"):
            values = {}
            for cell in row.findall(f"{{{MAIN_NS}}}c"):
                index = col_index(cell.attrib.get("r", "A1"))
                kind = cell.attrib.get("t")
                if kind == "inlineStr":
                    value = "".join(node.text or "" for node in cell.iter(f"{{{MAIN_NS}}}t"))
                else:
                    item = cell.find(f"{{{MAIN_NS}}}v")
                    value = item.text if item is not None else ""
                    if kind == "s" and value:
                        value = shared[int(value)]
                values[index] = value
            if headers is None:
                max_index = max(values, default=-1)
                headers = [str(values.get(index, "")).strip() for index in range(max_index + 1)]
                continue
            record = {header: values.get(index, "") for index, header in enumerate(headers) if header}
            if record:
                yield record


def parse_date(value, country):
    if isinstance(value, (int, float)):
        try:
            return (dt.datetime(1899, 12, 30) + dt.timedelta(days=float(value))).date()
        except (OverflowError, ValueError):
            return None
    text = str(value or "").strip()
    if not text:
        return None
    if re.fullmatch(r"\d{4,6}(?:\.\d+)?", text):
        try:
            serial = float(text)
            if 20000 <= serial <= 80000:
                return (dt.datetime(1899, 12, 30) + dt.timedelta(days=serial)).date()
        except (OverflowError, ValueError):
            return None
    formats = ["%Y-%m-%d", "%Y/%m/%d", "%Y-%m-%d %H:%M:%S", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y"]
    if country == "South Korea":
        formats.insert(0, "%y-%m-%d")
    for fmt in formats:
        try:
            return dt.datetime.strptime(text[:19], fmt).date()
        except ValueError:
            continue
    try:
        return dt.date.fromisoformat(text[:10])
    except ValueError:
        return None


def number(value):
    if value is None or str(value).strip() == "":
        return None
    try:
        return float(re.sub(r"[^0-9.\-]", "", str(value)))
    except ValueError:
        return None


def lookup(row, *candidates):
    columns = {norm(name): value for name, value in row.items()}
    for candidate in candidates:
        if norm(candidate) in columns:
            return columns[norm(candidate)]
    return None


def load_data():
    global DATA
    with DATA_LOCK:
        if DATA is not None:
            return DATA
        result = []
        for country, filename in FILES.items():
            path = DATA_DIR / filename
            if not path.exists():
                raise FileNotFoundError(f"Dataset file not found: {path}")
            records = read_xlsx(path) if path.suffix.lower() == ".xlsx" else csv.DictReader(path.open(encoding="utf-8-sig", newline=""))
            for source in records:
                product = str(lookup(source, "Product_Name", "Product Name", "Product") or "").strip()
                date = parse_date(lookup(source, "Date", "Effective Date"), country)
                if not product or date is None:
                    continue
                result.append({
                    "country": country, "date": date, "product": product,
                    "brand": lookup(source, "Brand") or None,
                    "category": str(lookup(source, "Subcategory", "Category") or "Uncategorized").strip() or "Uncategorized",
                    "price": number(lookup(source, "Price_USD", "Price", "Price USD")),
                    "units_sold": number(lookup(source, "Units_Sold", "unit_sold", "Units Sold")),
                    "quantity": number(lookup(source, "quantity", "Quantity")),
                })
        DATA = result
        return DATA


def filtered(query):
    rows = load_data()
    country = query.get("country", [None])[0]
    category = query.get("category", [None])[0]
    search = query.get("search", [None])[0]
    if country and country not in FILES:
        raise ApiError(404, f"Unknown country: {country}")
    if country:
        rows = [row for row in rows if row["country"] == country]
    if category:
        rows = [row for row in rows if row["category"].casefold() == category.casefold()]
    if search:
        rows = [row for row in rows if search.casefold() in row["product"].casefold()]
    return rows


def round_num(value):
    return round(value, 2) if value is not None else None


def date_text(value):
    return value.isoformat() if value else None


def aggregate(rows, key_func):
    groups = {}
    for row in rows:
        key = key_func(row)
        group = groups.get(key)
        if group is None:
            group = {"sample": row, "records": 0, "units_sold": 0, "sales_count": 0, "quantity": 0, "quantity_count": 0, "price": 0, "price_count": 0, "latest": None}
            groups[key] = group
        group["records"] += 1
        if row["units_sold"] is not None:
            group["units_sold"] += row["units_sold"]
            group["sales_count"] += 1
        if row["quantity"] is not None:
            group["quantity"] += row["quantity"]
            group["quantity_count"] += 1
        if row["price"] is not None:
            group["price"] += row["price"]
            group["price_count"] += 1
        if group["latest"] is None or row["date"] > group["latest"]:
            group["latest"] = row["date"]
    return groups


def api_result(path, query):
    if path == "/api/trends":
        return trend_data(query)
    if path == "/api/health":
        return {"status": "ok", "service": "BeautyTrend Dataset API"}
    if path == "/api/countries":
        rows = load_data()
        result = []
        for country in FILES:
            dates = [row["date"] for row in rows if row["country"] == country]
            result.append({"name": country, "records": len(dates), "date_from": date_text(min(dates)) if dates else None, "date_to": date_text(max(dates)) if dates else None})
        return result
    if path == "/api/summary":
        rows = filtered(query)
        groups = aggregate(rows, lambda row: row["country"])
        dates = [row["date"] for row in rows]
        countries = []
        for group in groups.values():
            country_rows = [row for row in rows if row["country"] == group["sample"]["country"]]
            countries.append({"country": group["sample"]["country"], "records": group["records"], "products": len({row["product"] for row in country_rows}), "brands": len({row["brand"] for row in country_rows if row["brand"]}), "units_sold": round_num(group["units_sold"]) if group["sales_count"] else None, "average_price": round_num(group["price"] / group["price_count"]) if group["price_count"] else None})
        return {"records": len(rows), "products": len({row["product"] for row in rows}), "date_from": date_text(min(dates)) if dates else None, "date_to": date_text(max(dates)) if dates else None, "countries": countries}
    if path == "/api/products":
        rows = filtered(query)
        groups = aggregate(rows, lambda row: (row["country"], row["product"], row["brand"], row["category"]))
        items = []
        for group in groups.values():
            sample = group["sample"]
            items.append({"country": sample["country"], "product": sample["product"], "brand": sample["brand"], "category": sample["category"], "records": group["records"], "units_sold": round_num(group["units_sold"]) if group["sales_count"] else None, "quantity": round_num(group["quantity"]) if group["quantity_count"] else None, "average_price": round_num(group["price"] / group["price_count"]) if group["price_count"] else None, "latest_date": date_text(group["latest"])})
        if query.get("sort", ["units_sold"])[0] == "records":
            items.sort(key=lambda item: (-item["records"], item["product"]))
        else:
            items.sort(key=lambda item: (-(item["units_sold"] if item["units_sold"] is not None else float("-inf")), item["product"]))
        limit = min(1000, max(1, int(query.get("limit", ["100"])[0])))
        offset = max(0, int(query.get("offset", ["0"])[0]))
        return {"total": len(items), "limit": limit, "offset": offset, "items": items[offset:offset + limit]}
    if path == "/api/market-comparison":
        return market_comparison(query)
    if path == "/api/categories":
        rows = filtered(query)
        groups = aggregate(rows, lambda row: row["category"])
        return [{"category": group["sample"]["category"], "records": group["records"], "products": len({row["product"] for row in rows if row["category"] == group["sample"]["category"]})} for group in sorted(groups.values(), key=lambda item: -item["records"])]
    if path == "/api/series":
        country = query.get("country", [None])[0]
        product = query.get("product", [None])[0]
        interval = query.get("interval", ["month"])[0]
        if not country or not product:
            raise ApiError(400, "country and product query parameters are required")
        if interval not in ("day", "week", "month", "year"):
            raise ApiError(400, "interval must be day, month, or year")
        filters = {"country": [country], "search": [product]}
        category = query.get("category", [None])[0]
        if category:
            filters["category"] = [category]
        rows = [row for row in filtered(filters) if row["product"].casefold() == product.casefold()]
        if not rows:
            raise ApiError(404, "No matching product data for this country")
        if interval == "week":
            latest_date = max(row["date"] for row in rows)
            latest_monday = latest_date - dt.timedelta(days=latest_date.weekday())
            first_monday = latest_monday - dt.timedelta(weeks=8)
            totals = defaultdict(lambda: {"records": 0, "units": 0})
            for row in rows:
                monday = row["date"] - dt.timedelta(days=row["date"].weekday())
                if first_monday <= monday <= latest_monday:
                    week_index = (monday - first_monday).days // 7
                    totals[week_index]["records"] += 1
                    totals[week_index]["units"] += row["units_sold"] or 0
            points = [{"period": f"W{index + 1}", "records": totals[index]["records"], "units_sold": round_num(totals[index]["units"])} for index in range(9)]
            return {"country": country, "product": product, "interval": interval, "points": points}
        def period(row):
            date = row["date"]
            if interval == "year": return f"{date.year:04d}-01-01"
            if interval == "month": return f"{date.year:04d}-{date.month:02d}-01"
            return date.isoformat()
        groups = aggregate(rows, period)
        points = []
        for label, group in sorted(groups.items()):
            points.append({"period": label, "records": group["records"], "units_sold": round_num(group["units_sold"]) if group["sales_count"] else None, "quantity": round_num(group["quantity"]) if group["quantity_count"] else None, "average_price": round_num(group["price"] / group["price_count"]) if group["price_count"] else None})
        return {"country": country, "product": product, "interval": interval, "points": points}
    raise ApiError(404, "Not found")


def previous_month(year, month):
    return (year - 1, 12) if month == 1 else (year, month - 1)


def month_shift(year, month, amount):
    index = year * 12 + month - 1 + amount
    return index // 12, index % 12 + 1


def growth_percent(current, previous):
    if previous > 0:
        return round((current - previous) / previous * 100)
    return 100 if current > 0 else 0


def trend_data(query):
    filters = dict(query)
    search = filters.pop("search", [None])[0]
    rows = filtered(filters)
    if search:
        needle = search.casefold()
        rows = [row for row in rows if needle in row["product"].casefold() or needle in row["category"].casefold() or needle in row["country"].casefold()]
    by_product = defaultdict(lambda: defaultdict(list))
    for row in rows:
        by_product[(row["product"], row["category"])][row["country"]].append(row)

    result = []
    for (product, category), country_rows in by_product.items():
        country_metrics = {}
        for country, items in country_rows.items():
            monthly = defaultdict(lambda: {"units": 0, "records": 0})
            for item in items:
                key = (item["date"].year, item["date"].month)
                monthly[key]["records"] += 1
                monthly[key]["units"] += item["units_sold"] or 0
            latest_key = max(monthly)
            previous_key = previous_month(*latest_key)
            latest_units = monthly[latest_key]["units"]
            previous_units = monthly.get(previous_key, {}).get("units", 0)
            rate = growth_percent(latest_units, previous_units)
            year, month = latest_key
            history = []
            for offset in range(-8, 1):
                key = month_shift(year, month, offset)
                history.append(monthly.get(key, {}).get("units", 0))
            country_metrics[country] = {"latest": latest_units, "growth": rate, "history": history, "records": len(items), "date": max(item["date"] for item in items)}
        max_sales = max((item["latest"] for item in country_metrics.values()), default=0)
        market_scores = [{"country": country, "score": round(item["latest"] / max_sales * 100) if max_sales else 0} for country, item in country_metrics.items()]
        country_growth = [{"country": country, "score": round(item["latest"] / max_sales * 100) if max_sales else 0, "growth": item["growth"]} for country, item in country_metrics.items()]
        leading_country = max(country_metrics, key=lambda name: country_metrics[name]["latest"])
        for country, metric in country_metrics.items():
            result.append({
                "id": f"{country.lower().replace(' ', '-')}-{norm(category)}-{norm(product)}",
                "name": product, "category": category, "market": leading_country,
                "signal": "rising" if metric["growth"] > 0 else "cooling",
                "change": f"{metric['growth']:+d}%", "growth": metric["growth"],
                "score": round(metric["latest"] / max_sales * 100) if max_sales else 0,
                "unitsSold": metric["latest"], "history": metric["history"],
                "latestDate": date_text(metric["date"]), "country": country,
                "marketScores": market_scores, "countryGrowth": country_growth,
                "summary": f"{metric['latest']:,} units were recorded in {country}'s latest dataset month.",
                "whyItMatters": f"This {category.lower()} product has {metric['records']:,} dated sales records in {country}.",
                "cambodiaOpportunity": "Cambodia is not included in these source files. Validate regional patterns with local sales data before making a stocking decision.",
            })
    total = len(result)
    result.sort(key=lambda item: (-item["unitsSold"], item["name"], item["country"]))
    limit = min(1000, max(1, int(query.get("limit", ["500"])[0])))
    half = (limit + 1) // 2
    rising = [item for item in result if item["signal"] == "rising"]
    cooling = [item for item in result if item["signal"] == "cooling"]
    selected = rising[:half] + cooling[:half]
    if len(selected) < limit:
        selected_ids = {item["id"] for item in selected}
        selected.extend(item for item in result if item["id"] not in selected_ids and len(selected) < limit)
    selected.sort(key=lambda item: (item["signal"] != "rising", -item["unitsSold"], item["name"], item["country"]))
    return {"count": total, "returned": len(selected), "trends": selected}


def market_comparison(query):
    product = query.get("product", [None])[0]
    category = query.get("category", [None])[0]
    country_filter = query.get("country", [None])[0]
    if not product:
        raise ApiError(400, "product is required")
    if country_filter and country_filter not in FILES:
        raise ApiError(404, f"Unknown country: {country_filter}")
    try:
        months = max(1, min(36, int(query.get("months", ["6"])[0])))
    except ValueError:
        raise ApiError(400, "months must be a number from 1 to 36")
    all_rows = filtered({"category": [category] if category else [None], "search": [product]})
    all_rows = [row for row in all_rows if row["product"].casefold() == product.casefold() and (not country_filter or row["country"] == country_filter)]
    markets = []
    for country in ([country_filter] if country_filter else FILES.keys()):
        country_rows = [row for row in all_rows if row["country"] == country]
        if not country_rows:
            markets.append({"name": country, "code": country_code(country), "units_sold": 0, "records": 0, "average_price": None, "growth": 0, "score": 0})
            continue
        latest = max(row["date"] for row in country_rows)
        cutoff = month_shift(latest.year, latest.month, -(months - 1))
        included = [row for row in country_rows if (row["date"].year, row["date"].month) >= cutoff]
        monthly = defaultdict(lambda: {"units": 0, "records": 0})
        for row in included:
            key = (row["date"].year, row["date"].month)
            monthly[key]["records"] += 1
            monthly[key]["units"] += row["units_sold"] or 0
        last_key = max(monthly) if monthly else (latest.year, latest.month)
        prev_key = previous_month(*last_key)
        growth = growth_percent(monthly.get(last_key, {}).get("units", 0), monthly.get(prev_key, {}).get("units", 0))
        prices = [row["price"] for row in included if row["price"] is not None]
        markets.append({"name": country, "code": country_code(country), "units_sold": sum(row["units_sold"] or 0 for row in included), "records": len(included), "average_price": round_num(sum(prices) / len(prices)) if prices else None, "growth": growth, "score": 0})
    max_units = max((market["units_sold"] for market in markets), default=0)
    for market in markets:
        market["score"] = round(market["units_sold"] / max_units * 100) if max_units else 0
        market["status"] = "Fast rising" if market["growth"] >= 20 else "Growing" if market["growth"] > 0 else "Stable or cooling"
    return {"product": product, "category": category, "months": months, "markets": markets}


def country_code(name):
    return {"South Korea": "KR", "Malaysia": "MY", "Singapore": "SG", "Thailand": "TH"}.get(name, "")
class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        super().__init__(message)


class Handler(BaseHTTPRequestHandler):
    def _headers(self, status, origin=None):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if origin and origin in [item.strip() for item in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:8443").split(",")]:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()

    def do_OPTIONS(self):
        self._headers(204, self.headers.get("Origin"))

    def do_GET(self):
        parsed = urlparse(self.path)
        try:
            result = api_result(parsed.path, parse_qs(parsed.query))
            body = json.dumps(result, ensure_ascii=False, allow_nan=False).encode("utf-8")
            self._headers(200, self.headers.get("Origin"))
        except ApiError as error:
            body = json.dumps({"error": str(error)}, ensure_ascii=False).encode("utf-8")
            self._headers(error.status, self.headers.get("Origin"))
        except Exception as error:
            print(f"API error: {error}", flush=True)
            body = json.dumps({"error": str(error)}, ensure_ascii=False).encode("utf-8")
            self._headers(500, self.headers.get("Origin"))
        self.wfile.write(body)

    def log_message(self, format_string, *args):
        print("%s - %s" % (self.address_string(), format_string % args), flush=True)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"BeautyTrend API ready at http://localhost:{PORT}", flush=True)
    print(f"Dataset folder: {DATA_DIR}", flush=True)
    server.serve_forever()






