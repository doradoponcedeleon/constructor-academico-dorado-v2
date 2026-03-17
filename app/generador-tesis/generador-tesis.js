const TESIS_ESTRUCTURA_BASE = [
  "Título",
  "Resumen",
  "Introducción",
  "Planteamiento del problema",
  "Objetivos",
  "Justificación",
  "Marco teórico",
  "Estado del arte",
  "Metodología",
  "Resultados esperados",
  "Conclusiones",
  "Bibliografía"
];

function construirEstructuraTesis(data) {
  const tema = data.tema || "Tema de investigación";
  const nivel = data.nivel || "Licenciatura";
  const area = data.area || "Área";

  const estructura = TESIS_ESTRUCTURA_BASE.map((t) => ({ titulo: t }));

  const markdown = `# ${tema}\n\n` +
    `**Nivel académico:** ${nivel}\n` +
    `**Área:** ${area}\n\n` +
    estructura.map((s) => `## ${s.titulo}\n`).join("\n");

  return { tema, nivel, area, estructura, markdown };
}

function construirTextoCapitulo(params) {
  const { seccion, tema, nivel, area, referencias, ideasBase } = params;
  const resumenRefs = referencias.length
    ? referencias.slice(0, 3).map((r) => `${r.autor || "Autor"} (${r.anio || "s.f."})`).join("; ")
    : "sin referencias cargadas";

  const ideas = ideasBase || "No hay documento base disponible.";

  return `## ${seccion}\n\n` +
    `Este apartado corresponde al tema **${tema}** en el nivel **${nivel}** del área **${area}**.\n\n` +
    `Se considera la base conceptual a partir de ideas previas: ${ideas}\n\n` +
    `Se integran aportes de referencias clave (${resumenRefs}) para sustentar el desarrollo del capítulo.\n\n` +
    `Se propone profundizar en la sección \"${seccion}\" con enfoque académico, delimitando conceptos, contexto y aportes esperados.\n`;
}

function generarMarcoTeoricoAutomatico() {
  const base = typeof safeGetJSON === "function" ? safeGetJSON("tesis_base", null) : null;
  const tema = base?.tema || "Tema de investigación";
  const referencias = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];

  const referenciasUsadas = referencias.slice(0, 6).map((r) => ({
    titulo: r.titulo || "Título no disponible",
    autores: r.autor || r.autores || "Autor(es) no disponible",
    anio: r.anio || "s.f.",
    resumen: r.resumen || r.abstract || "Resumen no disponible."
  }));

  const resumenInvestigaciones = referenciasUsadas.length
    ? referenciasUsadas.map((r, idx) => (
      `**${idx + 1}. ${r.titulo}** (${r.autores}, ${r.anio}). ${r.resumen}`
    )).join("\n\n")
    : "No hay referencias suficientes para generar este apartado.";

  const comparacion = referenciasUsadas.length
    ? "Los estudios revisados muestran enfoques metodológicos diversos (documental, descriptivo, experimental y mixto), con variaciones en alcance, población y técnicas de análisis."
    : "No es posible comparar enfoques por falta de referencias.";

  const sintesis = referenciasUsadas.length
    ? `En conjunto, las investigaciones aportan fundamentos teóricos relevantes para abordar el tema **${tema}**, permitiendo delimitar conceptos, identificar vacíos y sustentar el marco conceptual de la tesis.`
    : `Se requiere incorporar estudios para construir el marco conceptual del tema **${tema}**.`;

  const citasAPA = referenciasUsadas.length
    ? referenciasUsadas.map((r) => `${r.autores} (${r.anio}). ${r.titulo}.`).join("\n")
    : "No hay referencias citadas.";

  const texto = `## Marco teórico\n\n` +
    `### Introducción al marco teórico\n` +
    `El marco teórico contextualiza el tema **${tema}** a partir de conceptos, enfoques y antecedentes relevantes para la investigación.\n\n` +
    `### Principales investigaciones\n` +
    `${resumenInvestigaciones}\n\n` +
    `### Comparación de enfoques\n` +
    `${comparacion}\n\n` +
    `### Síntesis conceptual\n` +
    `${sintesis}\n\n` +
    `### Referencias citadas\n` +
    `${citasAPA}\n`;

  const capitulos = typeof safeGetJSON === "function" ? safeGetJSON("tesis_capitulos", {}) : {};
  capitulos["Marco teórico"] = texto;
  if (typeof safeSetJSON === "function") {
    safeSetJSON("tesis_capitulos", capitulos);
  } else {
    localStorage.setItem("tesis_capitulos", JSON.stringify(capitulos));
  }

  return texto;
}

function generarCapituloExtendido(seccion) {
  const base = typeof safeGetJSON === "function" ? safeGetJSON("tesis_base", null) : null;
  const tema = base?.tema || "Tema de investigación";
  const nivel = base?.nivel || "Licenciatura";
  const area = base?.area || "Área";
  const ideasBase = localStorage.getItem("documento_base") || "";
  const referencias = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];

  const refsCortas = referencias.slice(0, 6).map((r) => ({
    autor: r.autor || r.autores || "Autor(es)",
    anio: r.anio || "s.f.",
    titulo: r.titulo || "Título no disponible",
    resumen: r.resumen || r.abstract || "Resumen no disponible."
  }));

  const mapaSubsecciones = {
    "Introducción": [
      "Contexto del problema",
      "Importancia del estudio",
      "Alcance de la investigación"
    ],
    "Marco teórico": [
      "Conceptos fundamentales",
      "Investigaciones previas",
      "Modelos teóricos",
      "Síntesis conceptual"
    ],
    "Metodología": [
      "Tipo de investigación",
      "Diseño metodológico",
      "Instrumentos",
      "Procedimiento"
    ]
  };

  const subsecciones = mapaSubsecciones[seccion] || [
    "Antecedentes",
    "Desarrollo conceptual",
    "Aportes esperados"
  ];

  const construirParrafos = (tituloSub) => {
    const parrafos = [];
    parrafos.push(
      `El apartado **${tituloSub}** se desarrolla dentro de la sección **${seccion}**, ` +
      `considerando el tema **${tema}** en el nivel **${nivel}** del área **${area}**. ` +
      `Este enfoque permite delimitar el problema y organizar los contenidos con rigor académico.`
    );
    parrafos.push(
      `A partir de las ideas base disponibles, se identifican ejes conceptuales relevantes ` +
      `que orientan el análisis: ${ideasBase ? ideasBase : "no se cuenta con un documento base, por lo que se propone una estructura inicial"}.`
    );
    if (refsCortas.length) {
      const citas = refsCortas.slice(0, 3).map((r) => `${r.autor} (${r.anio})`).join("; ");
      parrafos.push(
        `La literatura consultada (${citas}) aporta antecedentes y fundamentos teóricos ` +
        `para sostener la discusión en torno a **${tema}**, destacando tendencias, hallazgos y vacíos.`
      );
      parrafos.push(
        `Entre los trabajos revisados, se observa que ${refsCortas[0].titulo} ` +
        `propone aportes clave, mientras que ${refsCortas[1] ? refsCortas[1].titulo : "otros estudios recientes"} ` +
        `amplían la comprensión del fenómeno. Estas referencias orientan el desarrollo del capítulo.`
      );
    } else {
      parrafos.push(
        "Se recomienda incorporar referencias académicas recientes para fortalecer el sustento " +
        "teórico y metodológico de este apartado."
      );
    }
    parrafos.push(
      `En términos analíticos, este apartado articula conceptos y evidencia con el propósito ` +
      `de generar una narrativa coherente que respalde los objetivos planteados en la tesis.`
    );
    return parrafos;
  };

  const construirSeccion = () => {
    let texto = `## ${seccion}\n\n`;
    subsecciones.forEach((sub) => {
      texto += `### ${sub}\n\n`;
      const parrafos = construirParrafos(sub);
      parrafos.forEach((p) => {
        texto += `${p}\n\n`;
      });
    });
    if (refsCortas.length) {
      texto += "### Referencias citadas\n\n";
      texto += refsCortas.map((r) => `${r.autor} (${r.anio}). ${r.titulo}.`).join("\n") + "\n\n";
    }
    return texto;
  };

  const contarPalabras = (texto) => {
    return texto.trim().split(/\s+/).filter(Boolean).length;
  };

  let contenido = construirSeccion();
  let palabras = contarPalabras(contenido);

  while (palabras < 1500) {
    contenido += `### Desarrollo adicional\n\n` +
      `Se amplía el análisis del capítulo **${seccion}** profundizando en la relación entre ` +
      `el tema **${tema}** y los marcos conceptuales disponibles. Este desarrollo complementario ` +
      `busca consolidar la consistencia argumentativa, incorporando reflexiones, ejemplos y ` +
      `consideraciones metodológicas que fortalecen la propuesta de investigación.\n\n` +
      `Asimismo, se discuten implicaciones prácticas y teóricas, vinculando los hallazgos ` +
      `documentales con el contexto del problema investigado. Esta ampliación refuerza ` +
      `la coherencia interna del capítulo y su conexión con los objetivos de la tesis.\n\n`;
    palabras = contarPalabras(contenido);
    if (palabras > 3000) break;
  }

  if (palabras > 3000) {
    const words = contenido.trim().split(/\s+/).filter(Boolean).slice(0, 3000);
    contenido = words.join(" ") + "\n";
  }

  const capitulos = typeof safeGetJSON === "function" ? safeGetJSON("tesis_capitulos", {}) : {};
  capitulos[seccion] = contenido;
  if (typeof safeSetJSON === "function") {
    safeSetJSON("tesis_capitulos", capitulos);
  } else {
    localStorage.setItem("tesis_capitulos", JSON.stringify(capitulos));
  }

  return contenido;
}

function prepararDocumentoTesisCompleto(base, capitulos) {
  const estructura = (base && Array.isArray(base.estructura) && base.estructura.length)
    ? base.estructura
    : TESIS_ESTRUCTURA_BASE.map((t) => ({ titulo: t }));
  const tema = base?.tema || "Tesis";
  const nivel = base?.nivel || "Licenciatura";
  const area = base?.area || "Área";

  let doc = `# ${tema}\n\n**Nivel académico:** ${nivel}\n**Área:** ${area}\n\n`;
  estructura.forEach((s) => {
    const contenido = capitulos[s.titulo] || "";
    doc += `## ${s.titulo}\n` + (contenido ? `\n${contenido}\n\n` : "\n");
  });
  return doc;
}

function construirReferenciasAPA(lista) {
  if (!Array.isArray(lista) || !lista.length) return "No hay referencias registradas.";
  return lista.map((r) => {
    const autor = r.autor || r.autores || "Autor";
    const anio = r.anio || "s.f.";
    const titulo = r.titulo || "Título";
    const fuente = r.revista || r.fuente || "";
    return `${autor} (${anio}). ${titulo}. ${fuente}`.trim();
  }).join("\n");
}

function generarTesisCompleta(data) {
  const titulo = data.titulo || "Título de la tesis";
  const autor = data.autor || "Autor";
  const carrera = data.carrera || "Carrera";
  const universidad = data.universidad || "Universidad";
  const linea = data.linea || "Línea de investigación";
  const objetivo = data.objetivo || "Objetivo general de la investigación";

  const referencias = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
  const marco = localStorage.getItem("marco_teorico") || "";
  const paper = localStorage.getItem("paper_base") || "";

  const intro = `# Introducción\n\n` +
    `Esta tesis se desarrolla en el marco de la carrera **${carrera}** de la **${universidad}**, ` +
    `en la línea de investigación **${linea}**. El objetivo central es: **${objetivo}**.\n\n` +
    `El contexto de investigación se sustenta en antecedentes académicos y la literatura disponible. ` +
    `${paper ? "Se toma como base un documento académico preliminar para orientar la discusión." : "Se propone una aproximación inicial al estado del conocimiento."}\n\n`;

  const marcoTeorico = `# Marco Teórico\n\n` + (marco || "Marco teórico no disponible. Genera el módulo de marco teórico para completar esta sección.\n\n");

  const metodologia = `# Metodología\n\n` +
    `**Tipo de investigación:** se propone un enfoque descriptivo y analítico acorde al tema.\n\n` +
    `**Diseño metodológico:** se combinarán técnicas documentales y de análisis cualitativo.\n\n` +
    `**Instrumentos:** revisión bibliográfica, análisis de contenido y matrices de síntesis.\n\n` +
    `**Procedimiento:** se recopilarán fuentes relevantes, se organizarán por categorías y se elaborará un análisis crítico.\n\n`;

  const resultados = `# Resultados\n\n` +
    `Este apartado presentará los hallazgos obtenidos durante el proceso de investigación, ` +
    `organizados según los objetivos planteados.\n\n`;

  const discusion = `# Discusión\n\n` +
    `Se interpretarán los resultados a la luz del marco teórico, contrastando con investigaciones previas ` +
    `y destacando aportes, limitaciones y posibles líneas futuras.\n\n`;

  const conclusiones = `# Conclusiones\n\n` +
    `Se sintetizan los principales aportes de la investigación, respondiendo al objetivo planteado ` +
    `y proponiendo recomendaciones derivadas del estudio.\n\n`;

  const refs = `# Referencias\n\n${construirReferenciasAPA(referencias)}\n`;

  const doc = `# ${titulo}\n\n` +
    `**Autor:** ${autor}\n` +
    `**Carrera:** ${carrera}\n` +
    `**Universidad:** ${universidad}\n` +
    `**Línea de investigación:** ${linea}\n` +
    `**Objetivo:** ${objetivo}\n\n` +
    `${intro}${marcoTeorico}${metodologia}${resultados}${discusion}${conclusiones}${refs}`;

  localStorage.setItem("tesis_completa", doc);
  return doc;
}
