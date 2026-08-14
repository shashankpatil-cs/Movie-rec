const BASE_URL = "/api/rating-prediction";

export async function fetchConfig() {
  const res = await fetch(`${BASE_URL}/config`);
  if (!res.ok) throw new Error("Failed to load configuration");
  return res.json();
}

export async function runExperiment(params) {
  const res = await fetch(`${BASE_URL}/experiment/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Experiment run failed");
  }
  return res.json();
}
