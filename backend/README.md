# BeautyTrend backend (Python standard library only)

This API requires no FastAPI, pandas, Node.js, or third-party Python packages. It reads the project's CSV/XLSX data, normalizes country-specific column names, and serves JSON for charts and summaries.

## Run locally on Windows

Open PowerShell in this `backend` folder. Run:

```powershell
python server.py
```

You do not need to activate a virtual environment or install packages. Open `http://localhost:8000/api/health`; the first dataset endpoint may take a little time while the larger workbooks load.

## Endpoints

- `GET /api/health`
- `GET /api/countries`
- `GET /api/summary?country=Malaysia`
- `GET /api/products?country=Thailand&category=Skincare&search=serum&limit=100&offset=0`
- `GET /api/categories?country=Singapore`
- `GET /api/series?country=South%20Korea&product=Product%20Name&interval=month`

`/api/products` returns grouped sales totals and average prices. `/api/series` returns day, month, or year chart points. Country names: `South Korea`, `Malaysia`, `Singapore`, and `Thailand`.

If the frontend runs from another origin, set `CORS_ORIGINS` to comma-separated frontend origins. `DATASET_DIR` can point to a different folder containing the source files.

## Hosting

Use a Python 3 web service. Build/install command: none. Start command: `python backend/server.py` (or `python server.py` if the service root is the `backend` directory). Include the project-level `dataset/` directory with the backend. Set `PORT` and `CORS_ORIGINS` in the hosting service environment.

## Connect the frontend

For local development, start the backend first with `python server.py`. The Vite development server proxies `/api` requests to `http://127.0.0.1:8000` automatically. Start the existing React app from `Frontend` with `npm install` and `npm run dev`. For a separately hosted frontend, set `VITE_API_URL` to the deployed API base URL when building, and set the API's `CORS_ORIGINS` to the frontend origin.

For production, build the frontend with `VITE_API_URL` set to the deployed backend URL. The backend's `CORS_ORIGINS` must include the frontend's deployed origin. In local development, Vite's `/api` proxy targets `http://127.0.0.1:8000` automatically.

Additional frontend endpoints:

- `GET /api/trends?category=Skincare&search=serum&limit=500` returns rising/cooling product signals with monthly sales histories in the dashboard-friendly shape.
- `GET /api/market-comparison?product=Product%20Name&category=Skincare&months=6` returns market totals and month-over-month change. Add `country=Malaysia` to limit it to one market.
