# BeauTrend Backend

FastAPI template powering the BeauTrend beauty-trend dashboard.

## Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, lifespan, router registration
│   ├── config.py               # pydantic-settings configuration
│   ├── database.py             # SQLAlchemy engine, session, init_db()
│   ├── models.py               # Product, TrendPoint, Report ORM models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── routes/                 # overview, trends, products, forecasting, reports
│   ├── services/               # collection, processing, analysis, forecasting, reports
│   └── utils/helpers.py        # period/slug/number helpers
├── data/raw/                   # untouched source files (CSV/XLSX exports)
├── data/processed/             # cleaned datasets
├── tests/                      # pytest suites for routes, analysis, forecasting
├── requirements.txt
├── .env.example
└── .gitignore
```

## Setup

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger UI: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>

Tables are created and a small demo dataset is seeded automatically at startup.
Delete `data/beautytrend.db` to reset.

## Test

```bash
pytest -q
```

Tests use an in-memory SQLite database configured in `tests/__init__.py`.

## API endpoints

All data endpoints are prefixed with `/api`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/overview` | Dashboard KPIs and recent movement |
| GET | `/api/trends` | All trend series (`?category=&market=`) |
| GET | `/api/trends/{product_id}` | One product's trend series |
| GET | `/api/products` | Product catalogue (`?category=&market=&search=`) |
| GET | `/api/products/{product_id}` | One product |
| POST | `/api/products` | Create a product |
| GET | `/api/forecasting/{product_id}` | OLS forecast (`?months=1..12`) |
| POST | `/api/reports` | Generate and store a report |
| GET | `/api/reports` | List generated reports |
| GET | `/api/reports/{report_id}` | Fetch a report |

## Connecting real data

1. Drop source exports into `data/raw/` (e.g. `Cosmetic_Trend.xlsx`).
2. Implement the ingestion in `app/services/data_collection.py` (`load_raw_csv`,
   `seed_database`) and cleaning in `data_processing.py`.
3. Point `DATABASE_URL` at PostgreSQL/MySQL in `.env` for production.
