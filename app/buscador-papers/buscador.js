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

function buscarPapersDemo(query) {
  const muestra = [
    {
      titulo: "Aprendizaje profundo aplicado a diagnóstico médico",
      autores: "García, P.; Rojas, M.",
      anio: "2021",
      resumen: "Se analiza el desempeño de redes neuronales profundas para la detección temprana de enfermedades crónicas.",
      fuente: "Revista Iberoamericana de IA",
      doi: "10.1000/riia.2021.001",
      url: "https://example.com/paper1"
    },
    {
      titulo: "Modelos predictivos en educación superior",
      autores: "López, A.; Fernández, J.",
      anio: "2020",
      resumen: "Estudio de modelos de predicción de deserción estudiantil usando datos institucionales.",
      fuente: "Educación y Datos",
      doi: "10.1000/eyd.2020.015",
      url: "https://example.com/paper2"
    },
    {
      titulo: "Estrategias de innovación en ingeniería de software",
      autores: "Pérez, L.; Silva, R.",
      anio: "2019",
      resumen: "Revisión sistemática de prácticas de innovación y su impacto en equipos ágiles.",
      fuente: "Ingeniería de Software Hoy",
      doi: "10.1000/ish.2019.044",
      url: "https://example.com/paper3"
    },
    {
      titulo: "Tendencias en análisis de big data para salud pública",
      autores: "Martínez, C.; Vega, N.",
      anio: "2022",
      resumen: "Panorama de aplicaciones de big data en vigilancia epidemiológica y toma de decisiones.",
      fuente: "Salud y Ciencia",
      doi: "10.1000/sc.2022.109",
      url: "https://example.com/paper4"
    },
    {
      titulo: "Ética y gobernanza de la inteligencia artificial",
      autores: "Ramírez, F.; Torres, E.",
      anio: "2018",
      resumen: "Propuesta de marco ético para el desarrollo responsable de sistemas inteligentes.",
      fuente: "Tecnología y Sociedad",
      doi: "10.1000/tys.2018.078",
      url: "https://example.com/paper5"
    }
  ];

  const q = String(query || "").toLowerCase();
  const filtrados = muestra.filter((p) =>
    p.titulo.toLowerCase().includes(q) ||
    p.autores.toLowerCase().includes(q) ||
    p.resumen.toLowerCase().includes(q)
  );
  return { resultados: filtrados.length ? filtrados : muestra, fuente: "demo" };
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
