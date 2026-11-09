const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });

export const formatDate = (iso) => dateFormat.format(new Date(iso));

// nome de quem avalia fica salvo no navegador só para preencher o formulário da próxima vez
export function rememberedAuthor() {
  try {
    return localStorage.getItem("moviehub:author") ?? "";
  } catch {
    return "";
  }
}

export function rememberAuthor(name) {
  try {
    localStorage.setItem("moviehub:author", name);
  } catch {
    /* sem armazenamento disponível */
  }
}
