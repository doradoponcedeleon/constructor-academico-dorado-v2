function normalizarReferenciaMarco(r) {
  return {
    titulo: r.titulo || r.title || "Título no disponible",
    autores: r.autor || r.autores || r.authors || "Autor(es) no disponible",
    anio: r.anio || r.year || "s.f.",
    resumen: r.resumen || r.abstract || "Resumen no disponible.",
    fuente: r.revista || r.fuente || r.source || "",
    doi: r.doi || r.url || ""
  };
}

function generarCitaAPABasica(ref) {
  if (typeof generarCitaAPARapida === "function") return generarCitaAPARapida(ref);
  const autor = ref.autores || "Autor";
  const anio = ref.anio || "s.f.";
  const titulo = ref.titulo || "Título";
  const fuente = ref.fuente || "";
  return `${autor} (${anio}). ${titulo}. ${fuente}`.trim();
}

function obtenerTemaInvestigacion() {
  try {
    const base = typeof safeGetJSON === "function" ? safeGetJSON("tesis_base", null) : null;
    if (base && base.tema) return base.tema;
  } catch (e) {
    // ignore
  }
  const doc = localStorage.getItem("documento_base") || "";
  if (doc) {
    const line = doc.split("\n").find((l) => l.trim());
    if (line) return line.replace(/^#+\s*/, "").trim();
  }
  return "Tema de investigación";
}

function agruparReferenciasEnTemas(refs) {
  const temas = [
    { titulo: "Historia del campo", items: [] },
    { titulo: "Modelos teóricos", items: [] },
    { titulo: "Investigaciones recientes", items: [] },
    { titulo: "Comparación de enfoques", items: [] },
    { titulo: "Síntesis conceptual", items: [] }
  ];

  refs.forEach((r, idx) => {
    const bucket = idx % temas.length;
    temas[bucket].items.push(r);
  });

  return temas;
}

function generarMarcoTeorico(referencias) {
  const tema = obtenerTemaInvestigacion();
  const refs = (referencias || []).map(normalizarReferenciaMarco);
  const temas = agruparReferenciasEnTemas(refs);

  let texto = `# Marco Teórico\n\n`;
  texto += `Este capítulo desarrolla el marco teórico para el tema **${tema}**, articulando antecedentes, modelos y enfoques relevantes.\n\n`;

  temas.forEach((t) => {
    texto += `## ${t.titulo}\n\n`;
    if (!t.items.length) {
      texto += "No hay referencias suficientes para este apartado.\n\n";
      return;
    }
    t.items.forEach((r) => {
      const cita = generarCitaAPABasica(r);
      texto += `**Cita APA:** ${cita}\n\n`;
      texto += `${r.resumen}\n\n`;
      texto += `Conexión con el tema: este trabajo aporta elementos que fortalecen la comprensión de **${tema}**, proporcionando evidencia y perspectivas útiles para la investigación.\n\n`;
    });
  });

  return texto;
}
