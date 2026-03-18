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
    },
    {
      titulo: "Analítica del aprendizaje y rendimiento académico",
      autores: "Suárez, D.; Molina, V.",
      anio: "2023",
      resumen: "Uso de analítica del aprendizaje para predecir rendimiento en cursos en línea.",
      fuente: "Revista de Educación Digital",
      doi: "10.1000/red.2023.003",
      url: "https://example.com/paper6"
    },
    {
      titulo: "Internet de las cosas en entornos industriales",
      autores: "Ortega, H.; Salas, K.",
      anio: "2022",
      resumen: "Arquitecturas IoT para monitoreo de procesos industriales en tiempo real.",
      fuente: "Ingeniería Industrial",
      doi: "10.1000/ii.2022.042",
      url: "https://example.com/paper7"
    },
    {
      titulo: "Ciberseguridad y gestión de riesgos en la nube",
      autores: "Quispe, J.; León, A.",
      anio: "2020",
      resumen: "Modelo de gestión de riesgos para infraestructuras cloud en PYMES.",
      fuente: "Seguridad Informática",
      doi: "10.1000/si.2020.088",
      url: "https://example.com/paper8"
    },
    {
      titulo: "Análisis de sentimientos en redes sociales",
      autores: "Reyes, S.; Villarroel, T.",
      anio: "2019",
      resumen: "Comparación de técnicas de NLP para análisis de sentimientos en Twitter.",
      fuente: "Lenguaje y Computación",
      doi: "10.1000/lc.2019.021",
      url: "https://example.com/paper9"
    },
    {
      titulo: "Sistemas recomendadores en comercio electrónico",
      autores: "Navarro, G.; Pinto, R.",
      anio: "2021",
      resumen: "Impacto de sistemas recomendadores en la conversión de ventas online.",
      fuente: "Comercio Digital",
      doi: "10.1000/cd.2021.014",
      url: "https://example.com/paper10"
    },
    {
      titulo: "Procesamiento de lenguaje natural para salud mental",
      autores: "Díaz, M.; Flores, C.",
      anio: "2024",
      resumen: "Detección temprana de síntomas mediante análisis de texto clínico.",
      fuente: "Salud Digital",
      doi: "10.1000/sd.2024.002",
      url: "https://example.com/paper11"
    },
    {
      titulo: "Optimización energética en smart cities",
      autores: "Valdez, P.; Ríos, J.",
      anio: "2020",
      resumen: "Estrategias de optimización energética con sensores urbanos.",
      fuente: "Ciudades Inteligentes",
      doi: "10.1000/ci.2020.077",
      url: "https://example.com/paper12"
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
    title: paper.titulo || "",
    authors: paper.autores || "",
    year: paper.anio || "",
    source: paper.fuente || "",
    url: paper.url || paper.doi || ""
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
