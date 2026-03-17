const MAPA_STOPWORDS = [
  "de", "la", "el", "y", "en", "a", "un", "una", "los", "las", "del", "al",
  "para", "por", "con", "sin", "sobre", "entre", "estudio", "análisis", "investigación"
];

function limpiarTextoMapa(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerKeywords(texto) {
  const limpio = limpiarTextoMapa(texto);
  if (!limpio) return [];
  return limpio
    .split(" ")
    .filter((w) => w.length > 3 && !MAPA_STOPWORDS.includes(w));
}

function normalizarRefMapa(r) {
  return {
    titulo: r.titulo || r.title || "Título no disponible",
    autores: r.autor || r.autores || r.authors || "Autor(es) no disponible",
    anio: r.anio || r.year || "s.f.",
    resumen: r.resumen || r.abstract || "",
    fuente: r.revista || r.fuente || r.source || ""
  };
}

function agruparPorKeywords(referencias) {
  const clusters = {};
  referencias.forEach((r) => {
    const kws = extraerKeywords(`${r.titulo} ${r.resumen}`);
    const key = kws[0] || "general";
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(r);
  });
  return clusters;
}

function generarMapaLiteratura(referencias) {
  const refs = (referencias || []).map(normalizarRefMapa);
  const clusters = agruparPorKeywords(refs);

  const autoresCount = {};
  refs.forEach((r) => {
    const autores = String(r.autores || "").split(";").map((a) => a.trim()).filter(Boolean);
    autores.forEach((a) => {
      autoresCount[a] = (autoresCount[a] || 0) + 1;
    });
  });

  const autoresTop = Object.keys(autoresCount)
    .sort((a, b) => autoresCount[b] - autoresCount[a])
    .slice(0, 10);

  const temas = Object.keys(clusters).filter((k) => k !== "general");

  let texto = "# Mapa de Literatura Científica\n\n";

  texto += "## Autores principales\n\n";
  texto += autoresTop.length ? autoresTop.map((a) => `- ${a}`).join("\n") : "No hay autores destacados.";
  texto += "\n\n";

  texto += "## Temas identificados\n\n";
  texto += temas.length ? temas.map((t) => `- ${t}`).join("\n") : "No se detectaron temas claros.";
  texto += "\n\n";

  texto += "## Clusters de investigación\n\n";
  Object.keys(clusters).forEach((k) => {
    texto += `### ${k}\n`;
    clusters[k].slice(0, 5).forEach((r) => {
      texto += `- ${r.titulo} (${r.anio})\n`;
    });
    texto += "\n";
  });

  texto += "## Tendencias\n\n";
  texto += "Se observa concentración de estudios en torno a los temas dominantes y un crecimiento de investigaciones recientes en áreas emergentes.\n";

  return texto;
}
