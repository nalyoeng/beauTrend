"""Smoke tests for the public API routes."""

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings

get_settings.cache_clear()

from app.main import app  # noqa: E402  (engine must see the test DATABASE_URL)


@pytest.fixture(scope="module")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def test_root_and_health(client: TestClient) -> None:
    assert client.get("/").status_code == 200
    assert client.get("/health").json() == {"status": "ok"}


def test_overview(client: TestClient) -> None:
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_products"] >= 6
    assert data["total_markets"] >= 1
    assert len(data["recent_activity"]) <= 5


def test_products_list_filter_and_create(client: TestClient) -> None:
    response = client.get("/api/products", params={"market": "Cambodia"})
    assert response.status_code == 200
    assert all(product["market"] == "Cambodia" for product in response.json())

    assert client.get("/api/products/999999").status_code == 404

    created = client.post(
        "/api/products",
        json={
            "name": "Test Serum",
            "brand": "Test Brand",
            "category": "Skincare",
            "market": "Cambodia",
            "price": 12.5,
        },
    )
    assert created.status_code == 201
    assert created.json()["name"] == "Test Serum"


def test_trends(client: TestClient) -> None:
    response = client.get("/api/trends")
    assert response.status_code == 200
    series = response.json()
    assert len(series) >= 6
    assert len(series[0]["points"]) == 12
    assert "direction" in series[0]["analysis"]

    assert client.get("/api/trends/999999").status_code == 404


def test_forecasting(client: TestClient) -> None:
    response = client.get("/api/forecasting/1", params={"months": 4})
    assert response.status_code == 200
    data = response.json()
    assert len(data["points"]) == 4
    assert data["horizon"] == 4
    assert all(point["lower"] <= point["predicted"] <= point["upper"] for point in data["points"])

    assert client.get("/api/forecasting/999999").status_code == 404


def test_reports(client: TestClient) -> None:
    response = client.post(
        "/api/reports",
        json={
            "title": "Monthly beauty brief",
            "author": "QA",
            "product_ids": [1, 2],
            "horizon": 2,
        },
    )
    assert response.status_code == 201
    report = response.json()
    assert report["payload"]["product_count"] == 2
    assert len(report["payload"]["sections"]) == 2
    assert all(
        len(section["forecast"]) == 2
        for section in report["payload"]["sections"]
    )

    assert any(item["id"] == report["id"] for item in client.get("/api/reports").json())
    assert client.get(f"/api/reports/{report['id']}").status_code == 200
    assert client.get("/api/reports/999999").status_code == 404
