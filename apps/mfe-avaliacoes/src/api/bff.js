// Cliente do BFF. O MFE só conversa com o BFF, sempre pelo Azure API Management.
const BASE_URL = (import.meta.env.VITE_BFF_URL || "http://localhost:3000").replace(/\/$/, "");
const SUBSCRIPTION_KEY = import.meta.env.VITE_APIM_SUBSCRIPTION_KEY;

export async function bff(path, { method = "GET", body } = {}) {
  const headers = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (SUBSCRIPTION_KEY) headers["Ocp-Apim-Subscription-Key"] = SUBSCRIPTION_KEY;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.");
  }
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(payload?.message ?? `O servidor respondeu ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const listReviews = (movieId) => bff(`/reviews?movieId=${encodeURIComponent(movieId)}`);
export const createReview = (input) => bff("/reviews", { method: "POST", body: input });
export const updateReview = (id, input) => bff(`/reviews/${encodeURIComponent(id)}`, { method: "PUT", body: input });
export const deleteReview = (id) => bff(`/reviews/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getAggregatedData = () => bff("/aggregated-data");
