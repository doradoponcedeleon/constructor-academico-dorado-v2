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

function normalizarReferenciaMarco(r) {
  return {
    titulo: r.titulo || r.title || "",
    autores: r.autor || r.autores || r.authors || "",
    anio: r.anio || r.year || "",
    resumen: r.resumen || r.abstract || "",
    fuente: r.revista || r.fuente || r.source || "",
    doi: r.doi || r.url || ""
  };
}

function obtenerTemaInvestigacionBase() {
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

function extraerBloqueBase(doc, titulo) {
  if (!doc) return "";
  const regex = new RegExp(`##\\s*${titulo}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*|$)`, "i");
  const match = doc.match(regex);
  return match ? match[1].trim() : "";
}

function obtenerDatosMotorIdeasBase() {
  const doc = localStorage.getItem("documento_base")
    || localStorage.getItem("motor_ideas_preview")
    || "";
  return {
    tema: extraerBloqueBase(doc, "Tema") || obtenerTemaInvestigacionBase(),
    problema: extraerBloqueBase(doc, "Problema"),
    ideas: extraerBloqueBase(doc, "Ideas principales"),
    conceptos: extraerBloqueBase(doc, "Conceptos clave"),
    objetivos: extraerBloqueBase(doc, "Objetivo general")
  };
}

function normalizarTextoBase(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similitudJaccardBase(a, b) {
  const setA = new Set(normalizarTextoBase(a).split(" ").filter(Boolean));
  const setB = new Set(normalizarTextoBase(b).split(" ").filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  setA.forEach((w) => { if (setB.has(w)) inter += 1; });
  const union = setA.size + setB.size - inter;
  return union ? inter / union : 0;
}

function esParrafoGenericoBase(parrafo) {
  const patrones = [
    /es importante señalar/i,
    /una cuestión central/i,
    /en este sentido/i,
    /a nivel universitario/i
  ];
  return patrones.some((p) => p.test(parrafo));
}

function asegurarUnicidadBase(parrafo, usados) {
  let score = 0;
  for (const prev of usados) {
    score = Math.max(score, similitudJaccardBase(parrafo, prev));
  }
  if (score > 0.7 || esParrafoGenericoBase(parrafo)) return null;
  return parrafo;
}

function construirParrafoAcademicoBase({ idea, explicacion, aplicacion, ejemplo, conexion }) {
  return [idea, explicacion, aplicacion, ejemplo, conexion].filter(Boolean).join(" ");
}

function buildParagraphBase(context, indice) {
  const { tema, problema, conceptos, seccion } = context;
  const ejemplo = seleccionarEjemploBase(conceptos, indice);
  const problemaClave = resumenProblemaBase(problema);
  const v = indice % 3;

  if (seccion === "introduccion") {
    if (v === 0) {
      return construirParrafoAcademicoBase({
        idea: `El marco teórico de **${tema}** define el conjunto de categorías que permiten interpretar el fenómeno de estudio.`,
        explicacion: "No se limita a enumerar conceptos, sino que explica cómo operan y por qué son pertinentes en el campo investigado.",
        aplicacion: "En el contexto disciplinar, estos conceptos orientan la interpretación y delimitan el alcance del análisis.",
        ejemplo: `Esto se observa ${ejemplo}.`,
        conexion: `Por ello, el análisis se vincula con ${problemaClave}.`
      });
    }
    if (v === 1) {
      return construirParrafoAcademicoBase({
        idea: `La introducción del marco teórico sitúa **${tema}** dentro de un campo de discusión académica pertinente.`,
        explicacion: "Su propósito es explicar por qué este tema requiere un fundamento conceptual sólido.",
        aplicacion: "En el ámbito de estudio, esto implica revisar categorías clave, enfoques y antecedentes relevantes.",
        ejemplo: `Se evidencia ${ejemplo}.`,
        conexion: `Estas prácticas hacen visible ${problemaClave} y su impacto en la investigación.`
      });
    }
    return construirParrafoAcademicoBase({
      idea: "Este capítulo establece la relación entre teoría y evidencia empírica en el campo de estudio.",
      explicacion: "La teoría define criterios para interpretar conceptos y contrastar enfoques.",
      aplicacion: "En el análisis, esa distinción se aplica a las variables y dimensiones centrales del tema.",
      ejemplo: `Un caso ilustrativo aparece ${ejemplo}.`,
      conexion: `Así se conecta el marco con ${problemaClave}.`
    });
  }

  if (seccion === "antecedentes") {
    if (v === 0) {
      return construirParrafoAcademicoBase({
        idea: `Los antecedentes de **${tema}** muestran la evolución del campo y los debates que han consolidado su estudio.`,
        explicacion: "La literatura describe transiciones conceptuales y metodológicas que permiten comprender el fenómeno.",
        aplicacion: "En el ámbito investigado, estos antecedentes orientan el diseño de categorías y enfoques analíticos.",
        ejemplo: `Un caso típico ocurre ${ejemplo}.`,
        conexion: `Esto revela cómo ${problemaClave} se expresa en la práctica.`
      });
    }
    if (v === 1) {
      return construirParrafoAcademicoBase({
        idea: "Los antecedentes también evidencian cambios en la manera de definir el problema y sus variables clave.",
        explicacion: "Estos cambios se explican por nuevas perspectivas teóricas y por la diversificación de fuentes empíricas.",
        aplicacion: "En el contexto estudiado, esto se traduce en ajustes en los criterios de análisis.",
        ejemplo: `Se aprecia ${ejemplo}.`,
        conexion: `Sin un marco robusto, ${problemaClave} tiende a reproducirse.`
      });
    }
    return construirParrafoAcademicoBase({
      idea: "Una fase reciente en los antecedentes muestra la consolidación de enfoques críticos y comparativos.",
      explicacion: "La literatura actual enfatiza la necesidad de integrar dimensiones contextuales y epistemológicas.",
      aplicacion: "En el estudio, esto obliga a revisar supuestos y definir límites conceptuales claros.",
      ejemplo: `Esto ocurre ${ejemplo}.`,
      conexion: `De ahí que ${problemaClave} sea un problema central en el campo.`
    });
  }

  if (seccion === "fundamentos") {
    if (v === 0) {
      return construirParrafoAcademicoBase({
        idea: `Los fundamentos conceptuales de **${tema}** describen los elementos que estructuran el fenómeno.`,
        explicacion: "Estos fundamentos precisan el significado de los conceptos centrales y sus relaciones.",
        aplicacion: "En el análisis, permiten delimitar categorías y construir indicadores coherentes.",
        ejemplo: `Se aprecia ${ejemplo}.`,
        conexion: `Si no se precisan, ${problemaClave} se intensifica.`
      });
    }
    if (v === 1) {
      return construirParrafoAcademicoBase({
        idea: "Los conceptos clave actúan como ejes que organizan la comprensión del problema investigado.",
        explicacion: "Definirlos con claridad evita ambigüedades y fortalece la consistencia del marco.",
        aplicacion: "En la investigación, esto se refleja en decisiones metodológicas más precisas.",
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Cuando se omiten, se amplifica ${problemaClave}.`
      });
    }
    return construirParrafoAcademicoBase({
      idea: "La fundamentación conceptual también conecta el tema con teorías y enfoques previos.",
      explicacion: "Esta conexión ayuda a explicar el fenómeno desde perspectivas complementarias.",
      aplicacion: "En el estudio, permite justificar la selección de modelos analíticos.",
      ejemplo: `Esto ocurre ${ejemplo}.`,
      conexion: `Si no se integra, ${problemaClave} se vuelve más visible.`
    });
  }

  if (seccion === "modelos") {
    if (v === 0) {
      return construirParrafoAcademicoBase({
        idea: "Los enfoques y modelos teóricos orientan la interpretación del fenómeno y sus variables.",
        explicacion: "Cada modelo aporta criterios distintos sobre causalidad, contexto y agencia.",
        aplicacion: "En la investigación, estos enfoques guían el análisis y la discusión de resultados.",
        ejemplo: `Esto se ve ${ejemplo}.`,
        conexion: `La falta de alineación con estos modelos favorece ${problemaClave}.`
      });
    }
    if (v === 1) {
      return construirParrafoAcademicoBase({
        idea: "Un enfoque interpretativo prioriza la comprensión del significado que los actores atribuyen al fenómeno.",
        explicacion: "Este enfoque enfatiza la construcción social de la realidad y la influencia del contexto.",
        aplicacion: "En el estudio, permite analizar discursos, prácticas y sentidos asociados al tema.",
        ejemplo: `Esto se aprecia ${ejemplo}.`,
        conexion: `Esa lectura ayuda a explicar ${problemaClave}.`
      });
    }
    return construirParrafoAcademicoBase({
      idea: "Un enfoque crítico analiza relaciones de poder, normas institucionales y efectos no intencionados.",
      explicacion: "Este marco aporta criterios para evaluar impactos y límites de las prácticas estudiadas.",
      aplicacion: "En el análisis, permite contrastar beneficios con riesgos del fenómeno.",
      ejemplo: `Esto se aprecia ${ejemplo}.`,
      conexion: `Si no se evalúa críticamente, se normaliza ${problemaClave}.`
    });
  }

  if (seccion === "investigaciones") {
    if (v === 0) {
      return construirParrafoAcademicoBase({
        idea: `Las investigaciones recientes sobre **${tema}** describen hallazgos y tendencias del campo.`,
        explicacion: "Los estudios reportan avances, pero también señalan límites metodológicos.",
        aplicacion: "En la práctica investigativa, estos hallazgos orientan ajustes de diseño y delimitación.",
        ejemplo: `Una evidencia cotidiana ocurre ${ejemplo}.`,
        conexion: `Estos resultados refuerzan ${problemaClave} como desafío vigente.`
      });
    }
    if (v === 1) {
      return construirParrafoAcademicoBase({
        idea: "La literatura destaca divergencias en métodos, unidades de análisis y enfoques teóricos.",
        explicacion: "Estas divergencias muestran la complejidad del fenómeno y la necesidad de triangulación.",
        aplicacion: "En el estudio, esto implica justificar la estrategia metodológica elegida.",
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Sin esta justificación, ${problemaClave} persiste.`
      });
    }
    return construirParrafoAcademicoBase({
      idea: "Los estudios también discuten implicaciones éticas, institucionales y sociales.",
      explicacion: "Estas discusiones revelan tensiones entre eficacia, legitimidad y pertinencia.",
      aplicacion: "En el análisis, esto demanda evaluar consecuencias no previstas.",
      ejemplo: `Esto se evidencia ${ejemplo}.`,
      conexion: `Estos riesgos se vinculan con ${problemaClave} y con ${problema.toLowerCase()}.`
    });
  }

  if (seccion === "comparacion") {
    if (v === 0) {
      return construirParrafoAcademicoBase({
        idea: "La comparación crítica permite identificar diferencias entre enfoques tradicionales y contemporáneos.",
        explicacion: "Esta comparación revela supuestos metodológicos y conceptuales que afectan el análisis.",
        aplicacion: "En el estudio, ayuda a justificar decisiones y delimitar alcances.",
        ejemplo: `Esto se evidencia ${ejemplo}.`,
        conexion: `Sin criterios claros, ${problemaClave} se profundiza.`
      });
    }
    if (v === 1) {
      return construirParrafoAcademicoBase({
        idea: "La comparación también muestra tensiones entre eficiencia y profundidad analítica.",
        explicacion: "Un enfoque puede priorizar resultados rápidos, mientras otro privilegia interpretación contextual.",
        aplicacion: "En la investigación, esto obliga a equilibrar ambas perspectivas.",
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Si no se controla, ${problemaClave} se vuelve estructural.`
      });
    }
    return construirParrafoAcademicoBase({
      idea: "El análisis comparativo permite establecer criterios de validación y consistencia.",
      explicacion: "Estos criterios permiten reconocer fortalezas y debilidades de cada enfoque.",
      aplicacion: "En la discusión, contribuye a plantear recomendaciones fundamentadas.",
      ejemplo: `Esto se evidencia ${ejemplo}.`,
      conexion: `Sin esa evaluación, ${problemaClave} se incrementa.`
    });
  }

  return construirParrafoAcademicoBase({
    idea: "La síntesis teórica integra antecedentes, conceptos y modelos para explicar el fenómeno central.",
    explicacion: "Este marco permite evaluar alcance, límites y condiciones del problema.",
    aplicacion: "En el estudio, se traduce en criterios para interpretar evidencias y sostener la discusión.",
    ejemplo: `Esto se hace visible ${ejemplo}.`,
    conexion: `Así se conecta con ${problemaClave}.`
  });
}

function generarMarcoTeoricoProfundo(referencias) {
  const refs = (referencias || []).map(normalizarReferenciaMarco);
  const datos = obtenerDatosMotorIdeasBase();
  const tema = datos.tema || "Tema de investigación";
  const problema = datos.problema || "el problema central identificado en el estudio";
  const conceptos = datos.conceptos || "conceptos clave del tema";

  const usados = [];
  const buildSeccion = (id, count) => {
    const parrafos = [];
    let i = 0;
    while (parrafos.length < count && i < count * 8) {
      const p = buildParagraphBase({ tema, problema, conceptos, seccion: id }, i);
      const ok = asegurarUnicidadBase(p, usados);
      if (ok) {
        usados.push(ok);
        parrafos.push(ok);
      }
      i += 1;
    }
    return parrafos;
  };

  let texto = "## Marco Teórico\n\n";
  texto += `### 1. Introducción del marco teórico\n\n${buildSeccion("introduccion", 3).join("\n\n")}\n\n`;
  texto += `### 2. Antecedentes del campo de estudio\n\n${buildSeccion("antecedentes", 4).join("\n\n")}\n\n`;
  texto += `### 3. Fundamentos conceptuales\n\n${buildSeccion("fundamentos", 4).join("\n\n")}\n\n`;
  texto += `### 4. Enfoques y modelos teóricos\n\n${buildSeccion("modelos", 4).join("\n\n")}\n\n`;
  texto += `### 5. Investigaciones recientes en el tema\n\n${buildSeccion("investigaciones", 4).join("\n\n")}\n\n`;
  texto += `### 6. Comparación crítica de enfoques\n\n${buildSeccion("comparacion", 3).join("\n\n")}\n\n`;
  texto += `### 7. Síntesis teórica del estudio\n\n${buildSeccion("sintesis", 3).join("\n\n")}\n\n`;

  while (texto.trim().split(/\s+/).filter(Boolean).length < 1800) {
    const extra = buildParagraphBase({ tema, problema, conceptos, seccion: "sintesis" }, usados.length);
    const ok = asegurarUnicidadBase(extra, usados);
    if (ok) {
      usados.push(ok);
      texto += `${ok}\n\n`;
    } else {
      break;
    }
  }

  return texto;
}

function generarMarcoTeoricoAutomatico() {
  const referencias = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
  const texto = typeof generarMarcoTeorico === "function"
    ? generarMarcoTeorico(referencias)
    : generarMarcoTeoricoProfundo(referencias);

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
