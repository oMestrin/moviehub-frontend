import { useEffect, useSyncExternalStore } from "react";
import { getAggregatedData } from "./api/bff.js";
import { MOVIES_CHANGED, REVIEWS_CHANGED } from "./events.js";

// Estado compartilhado pelos componentes deste MFE: uma única chamada a /aggregated-data
// abastece o destaque, a grade e os detalhes.
let state = { status: "idle", data: null, error: null };
const listeners = new Set();
let inFlight = null;

function setState(next) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function refresh() {
  if (inFlight) return inFlight;
  setState({ status: state.data ? "refreshing" : "loading", error: null });
  inFlight = getAggregatedData()
    .then((data) => setState({ status: "ready", data }))
    .catch((error) => setState({ status: "error", error: error.message }))
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

if (typeof window !== "undefined") {
  window.addEventListener(REVIEWS_CHANGED, () => refresh());
  window.addEventListener(MOVIES_CHANGED, () => refresh());
}

export function useAggregatedData() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state
  );
  useEffect(() => {
    if (state.status === "idle") refresh();
  }, []);
  return snapshot;
}
