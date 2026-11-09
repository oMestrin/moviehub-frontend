// Contrato de comunicação entre microfrontends: eventos do navegador (CustomEvent em window).
export const REVIEWS_CHANGED = "moviehub:reviews-changed"; // emitido por este MFE
export const MOVIES_CHANGED = "moviehub:movies-changed"; // emitido pelo MFE Catálogo

export const emitReviewsChanged = (detail) => window.dispatchEvent(new CustomEvent(REVIEWS_CHANGED, { detail }));
