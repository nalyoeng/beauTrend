const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")

export async function apiGet(path, params = {}, { signal } = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value))
    }
  }
  const suffix = query.toString() ? `?${query.toString()}` : ""
  const response = await fetch(`${API_BASE}${path}${suffix}`, { signal })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`)
  }
  return body
}

export const DATA_COUNTRIES = ["South Korea", "Malaysia", "Singapore", "Thailand"]

export function formatNumber(value) {
  if (value == null || !Number.isFinite(Number(value))) return "-"
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
}

export function formatMoney(value) {
  if (value == null || !Number.isFinite(Number(value))) return "-"
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

