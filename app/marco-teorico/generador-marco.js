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

function generarCitaAPABasica(ref) {
  if (typeof generarCitaAPARapida === "function") return generarCitaAPARapida(ref);
  const autor = ref.autores || "";
  const anio = ref.anio || "";
  const titulo = ref.titulo || "";
  const fuente = ref.fuente || "";
  const partes = [];
  if (autor) partes.push(autor);
  if (anio) partes.push(`(${anio}).`);
  if (titulo) partes.push(titulo + ".");
  if (fuente) partes.push(fuente);
  return partes.join(" ").trim();
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

function extraerBloque(doc, titulo) {
  if (!doc) return "";
  const regex = new RegExp(`##\\s*${titulo}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*|$)`, "i");
  const match = doc.match(regex);
  return match ? match[1].trim() : "";
}

function obtenerDatosMotorIdeas() {
  const doc = localStorage.getItem("documento_base")
    || localStorage.getItem("motor_ideas_preview")
    || "";
  return {
    tema: extraerBloque(doc, "Tema") || obtenerTemaInvestigacion(),
    problema: extraerBloque(doc, "Problema"),
    ideas: extraerBloque(doc, "Ideas principales"),
    conceptos: extraerBloque(doc, "Conceptos clave"),
    objetivos: extraerBloque(doc, "Objetivo general")
  };
}

function contarPalabras(texto) {
  return String(texto || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function construirParrafo(base, extra = "") {
  return `${base.trim()} ${extra.trim()}`.trim();
}

function construirReferenciaNarrativa(ref) {
  const resumen = ref.resumen || "";
  const base = resumen
    ? `La literatura reciente documenta que ${resumen.replace(/\.$/, "")}.`
    : "";
  const cita = generarCitaAPABasica(ref);
  const citaTexto = cita ? `De acuerdo con ${cita}` : "";
  return [citaTexto, base].filter(Boolean).join(" ").trim();
}

function generarSeccion(titulo, parrafos) {
  return `### ${titulo}\n\n${parrafos.join("\n\n")}\n\n`;
}

function construirParrafoAcademico({ idea, explicacion, aplicacion, ejemplo, conexion }) {
  return [idea, explicacion, aplicacion, ejemplo, conexion].filter(Boolean).join(" ");
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similitudJaccard(a, b) {
  const setA = new Set(normalizarTexto(a).split(" ").filter(Boolean));
  const setB = new Set(normalizarTexto(b).split(" ").filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  setA.forEach((w) => { if (setB.has(w)) inter += 1; });
  const union = setA.size + setB.size - inter;
  return union ? inter / union : 0;
}

function esParrafoGenerico(parrafo) {
  const patrones = [
    /es importante señalar/i,
    /una cuestión central/i,
    /en este sentido/i,
    /a nivel universitario/i
  ];
  return patrones.some((p) => p.test(parrafo));
}

function asegurarUnicidad(parrafo, usados) {
  let score = 0;
  for (const prev of usados) {
    score = Math.max(score, similitudJaccard(parrafo, prev));
  }
  console.log("SIMILARITY CHECK:", score.toFixed(2));
  if (score > 0.7 || esParrafoGenerico(parrafo)) return null;
  return parrafo;
}

function seleccionarEjemplo(conceptos, indice) {
  const lista = String(conceptos || "")
    .split(/[;,]/)
    .map((c) => c.trim())
    .filter(Boolean);
  if (lista.length) {
    const c = lista[indice % lista.length];
    return `por ejemplo, en estudios aplicados sobre ${c} en contextos académicos`;
  }
  const ejemplos = [
    "por ejemplo, en investigaciones de campo con entrevistas en profundidad",
    "en análisis documentales que comparan enfoques teóricos",
    "cuando se contrastan estudios de caso con datos cualitativos",
    "en revisiones sistemáticas que identifican tendencias y vacíos"
  ];
  return ejemplos[indice % ejemplos.length];
}

function resumenProblema(problema) {
  const p = String(problema || "").trim();
  if (!p) return "el problema central identificado";
  return p.toLowerCase();
}

function buildParagraph(context, indice) {
  const { tema, problema, conceptos, seccion } = context;
  const ejemplo = seleccionarEjemplo(conceptos, indice);
  const problemaClave = resumenProblema(problema);
  const v = indice % 3;

  if (seccion === "introduccion") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `El marco teórico de **${tema}** define el conjunto de categorías que permiten interpretar el fenómeno de estudio.`,
        explicacion: "No se limita a enumerar conceptos, sino que explica cómo operan y por qué son pertinentes en el campo investigado.",
        aplicacion: `En el contexto disciplinar, estos conceptos orientan la interpretación y delimitan el alcance del análisis.`,
        ejemplo: `Esto se observa ${ejemplo}.`,
        conexion: `Por ello, el análisis se vincula con ${problemaClave}.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `La introducción del marco teórico sitúa **${tema}** dentro de un campo de discusión académica pertinente.`,
        explicacion: "Su propósito es explicar por qué este tema requiere un fundamento conceptual sólido.",
        aplicacion: "En el ámbito de estudio, esto implica revisar categorías clave, enfoques y antecedentes relevantes.",
        ejemplo: `Se evidencia ${ejemplo}.`,
        conexion: `Estas prácticas hacen visible ${problemaClave} y su impacto en la investigación.`
      });
    }
    return construirParrafoAcademico({
      idea: "Este capítulo establece la relación entre teoría y evidencia empírica en el campo de estudio.",
      explicacion: "La teoría define criterios para interpretar conceptos y contrastar enfoques.",
      aplicacion: "En el análisis, esa distinción se aplica a las variables y dimensiones centrales del tema.",
      ejemplo: `Un caso ilustrativo aparece ${ejemplo}.`,
      conexion: `Así se conecta el marco con ${problemaClave}.`
    });
  }

  if (seccion === "antecedentes") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `Los antecedentes de **${tema}** muestran la evolución del campo y los debates que han consolidado su estudio.`,
        explicacion: "La literatura describe transiciones conceptuales y metodológicas que permiten comprender el fenómeno.",
        aplicacion: "En el ámbito investigado, estos antecedentes orientan el diseño de categorías y enfoques analíticos.",
        ejemplo: `Un caso típico ocurre ${ejemplo}.`,
        conexion: `Esto revela cómo ${problemaClave} se expresa en la práctica.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: "Los antecedentes también evidencian cambios en la manera de definir el problema y sus variables clave.",
        explicacion: "Estos cambios se explican por nuevas perspectivas teóricas y por la diversificación de fuentes empíricas.",
        aplicacion: "En el contexto estudiado, esto se traduce en ajustes en los criterios de análisis.",
        ejemplo: `Se aprecia ${ejemplo}.`,
        conexion: `Sin un marco robusto, ${problemaClave} tiende a reproducirse.`
      });
    }
    return construirParrafoAcademico({
      idea: `Una fase reciente en los antecedentes muestra la consolidación de enfoques críticos y comparativos.`,
      explicacion: "La literatura actual enfatiza la necesidad de integrar dimensiones contextuales y epistemológicas.",
      aplicacion: "En el estudio, esto obliga a revisar supuestos y definir límites conceptuales claros.",
      ejemplo: `Esto ocurre ${ejemplo}.`,
      conexion: `De ahí que ${problemaClave} sea un problema central en el campo.`
    });
  }

  if (seccion === "fundamentos") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `Los fundamentos conceptuales de **${tema}** describen los elementos que estructuran el fenómeno.`,
        explicacion: "Estos fundamentos precisan el significado de los conceptos centrales y sus relaciones.",
        aplicacion: "En el análisis, permiten delimitar categorías y construir indicadores coherentes.",
        ejemplo: `Se aprecia ${ejemplo}.`,
        conexion: `Si no se precisan, ${problemaClave} se intensifica.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: "Los conceptos clave actúan como ejes que organizan la comprensión del problema investigado.",
        explicacion: "Definirlos con claridad evita ambigüedades y fortalece la consistencia del marco.",
        aplicacion: "En la investigación, esto se refleja en decisiones metodológicas más precisas.",
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Cuando se omiten, se amplifica ${problemaClave}.`
      });
    }
    return construirParrafoAcademico({
      idea: "La fundamentación conceptual también conecta el tema con teorías y enfoques previos.",
      explicacion: "Esta conexión ayuda a explicar el fenómeno desde perspectivas complementarias.",
      aplicacion: "En el estudio, permite justificar la selección de modelos analíticos.",
      ejemplo: `Esto ocurre ${ejemplo}.`,
      conexion: `Si no se integra, ${problemaClave} se vuelve más visible.`
    });
  }

  if (seccion === "modelos") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: "Los enfoques y modelos teóricos orientan la interpretación del fenómeno y sus variables.",
        explicacion: "Cada modelo aporta criterios distintos sobre causalidad, contexto y agencia.",
        aplicacion: "En la investigación, estos enfoques guían el análisis y la discusión de resultados.",
        ejemplo: `Esto se ve ${ejemplo}.`,
        conexion: `La falta de alineación con estos modelos favorece ${problemaClave}.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: "Un enfoque interpretativo prioriza la comprensión del significado que los actores atribuyen al fenómeno.",
        explicacion: "Este enfoque enfatiza la construcción social de la realidad y la influencia del contexto.",
        aplicacion: "En el estudio, permite analizar discursos, prácticas y sentidos asociados al tema.",
        ejemplo: `Esto se aprecia ${ejemplo}.`,
        conexion: `Esa lectura ayuda a explicar ${problemaClave}.`
      });
    }
    return construirParrafoAcademico({
      idea: "Un enfoque crítico analiza relaciones de poder, normas institucionales y efectos no intencionados.",
      explicacion: "Este marco aporta criterios para evaluar impactos y límites de las prácticas estudiadas.",
      aplicacion: "En el análisis, permite contrastar beneficios con riesgos del fenómeno.",
      ejemplo: `Esto se aprecia ${ejemplo}.`,
      conexion: `Si no se evalúa críticamente, se normaliza ${problemaClave}.`
    });
  }

  if (seccion === "investigaciones") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `Las investigaciones recientes sobre **${tema}** describen hallazgos y tendencias del campo.`,
        explicacion: "Los estudios reportan avances, pero también señalan límites metodológicos.",
        aplicacion: "En la práctica investigativa, estos hallazgos orientan ajustes de diseño y delimitación.",
        ejemplo: `Una evidencia cotidiana ocurre ${ejemplo}.`,
        conexion: `Estos resultados refuerzan ${problemaClave} como desafío vigente.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: "La literatura destaca divergencias en métodos, unidades de análisis y enfoques teóricos.",
        explicacion: "Estas divergencias muestran la complejidad del fenómeno y la necesidad de triangulación.",
        aplicacion: "En el estudio, esto implica justificar la estrategia metodológica elegida.",
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Sin esta justificación, ${problemaClave} persiste.`
      });
    }
    return construirParrafoAcademico({
      idea: "Los estudios también discuten implicaciones éticas, institucionales y sociales.",
      explicacion: "Estas discusiones revelan tensiones entre eficacia, legitimidad y pertinencia.",
      aplicacion: "En el análisis, esto demanda evaluar consecuencias no previstas.",
      ejemplo: `Esto se evidencia ${ejemplo}.`,
      conexion: `Estos riesgos se vinculan con ${problemaClave} y con ${problema.toLowerCase()}.`
    });
  }

  if (seccion === "comparacion") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: "La comparación crítica permite identificar diferencias entre enfoques tradicionales y contemporáneos.",
        explicacion: "Esta comparación revela supuestos metodológicos y conceptuales que afectan el análisis.",
        aplicacion: "En el estudio, ayuda a justificar decisiones y delimitar alcances.",
        ejemplo: `Esto se evidencia ${ejemplo}.`,
        conexion: `Sin criterios claros, ${problemaClave} se profundiza.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: "La comparación también muestra tensiones entre eficiencia y profundidad analítica.",
        explicacion: "Un enfoque puede priorizar resultados rápidos, mientras otro privilegia interpretación contextual.",
        aplicacion: "En la investigación, esto obliga a equilibrar ambas perspectivas.",
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Si no se controla, ${problemaClave} se vuelve estructural.`
      });
    }
    return construirParrafoAcademico({
      idea: "El análisis comparativo permite establecer criterios de validación y consistencia.",
      explicacion: "Estos criterios permiten reconocer fortalezas y debilidades de cada enfoque.",
      aplicacion: "En la discusión, contribuye a plantear recomendaciones fundamentadas.",
      ejemplo: `Esto se evidencia ${ejemplo}.`,
      conexion: `Sin esa evaluación, ${problemaClave} se incrementa.`
    });
  }

  return construirParrafoAcademico({
    idea: "La síntesis teórica integra antecedentes, conceptos y modelos para explicar el fenómeno central.",
    explicacion: "Este marco permite evaluar alcance, límites y condiciones del problema.",
    aplicacion: "En el estudio, se traduce en criterios para interpretar evidencias y sostener la discusión.",
    ejemplo: `Esto se hace visible ${ejemplo}.`,
    conexion: `Así se conecta con ${problemaClave}.`
  });
}
function generarMarcoTeorico(referencias) {
  const refs = (referencias || []).map(normalizarReferenciaMarco);
  const datos = obtenerDatosMotorIdeas();
  const tema = datos.tema || "Tema de investigación";
  const problema = datos.problema || "el uso inadecuado de IA por parte de estudiantes universitarios";
  const conceptos = datos.conceptos || "tecnología educativa, aprendizaje y evaluación";

  const refsUsadas = refs.filter((r) => r.titulo || r.autores || r.resumen).slice(0, 6);
  const referenciasNarrativas = refsUsadas
    .map(construirReferenciaNarrativa)
    .filter((t) => t && !t.includes("Autor (s.f.)") && !t.includes("Resumen no disponible"));

  const usados = [];
  const buildSeccion = (id, count) => {
    const parrafos = [];
    let i = 0;
    while (parrafos.length < count && i < count * 8) {
      const p = buildParagraph({ tema, problema, conceptos, seccion: id }, i);
      console.log("PARAGRAPH GENERATED:", p);
      const ok = asegurarUnicidad(p, usados);
      if (ok) {
        usados.push(ok);
        parrafos.push(ok);
      }
      i += 1;
    }
    return parrafos;
  };

  let texto = "## Marco Teórico\n\n";
  texto += generarSeccion("1. Introducción del marco teórico", buildSeccion("introduccion", 3));
  texto += generarSeccion("2. Antecedentes de la inteligencia artificial en educación", buildSeccion("antecedentes", 4));
  texto += generarSeccion("3. Fundamentos conceptuales", buildSeccion("fundamentos", 4));
  texto += generarSeccion("4. Enfoques y modelos teóricos", buildSeccion("modelos", 4));
  texto += generarSeccion("5. Investigaciones recientes sobre IA en educación superior", buildSeccion("investigaciones", 4));
  texto += generarSeccion("6. Comparación crítica entre enseñanza tradicional y enseñanza apoyada por IA", buildSeccion("comparacion", 3));
  texto += generarSeccion("7. Síntesis teórica del estudio", buildSeccion("sintesis", 3));

  if (referenciasNarrativas.length) {
    texto += "### Integración de referencias\n\n";
    texto += referenciasNarrativas.join("\n\n") + "\n\n";
  }

  while (contarPalabras(texto) < 1800) {
    const extra = buildParagraph({ tema, problema, conceptos, seccion: "sintesis" }, usados.length);
    const ok = asegurarUnicidad(extra, usados);
    if (ok) {
      usados.push(ok);
      texto += ok + "\n\n";
    } else {
      break;
    }
  }

  return texto;
}
