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
  const cita = generarCitaAPABasica(ref);
  const resumen = ref.resumen ? ref.resumen : "La investigación reporta hallazgos relacionados con el objeto de estudio.";
  return `La evidencia empírica descrita por ${cita} permite establecer un marco de análisis donde se describen métodos, resultados y limitaciones. ${resumen}`;
}

function generarSeccion(titulo, parrafos) {
  return `### ${titulo}\n\n${parrafos.join("\n\n")}\n\n`;
}

function generarMarcoTeorico(referencias) {
  const refs = (referencias || []).map(normalizarReferenciaMarco);
  const datos = obtenerDatosMotorIdeas();
  const tema = datos.tema || "Tema de investigación";
  const problema = datos.problema || "Se reconoce un problema académico que requiere delimitación conceptual.";
  const conceptos = datos.conceptos || "Se consideran constructos relacionados con tecnología, aprendizaje y evaluación.";

  const refsUsadas = refs.slice(0, 6);
  const referenciasNarrativas = refsUsadas.map(construirReferenciaNarrativa);

  let texto = "## Marco Teórico\n\n";
  texto += construirParrafo(
    `El marco teórico se orienta a fundamentar el estudio sobre **${tema}** mediante una revisión crítica de conceptos, enfoques y resultados empíricos.`,
    `El problema de investigación se expresa en términos de ${problema.toLowerCase()}, lo que demanda una articulación precisa entre teoría y evidencia.`
  );
  texto += "\n\n";

  const seccion1 = [
    construirParrafo(
      `La inteligencia artificial en educación se entiende como el uso de algoritmos y modelos computacionales para apoyar procesos de enseñanza, aprendizaje y evaluación.`,
      `Su desarrollo ha transitado desde sistemas expertos hasta arquitecturas de aprendizaje profundo, incrementando la capacidad de personalizar experiencias formativas.`
    ),
    construirParrafo(
      `En el contexto de **${tema}**, la IA permite modelar trayectorias de aprendizaje y detectar patrones de desempeño con alta granularidad.`,
      `El debate teórico se centra en el equilibrio entre automatización, autonomía pedagógica y transparencia de los sistemas de decisión.`
    ),
    construirParrafo(
      `La literatura académica ha descrito beneficios en términos de retroalimentación inmediata y ajustes adaptativos, aunque también advierte riesgos de sesgo algorítmico.`,
      `Estas tensiones son pertinentes para comprender ${problema.toLowerCase()} y orientar un marco interpretativo robusto.`
    )
  ];

  const seccion2 = [
    construirParrafo(
      `El aprendizaje adaptativo se define como la capacidad de un entorno educativo para ajustar contenidos, ritmos y estrategias según el perfil del estudiante.`,
      `Se sustenta en modelos cognitivos y en la recopilación continua de datos sobre desempeño y preferencias.`
    ),
    construirParrafo(
      `Desde una perspectiva teórica, el aprendizaje adaptativo articula principios de andamiaje y diferenciación instruccional.`,
      `En **${tema}**, esta aproximación permite vincular los conceptos clave de ${conceptos.toLowerCase()} con indicadores observables de progreso.`
    ),
    construirParrafo(
      `La aplicación de sistemas adaptativos requiere criterios de calidad en la selección de evidencias, así como metodologías para validar la efectividad pedagógica.`,
      `Este marco ayuda a examinar el alcance y las limitaciones asociadas a ${problema.toLowerCase()}.`
    )
  ];

  const seccion3 = [
    construirParrafo(
      `Las tecnologías educativas incluyen plataformas de gestión del aprendizaje, analítica educativa, sistemas tutores inteligentes y recursos interactivos.`,
      `Su integración demanda considerar factores institucionales, disponibilidad de infraestructura y competencias digitales.`
    ),
    construirParrafo(
      `La adopción de herramientas actuales se relaciona con el rediseño de prácticas docentes y la formulación de estrategias de evaluación coherentes.`,
      `En este estudio, se examinan herramientas que operacionalizan ${conceptos.toLowerCase()} y permiten medir impactos de forma verificable.`
    ),
    construirParrafo(
      `La evidencia sugiere que las tecnologías educativas pueden mejorar la continuidad del aprendizaje cuando se articulan con objetivos claros.`,
      `En el marco de **${tema}**, esta relación ofrece criterios para interpretar los resultados del estudio propuesto.`
    )
  ];

  const seccion4 = [
    construirParrafo(
      `El impacto en el rendimiento académico se analiza mediante estudios previos que correlacionan intervenciones tecnológicas con indicadores de logro.`,
      `Estos trabajos utilizan métricas de desempeño, permanencia y satisfacción, proporcionando un soporte empírico para evaluar ${problema.toLowerCase()}.`
    ),
    construirParrafo(
      `El análisis comparativo de investigaciones previas permite identificar patrones recurrentes, así como divergencias metodológicas.`,
      `Esto posibilita delimitar el alcance de los hallazgos y formular preguntas de investigación con sustento teórico.`
    ),
    construirParrafo(
      `La síntesis conceptual integra los aportes de la IA, el aprendizaje adaptativo y las tecnologías educativas, mostrando su influencia sobre el rendimiento.`,
      `Con ello se conforma un marco explicativo coherente para **${tema}**, orientado a respaldar decisiones metodológicas y analíticas.`
    )
  ];

  texto += generarSeccion("1. Inteligencia artificial en educación", seccion1);
  texto += generarSeccion("2. Aprendizaje adaptativo", seccion2);
  texto += generarSeccion("3. Tecnologías educativas", seccion3);
  texto += generarSeccion("4. Impacto en el rendimiento académico", seccion4);

  if (referenciasNarrativas.length) {
    texto += "### Evidencia empírica integrada\n\n";
    texto += referenciasNarrativas.join("\n\n") + "\n\n";
  }

  const palabras = contarPalabras(texto);
  if (palabras < 650) {
    const extra = construirParrafo(
      `La discusión teórica se beneficia de un enfoque integrador que conecta los constructos principales con variables observables, evitando reduccionismos.`,
      `Este criterio fortalece la coherencia argumentativa y favorece un análisis más preciso de ${problema.toLowerCase()}.`
    );
    texto += `### Consideraciones finales del marco\n\n${extra}\n\n`;
  }

  return texto;
}
