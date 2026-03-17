function normalizarPaperSemanticScholar(item) {
  const autores = Array.isArray(item.authors)
    ? item.authors.map((a) => a.name).filter(Boolean).join("; ")
    : "";
  return {
    titulo: item.title || "",
    autores,
    anio: item.year ? String(item.year) : "",
    resumen: item.abstract || "",
    fuente: item.venue || "",
    doi: item.doi || "",
    url: item.url || ""
  };
}

async function fetchJsonConTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function limpiarHtml(texto) {
  return String(texto || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function normalizarPaperCrossRef(item) {
  const autores = Array.isArray(item.author)
    ? item.author.map((a) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean).join("; ")
    : "";
  const year = item.issued?.["date-parts"]?.[0]?.[0]
    || item.created?.["date-parts"]?.[0]?.[0]
    || "";
  const titulo = Array.isArray(item.title) ? (item.title[0] || "") : (item.title || "");
  const fuente = Array.isArray(item["container-title"]) ? (item["container-title"][0] || "") : (item["container-title"] || "");
  return {
    titulo: titulo || "",
    autores,
    anio: year ? String(year) : "",
    resumen: limpiarHtml(item.abstract || ""),
    fuente: fuente || "",
    doi: item.DOI || "",
    url: item.URL || ""
  };
}

async function buscarPapersCrossRef(query, rows = 8) {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query", query);
  url.searchParams.set("rows", String(rows));

  const data = await fetchJsonConTimeout(url.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" }
  });

  const items = Array.isArray(data?.message?.items) ? data.message.items : [];
  return { resultados: items.map(normalizarPaperCrossRef), fuente: "crossref" };
}

async function buscarPapersSemanticScholarProxy(query, limit = 8) {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", "title,authors,year,abstract,venue,doi,url");

  const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url.toString());
  const dataProxy = await fetchJsonConTimeout(proxyUrl, { method: "GET" });
  const lista = Array.isArray(dataProxy.data) ? dataProxy.data : [];
  return { resultados: lista.map(normalizarPaperSemanticScholar), fuente: "semantic-proxy" };
}

function construirReferenciaDesdePaper(paper) {
  return {
    autor: paper.autores || "",
    anio: paper.anio || "",
    titulo: paper.titulo || "",
    revista: paper.fuente || "",
    editorial: "",
    doi: paper.doi || paper.url || ""
  };
}

function generarCitaAPABreve(ref) {
  if (typeof generarCitaAPARapida === "function") return generarCitaAPARapida(ref);
  const autor = ref.autor || "Autor";
  const anio = ref.anio || "s.f.";
  const titulo = ref.titulo || "Título";
  const fuente = ref.revista || "";
  return `${autor} (${anio}). ${titulo}. ${fuente}`.trim();
}
