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

function generarMarcoTeorico(referencias) {
  const conectores = [
    "En este contexto",
    "Desde esta perspectiva",
    "Diversos estudios sugieren",
    "Por otro lado",
    "En consecuencia",
    "De manera complementaria",
    "A la luz de la evidencia",
    "En términos metodológicos"
  ];
  const refs = (referencias || []).map(normalizarReferenciaMarco);
  const datos = obtenerDatosMotorIdeas();
  const tema = datos.tema || "Tema de investigación";
  const problema = datos.problema || "Se reconoce un problema académico que requiere delimitación conceptual.";
  const conceptos = datos.conceptos || "Se consideran constructos relacionados con tecnología, aprendizaje y evaluación.";

  const refsUsadas = refs
    .filter((r) => r.titulo || r.resumen || r.autores)
    .slice(0, 6);
  const referenciasNarrativas = refsUsadas
    .map(construirReferenciaNarrativa)
    .filter((t) => t && !t.includes("Resumen no disponible") && !t.includes("Autor (s.f.)"));

  let texto = "## Marco Teórico\n\n";
  texto += construirParrafo(
    `${conectores[0]}, el marco teórico se orienta a fundamentar el estudio sobre **${tema}** mediante una revisión crítica de conceptos, enfoques y resultados empíricos.`,
    `El problema de investigación se expresa en términos de ${problema.toLowerCase()}, lo que demanda una articulación rigurosa entre teoría y evidencia.`
  ) + "\n\n";

  const historia = [
    construirParrafo(
      `${conectores[1]}, la evolución de la inteligencia artificial en educación responde a la necesidad de ampliar las capacidades de diagnóstico y acompañamiento del aprendizaje.`,
      `En sus primeras etapas, los sistemas tutoriales se apoyaban en reglas explícitas; posteriormente, los modelos estadísticos y el aprendizaje automático permitieron incorporar patrones complejos de interacción con estudiantes y contenidos.`
    ),
    construirParrafo(
      `${conectores[2]}, la transición hacia enfoques basados en datos ha ampliado el alcance de la personalización, dando lugar a sistemas que ajustan contenidos en función del desempeño, la trayectoria académica y la interacción con recursos digitales.`,
      `Esta evolución histórica ofrece un contexto indispensable para comprender **${tema}** y su relación con ${conceptos.toLowerCase()}, ya que la transformación digital modifica los roles de docentes, estudiantes y plataformas.`
    ),
    construirParrafo(
      `${conectores[3]}, en el marco de ${problema.toLowerCase()}, la IA se interpreta como un conjunto de herramientas que permiten observar procesos de aprendizaje con mayor precisión, aunque plantea desafíos éticos y metodológicos.`,
      `La literatura señala la necesidad de criterios de transparencia, explicabilidad y responsabilidad en el diseño de estos sistemas, especialmente cuando se aplican en contextos de evaluación y toma de decisiones académicas.`
    )
  ];

  const modelos = [
    construirParrafo(
      `${conectores[4]}, los modelos teóricos del aprendizaje aportan categorías para interpretar cómo se adquieren y consolidan conocimientos.`,
      `Desde el constructivismo se enfatiza la construcción activa de significados, mientras que el conductismo resalta la relación entre estímulos, respuestas y refuerzos, y el aprendizaje adaptativo introduce la noción de ajuste dinámico según el desempeño.`
    ),
    construirParrafo(
      `${conectores[5]}, el aprendizaje adaptativo integra estos enfoques al convertirlos en reglas de diseño instruccional y en parámetros de ajuste automático.`,
      `Así, la IA no reemplaza la pedagogía, sino que operacionaliza principios didácticos mediante algoritmos que responden a variaciones individuales en ritmo, dificultad y estilos de interacción.`
    ),
    construirParrafo(
      `${conectores[6]}, en este estudio, los conceptos clave de ${conceptos.toLowerCase()} se articulan con los modelos de evaluación formativa, permitiendo construir indicadores pertinentes para evaluar **${tema}**.`,
      `Esta articulación evita lecturas reduccionistas y permite interpretar la eficacia de la IA en términos de procesos y resultados, no solo de métricas instrumentales.`
    )
  ];

  const recientes = [
    construirParrafo(
      `${conectores[7]}, las investigaciones recientes enfatizan el uso de analítica educativa, minería de datos y sistemas de recomendación para mejorar el rendimiento.`,
      `Estos estudios reportan mejoras en la identificación temprana de riesgos académicos y en la personalización de actividades, especialmente en universidades que integran plataformas con capacidades predictivas.`
    ),
    construirParrafo(
      `${conectores[0]}, la tendencia dominante se orienta a combinar datos de interacción, desempeño y contexto para generar intervenciones oportunas.`,
      `En términos de ${problema.toLowerCase()}, se observa un desplazamiento hacia modelos explicativos que integran variables pedagógicas y tecnológicas, así como dimensiones socioemocionales del aprendizaje.`
    ),
    construirParrafo(
      `${conectores[1]}, cuando la evidencia empírica es limitada, la narrativa académica se apoya en inferencias teóricas y en analogías metodológicas consistentes.`,
      `Este criterio permite sostener la coherencia del marco incluso en escenarios donde las referencias disponibles son parciales, evitando la reproducción de afirmaciones vacías.`
    )
  ];

  const comparacion = [
    construirParrafo(
      `${conectores[2]}, los enfoques tradicionales de enseñanza se apoyan en estrategias uniformes de transmisión de contenidos, con poca capacidad de adaptación individual.`,
      `En contraste, los enfoques basados en IA introducen sistemas que ajustan la complejidad de las tareas y la secuencia didáctica en tiempo real, permitiendo rutas formativas diferenciadas.`
    ),
    construirParrafo(
      `${conectores[3]}, la comparación entre ambos enfoques muestra diferencias en la forma de evaluar el aprendizaje: los modelos clásicos priorizan pruebas estandarizadas, mientras que la IA utiliza métricas continuas y multimodales.`,
      `Esta divergencia resulta clave para comprender los efectos sobre el rendimiento académico y la pertinencia de **${tema}**, así como los riesgos de sesgos algorítmicos.`
    ),
    construirParrafo(
      `${conectores[4]}, la integración de IA exige condiciones institucionales, competencias digitales y marcos éticos robustos.`,
      `Por ello, la comparación debe considerar no solo la efectividad, sino también la viabilidad, la sostenibilidad y la gobernanza de las soluciones propuestas.`
    )
  ];

  const sintesis = [
    construirParrafo(
      `${conectores[5]}, la síntesis conceptual articula la evolución histórica, los modelos teóricos y la evidencia reciente para construir un marco explicativo coherente.`,
      `Este marco permite interpretar ${problema.toLowerCase()} como una situación que requiere decisiones pedagógicas informadas por datos y respaldadas por teoría.`
    ),
    construirParrafo(
      `${conectores[6]}, la convergencia entre IA, aprendizaje adaptativo y tecnologías educativas ofrece una perspectiva integradora que orienta el diseño metodológico del estudio.`,
      `En consecuencia, el marco teórico se convierte en una guía para la selección de variables, indicadores y criterios de análisis que den cuenta de los efectos reales sobre el aprendizaje.`
    ),
    construirParrafo(
      `${conectores[7]}, la coherencia interna del marco asegura que el estudio sobre **${tema}** mantenga una relación sólida entre sus fundamentos conceptuales y su desarrollo empírico, permitiendo formular conclusiones consistentes y transferibles.`
    )
  ];

  texto += generarSeccion("Historia del campo", historia);
  texto += generarSeccion("Modelos teóricos", modelos);
  texto += generarSeccion("Investigaciones recientes", recientes);
  texto += generarSeccion("Comparación de enfoques", comparacion);
  texto += generarSeccion("Síntesis conceptual", sintesis);

  if (referenciasNarrativas.length) {
    texto += "### Integración de referencias\n\n";
    texto += referenciasNarrativas.join("\n\n") + "\n\n";
  }

  const palabras = contarPalabras(texto);
  if (palabras < 1200) {
    const refuerzo = [
      construirParrafo(
        `${conectores[0]}, la profundización teórica exige revisar cómo los indicadores de aprendizaje se operacionalizan en contextos digitales.`,
        `Esto implica discutir la fiabilidad de los datos, la validez de las inferencias y la capacidad de los sistemas para explicar sus recomendaciones.`
      ),
      construirParrafo(
        `${conectores[2]}, la dimensión ética de la IA educativa se vincula con la protección de datos, la transparencia de modelos y la equidad en el acceso.`,
        `Estos elementos son determinantes para interpretar los resultados del estudio y para justificar la pertinencia de **${tema}**.`
      ),
      construirParrafo(
        `${conectores[4]}, la sostenibilidad de las soluciones tecnológicas depende de la cultura institucional, la formación docente y la integración curricular.`,
        `En consecuencia, el marco teórico debe contemplar condiciones contextuales que modulan el impacto de la innovación educativa.`
      ),
      construirParrafo(
        `${conectores[6]}, el análisis de ${problema.toLowerCase()} requiere considerar la relación entre variables pedagógicas y tecnológicas, evitando conclusiones deterministas.`,
        `Esto permite un enfoque equilibrado que reconoce oportunidades y limitaciones del uso de IA en educación.`
      )
    ];
    texto += "### Profundización teórica\n\n" + refuerzo.join("\n\n") + "\n\n";
  }

  let palabrasFinal = contarPalabras(texto);
  if (palabrasFinal < 1000) {
    const extra = construirParrafo(
      `${conectores[1]}, se propone una lectura integrada de ${conceptos.toLowerCase()} que articule niveles macro y micro del aprendizaje.`,
      `Esta lectura facilita comprender cómo las decisiones de diseño tecnológico influyen en la experiencia educativa y en la calidad de los resultados.`
    );
    texto += `### Consideraciones finales del marco\n\n${extra}\n\n`;
    palabrasFinal = contarPalabras(texto);
  }

  return texto;
}
