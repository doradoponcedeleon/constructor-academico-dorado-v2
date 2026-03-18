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

function selectorConectores() {
  const conectores = [
    "En este sentido",
    "Desde el punto de vista teórico",
    "A nivel universitario",
    "En la literatura especializada",
    "Una cuestión central",
    "De forma complementaria",
    "A diferencia de enfoques reduccionistas",
    "Esto permite observar que",
    "En consecuencia",
    "De manera articulada",
    "A la luz de los debates actuales",
    "En el marco de esta discusión"
  ];
  let idx = 0;
  return () => {
    const val = conectores[idx % conectores.length];
    idx += 1;
    return val;
  };
}

function expandirParrafos(parrafos, tema, problema, conceptos, minParrafos) {
  const next = selectorConectores();
  const extras = [
    construirParrafo(
      `${next()}, la consistencia conceptual del marco se fortalece cuando se delimitan variables y se explicita el alcance del estudio.`,
      `En el caso de **${tema}**, ello implica precisar qué dimensiones del aprendizaje se examinan y cómo se vinculan con ${conceptos.toLowerCase()}.`
    ),
    construirParrafo(
      `${next()}, la discusión teórica no debe limitarse a describir tecnologías, sino a explicar cómo se transforman las prácticas educativas.`,
      `Esta perspectiva es crucial para abordar ${problema.toLowerCase()} con criterios de rigor académico.`
    ),
    construirParrafo(
      `${next()}, la relación entre teoría y evidencia se sostiene mediante el análisis crítico de supuestos pedagógicos y decisiones de diseño.`,
      `Así, el marco teórico aporta criterios para interpretar resultados y formular conclusiones sólidas.`
    )
  ];
  while (parrafos.length < minParrafos) {
    parrafos.push(extras[parrafos.length % extras.length]);
  }
  return parrafos;
}

function asegurarLongitud(texto, tema, problema, conceptos) {
  let words = contarPalabras(texto);
  if (words >= 1800) return texto;
  const next = selectorConectores();
  const refuerzo = [
    construirParrafo(
      `${next()}, los debates sobre automatización educativa insisten en distinguir entre apoyo didáctico y sustitución de la intervención humana.`,
      `Esta distinción resulta pertinente para interpretar los alcances de **${tema}** y su impacto en la autonomía del estudiante.`
    ),
    construirParrafo(
      `${next()}, la transformación digital en educación superior reconfigura los procesos de evaluación al introducir retroalimentación basada en datos.`,
      `Ello demanda revisar criterios de validez, confiabilidad y equidad, especialmente frente a ${problema.toLowerCase()}.`
    ),
    construirParrafo(
      `${next()}, los conceptos de ${conceptos.toLowerCase()} deben ser operacionalizados de manera coherente con los objetivos del estudio.`,
      `Esta operacionalización evita interpretaciones vagas y fortalece la consistencia del marco teórico.`
    ),
    construirParrafo(
      `${next()}, el análisis crítico requiere reconocer las limitaciones de los modelos predictivos y sus implicaciones éticas.`,
      `De este modo se integran consideraciones metodológicas y normativas en el marco conceptual.`
    )
  ];
  let extraTexto = "";
  let i = 0;
  while (words < 1800 && i < refuerzo.length * 3) {
    extraTexto += `${refuerzo[i % refuerzo.length]}\n\n`;
    words = contarPalabras(texto + "\n\n" + extraTexto);
    i += 1;
  }
  return texto + "\n\n" + extraTexto;
}

function generarMarcoTeorico(referencias) {
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

  const next = selectorConectores();
  let texto = "## Marco Teórico\n\n";
  texto += construirParrafo(
    `${next()}, este capítulo establece los fundamentos conceptuales del estudio y delimita los enfoques que orientan su interpretación.`,
    `Se parte del problema de investigación formulado como ${problema.toLowerCase()}, con el propósito de relacionarlo con **${tema}** y con los conceptos que estructuran el análisis.`
  ) + "\n\n";

  const introMarco = expandirParrafos([
    construirParrafo(
      `${next()}, el marco teórico cumple la función de organizar el conocimiento existente, identificar vacíos y sustentar la pertinencia de la investigación.`,
      `En el ámbito universitario, esta tarea implica considerar la transformación digital y el papel creciente de la inteligencia artificial en los procesos formativos.`
    ),
    construirParrafo(
      `${next()}, la coherencia del capítulo se apoya en la articulación entre teoría educativa, innovación tecnológica y necesidades institucionales.`,
      `Esta articulación permite comprender el alcance de **${tema}** y justifica el enfoque adoptado para abordar ${problema.toLowerCase()}.`
    ),
    construirParrafo(
      `${next()}, además, el marco teórico define categorías analíticas que guían la construcción de instrumentos y la interpretación de resultados.`,
      `Por ello, se enfatiza la consistencia entre conceptos, supuestos pedagógicos y criterios de evaluación del aprendizaje.`
    )
  ], tema, problema, conceptos, 3);

  const antecedentes = expandirParrafos([
    construirParrafo(
      `${next()}, la evolución de la inteligencia artificial en educación puede comprenderse como parte de una trayectoria mayor de automatización y digitalización.`,
      `Durante las últimas décadas, las universidades han incorporado plataformas de gestión del aprendizaje y sistemas de apoyo que transformaron el acceso a contenidos y la comunicación académica.`
    ),
    construirParrafo(
      `${next()}, el desarrollo de la analítica de aprendizaje y de la minería de datos educativos impulsó una lectura más fina del comportamiento estudiantil.`,
      `En consecuencia, la IA comenzó a utilizarse para anticipar riesgos de deserción, personalizar actividades y optimizar la retroalimentación.`
    ),
    construirParrafo(
      `${next()}, en la actualidad, la aparición de modelos de lenguaje y tutores inteligentes ha ampliado el repertorio de herramientas disponibles.`,
      `Esta transición no solo modifica las prácticas docentes, sino que también reconfigura el rol del estudiante como agente activo en su propio aprendizaje.`
    ),
    construirParrafo(
      `${next()}, a futuro, la convergencia entre inteligencia artificial, educación digital y políticas institucionales sugiere escenarios de mayor personalización.`,
      `No obstante, persisten desafíos de gobernanza, ética y equidad que requieren un análisis crítico en el marco de **${tema}**.`
    )
  ], tema, problema, conceptos, 3);

  const fundamentos = expandirParrafos([
    construirParrafo(
      `${next()}, la inteligencia artificial puede definirse como el conjunto de técnicas orientadas a simular procesos de razonamiento, aprendizaje y toma de decisiones.`,
      `En educación superior, su aplicación se traduce en sistemas capaces de analizar patrones de estudio, recomendar actividades y ofrecer retroalimentación personalizada.`
    ),
    construirParrafo(
      `${next()}, el aprendizaje adaptativo se entiende como un enfoque que ajusta contenidos, ritmos y estrategias en función de la trayectoria individual.`,
      `Este principio se apoya en modelos de datos que permiten identificar fortalezas y dificultades, y en consecuencia modificar la experiencia educativa.`
    ),
    construirParrafo(
      `${next()}, la educación digital comprende el conjunto de prácticas, plataformas y recursos que trasladan o complementan el aula física.`,
      `Su alcance va más allá de la virtualización, pues incorpora dinámicas de colaboración, evaluación continua y acceso flexible al conocimiento.`
    ),
    construirParrafo(
      `${next()}, la automatización educativa alude a la delegación de tareas repetitivas o analíticas a sistemas inteligentes.`,
      `Este proceso puede optimizar tiempos y decisiones, pero requiere criterios claros para evitar la pérdida de agencia pedagógica y la sobredependencia tecnológica.`
    )
  ], tema, problema, conceptos, 3);

  const modelos = expandirParrafos([
    construirParrafo(
      `${next()}, el constructivismo sostiene que el aprendizaje es una construcción activa de significados basada en la interacción con el entorno.`,
      `En el ámbito de la IA, este enfoque sugiere diseñar sistemas que promuevan exploración, reflexión y resolución de problemas auténticos.`
    ),
    construirParrafo(
      `${next()}, el conductismo, en contraste, enfatiza la relación entre estímulos, respuestas y refuerzos.`,
      `Su influencia se observa en sistemas que aplican retroalimentación inmediata y mecanismos de refuerzo para consolidar habilidades específicas.`
    ),
    construirParrafo(
      `${next()}, el cognitivismo aporta una mirada sobre los procesos internos de procesamiento de información, memoria y metacognición.`,
      `Desde esta perspectiva, la IA puede facilitar estrategias de autorregulación al proporcionar rutas de estudio personalizadas.`
    ),
    construirParrafo(
      `${next()}, el aprendizaje adaptativo integra elementos de estos modelos al convertirlos en reglas de ajuste dinámico.`,
      `Así, se conecta el soporte tecnológico con principios pedagógicos que aseguran coherencia entre objetivos, contenidos y evaluación.`
    )
  ], tema, problema, conceptos, 3);

  const recientes = expandirParrafos([
    construirParrafo(
      `${next()}, las investigaciones recientes sobre IA en educación superior destacan su uso para apoyar la permanencia estudiantil y la mejora del rendimiento.`,
      `En la literatura especializada se describen sistemas que identifican patrones de riesgo, proponen tutorías personalizadas y optimizan la gestión académica.`
    ),
    construirParrafo(
      `${next()}, también se observan tendencias hacia la automatización de procesos administrativos y de evaluación, con el objetivo de liberar tiempo docente.`,
      `Sin embargo, estos avances conllevan debates sobre transparencia, sesgos algorítmicos y responsabilidad institucional.`
    ),
    construirParrafo(
      `${next()}, la discusión ética se centra en el uso de datos, la privacidad y la toma de decisiones automatizada.`,
      `En este marco, el estudio de **${tema}** exige considerar no solo beneficios, sino también limitaciones y riesgos potenciales.`
    ),
    construirParrafo(
      `${next()}, cuando las referencias disponibles son parciales, el análisis académico se apoya en síntesis teóricas plausibles que mantienen coherencia conceptual.`,
      `Este enfoque permite construir una narrativa sólida sin recurrir a citas fragmentarias o incompletas.`
    )
  ], tema, problema, conceptos, 3);

  const comparacion = expandirParrafos([
    construirParrafo(
      `${next()}, la enseñanza tradicional se caracteriza por estructuras curriculares rígidas y evaluaciones estandarizadas.`,
      `En contraste, la enseñanza apoyada por IA incorpora rutas flexibles, retroalimentación personalizada y seguimiento continuo del desempeño.`
    ),
    construirParrafo(
      `${next()}, los roles de docentes y estudiantes también se transforman: el docente se convierte en diseñador de experiencias y mediador crítico,`,
      `mientras que el estudiante asume un papel más autónomo en la gestión de su aprendizaje.`
    ),
    construirParrafo(
      `${next()}, a diferencia de modelos tradicionales, los entornos con IA permiten evaluar procesos y no solo resultados finales.`,
      `No obstante, los riesgos incluyen la dependencia tecnológica, la pérdida de criterio pedagógico y la posibilidad de reproducir inequidades.`
    )
  ], tema, problema, conceptos, 3);

  const sintesis = expandirParrafos([
    construirParrafo(
      `${next()}, la síntesis teórica integra antecedentes, fundamentos y tendencias recientes para construir un marco explicativo coherente.`,
      `Esta integración permite interpretar ${problema.toLowerCase()} desde una perspectiva que combina teoría pedagógica y capacidades tecnológicas.`
    ),
    construirParrafo(
      `${next()}, el marco conceptual resultante sustenta la pertinencia del estudio y orienta la elección de variables e indicadores.`,
      `De este modo, se fortalece la relación entre **${tema}** y los objetivos de investigación, asegurando consistencia metodológica.`
    ),
    construirParrafo(
      `${next()}, finalmente, el marco teórico ofrece criterios para evaluar el impacto de la IA en la educación superior,`,
      `considerando tanto sus aportes a la personalización del aprendizaje como los desafíos que introduce en términos de ética y gobernanza.`
    )
  ], tema, problema, conceptos, 3);

  texto += generarSeccion("1. Introducción del marco teórico", introMarco);
  texto += generarSeccion("2. Antecedentes de la inteligencia artificial en educación", antecedentes);
  texto += generarSeccion("3. Fundamentos conceptuales", fundamentos);
  texto += generarSeccion("4. Enfoques y modelos teóricos", modelos);
  texto += generarSeccion("5. Investigaciones recientes sobre IA en educación superior", recientes);
  texto += generarSeccion("6. Comparación crítica entre enseñanza tradicional y enseñanza apoyada por IA", comparacion);
  texto += generarSeccion("7. Síntesis teórica del estudio", sintesis);

  if (referenciasNarrativas.length) {
    texto += "### Integración de referencias\n\n";
    texto += referenciasNarrativas.join("\n\n") + "\n\n";
  }

  texto = asegurarLongitud(texto, tema, problema, conceptos);

  const palabrasFinal = contarPalabras(texto);
  if (palabrasFinal < 1800) {
    texto = asegurarLongitud(texto, tema, problema, conceptos);
  }

  return texto;
}
