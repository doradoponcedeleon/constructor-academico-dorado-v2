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

function construirParrafoAcademico({ idea, explicacion, aplicacion, ejemplo, conexion }) {
  return [idea, explicacion, aplicacion, ejemplo, conexion].filter(Boolean).join(" ");
}

function validarParrafo(parrafo) {
  const reglas = [
    /universidad|universitario|educación superior/i,
    /IA|inteligencia artificial|ChatGPT|sistemas adaptativos|evaluación automatizada/i,
    /uso inadecuado|uso superficial|dependencia|pensamiento crítico/i
  ];
  return reglas.every((r) => r.test(parrafo));
}

function asegurarParrafoCalidad(parrafo, fallback) {
  if (validarParrafo(parrafo)) return parrafo;
  return fallback;
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
  const problemaTexto = datos.problema || "el uso inadecuado de IA por parte de estudiantes universitarios";
  const conceptos = datos.conceptos || "tecnología educativa, aprendizaje y evaluación";
  const problemaClave = "el uso inadecuado de IA, la dependencia y la pérdida de pensamiento crítico";

  const refsUsadas = refs.filter((r) => r.titulo || r.autores || r.resumen).slice(0, 6);
  const referenciasNarrativas = refsUsadas
    .map(construirReferenciaNarrativa)
    .filter((t) => t && !t.includes("Autor (s.f.)") && !t.includes("Resumen no disponible"));

  const next = selectorConectores();
  let texto = "## Marco Teórico\n\n";

  const introMarco = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, el capítulo establece el propósito del marco teórico y su vínculo directo con el problema de investigación.`,
      explicacion: `La función del marco no es solo describir conceptos, sino explicar cómo operan y por qué son pertinentes.`,
      aplicacion: `En educación superior, esto significa analizar cómo la IA interviene en la enseñanza, en la evaluación y en la autonomía del estudiante.`,
      ejemplo: `Por ejemplo, un estudiante puede usar ChatGPT para copiar respuestas y evitar el análisis, lo que distorsiona su aprendizaje.`,
      conexion: `Esta práctica se relaciona con ${problemaClave} y revela ${problemaTexto.toLowerCase()} como núcleo del estudio.`
    }), construirParrafoAcademico({
      idea: `${next()}, el marco teórico organiza el conocimiento disponible para sostener decisiones metodológicas.`,
      explicacion: `Si los conceptos están mal delimitados, el análisis se vuelve superficial y la investigación pierde rigor.`,
      aplicacion: `En el entorno universitario, esto afecta la forma en que se evalúan herramientas como plataformas adaptativas o sistemas de evaluación automatizada.`,
      ejemplo: `Un docente puede exigir uso crítico de IA, pero si el estudiante solo genera textos sin comprensión, el proceso se vacía.`,
      conexion: `Esto conecta con ${problemaClave} y muestra por qué el tema requiere un análisis profundo.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la coherencia del capítulo depende de vincular teoría pedagógica y tecnología educativa.`,
      explicacion: `El análisis teórico debe responder a cómo la IA transforma prácticas docentes y la relación con el conocimiento.`,
      aplicacion: `En universidades, esto se expresa en plataformas digitales, analítica de aprendizaje y recomendaciones automatizadas.`,
      ejemplo: `Si un sistema adaptativo sugiere actividades pero el estudiante solo busca atajos con IA, la formación crítica se debilita.`,
      conexion: `Este fenómeno es central en ${problemaClave} y justifica el enfoque del estudio.`
    }), construirParrafoAcademico({
      idea: `${next()}, el marco teórico define categorías que permiten evaluar el uso responsable de la IA.`,
      explicacion: `Estas categorías guían la selección de variables y la lectura de resultados académicos.`,
      aplicacion: `En educación superior, estas categorías permiten diferenciar entre apoyo legítimo y dependencia tecnológica.`,
      ejemplo: `Un estudiante que utiliza ChatGPT como apoyo para contrastar fuentes desarrolla criterio; uno que copia respuestas lo pierde.`,
      conexion: `Por ello, ${problemaTexto.toLowerCase()} se aborda como un problema de formación crítica.`
    }))
  ], tema, problemaTexto, conceptos, 3);

  const antecedentes = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la IA en educación surge de la transformación digital de la universidad.`,
      explicacion: `En las primeras etapas, la digitalización se centró en repositorios y plataformas, pero con el tiempo se incorporaron sistemas capaces de analizar datos de aprendizaje.`,
      aplicacion: `Esto permitió identificar patrones de desempeño, personalizar contenidos y automatizar retroalimentación.`,
      ejemplo: `Por ejemplo, un sistema puede detectar que un estudiante usa ChatGPT para resolver tareas sin revisar fuentes.`,
      conexion: `Este antecedente se conecta con ${problemaClave} al mostrar cómo la tecnología puede facilitar un uso superficial.`
    }), construirParrafoAcademico({
      idea: `${next()}, la analítica del aprendizaje y la minería de datos educativos consolidaron el uso de IA en universidades.`,
      explicacion: `Estos enfoques interpretan grandes volúmenes de datos para anticipar riesgos y recomendar estrategias.`,
      aplicacion: `En educación superior, se usan para tutorías personalizadas y seguimiento académico continuo.`,
      ejemplo: `Sin embargo, si el estudiante solo busca respuestas automáticas, la personalización puede perder sentido.`,
      conexion: `Esto evidencia ${problemaClave} y la necesidad de orientar la IA hacia aprendizajes significativos.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la aparición de modelos generativos amplió las posibilidades de producción académica.`,
      explicacion: `Estos modelos generan texto, resúmenes y explicaciones, lo que puede apoyar el estudio si se usa críticamente.`,
      aplicacion: `En universidades, se integran en actividades de escritura y análisis, pero también generan riesgos de copia.`,
      ejemplo: `Un estudiante que utiliza ChatGPT solo para entregar un ensayo sin análisis incurre en aprendizaje superficial.`,
      conexion: `Este riesgo es parte de ${problemaClave} y exige reflexión pedagógica.`
    }), construirParrafoAcademico({
      idea: `${next()}, a futuro, la IA educativa se orienta a sistemas explicables y regulados.`,
      explicacion: `El desafío es combinar innovación con marcos éticos y pedagógicos sólidos.`,
      aplicacion: `En el contexto universitario, esto requiere políticas sobre uso de IA en evaluación y formación.`,
      ejemplo: `Si la universidad no define criterios, el uso de ChatGPT se convierte en atajo en lugar de apoyo.`,
      conexion: `Por ello, ${problemaTexto.toLowerCase()} debe abordarse con criterios institucionales claros.`
    }))
  ], tema, problemaTexto, conceptos, 3);

  const fundamentos = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la inteligencia artificial es un conjunto de métodos que permiten aprender de datos y producir respuestas basadas en patrones.`,
      explicacion: `Su funcionamiento implica entrenamiento de modelos que ajustan parámetros según ejemplos, lo que permite generalizar a nuevas situaciones.`,
      aplicacion: `En universidades, esta capacidad se usa para recomendar recursos, analizar desempeño y automatizar feedback.`,
      ejemplo: `Un sistema puede sugerir lecturas a un estudiante, pero si este solo copia respuestas de ChatGPT, el aprendizaje pierde profundidad.`,
      conexion: `Esta situación refleja ${problemaClave} y plantea la necesidad de formar pensamiento crítico.`
    }), construirParrafoAcademico({
      idea: `${next()}, el aprendizaje adaptativo ajusta contenidos según la trayectoria individual.`,
      explicacion: `Se apoya en datos de desempeño y establece rutas diferenciadas para cada estudiante.`,
      aplicacion: `En educación superior, esto puede mejorar el rendimiento si el estudiante participa activamente en la ruta propuesta.`,
      ejemplo: `Si el estudiante usa IA para resolver tareas sin revisar los procesos, la adaptación se convierte en un mecanismo superficial.`,
      conexion: `Así se evidencia ${problemaClave} y el riesgo de dependencia tecnológica.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la educación digital integra plataformas, interacción en línea y evaluación continua.`,
      explicacion: `No se limita a virtualizar clases, sino que transforma la forma en que se construye el conocimiento.`,
      aplicacion: `En universidades, esto implica que el aprendizaje ocurre en espacios híbridos y con múltiples fuentes.`,
      ejemplo: `Un estudiante puede usar plataformas adaptativas y ChatGPT simultáneamente, pero si no contrasta información, el aprendizaje se debilita.`,
      conexion: `Esto conecta con ${problemaClave} al revelar un uso superficial de herramientas digitales.`
    }), construirParrafoAcademico({
      idea: `${next()}, la automatización educativa delega procesos a sistemas inteligentes.`,
      explicacion: `Incluye corrección automática, generación de informes y recomendaciones académicas.`,
      aplicacion: `En educación superior, puede liberar tiempo docente pero también reducir interacción pedagógica.`,
      ejemplo: `Si la evaluación se automatiza, el estudiante puede buscar atajos con IA para obtener calificaciones.`,
      conexion: `Este escenario se vincula con ${problemaClave} y la pérdida de pensamiento crítico.`
    }))
  ], tema, problemaTexto, conceptos, 3);

  const modelos = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, el constructivismo entiende el aprendizaje como construcción activa de significado.`,
      explicacion: `El estudiante interpreta información y la integra con experiencias previas.`,
      aplicacion: `En el uso de IA universitaria, este enfoque exige que las herramientas promuevan reflexión y no solo entrega de respuestas.`,
      ejemplo: `Si un estudiante usa ChatGPT para argumentar un ensayo, debe contrastar fuentes para construir significado.`,
      conexion: `Sin esta reflexión, ${problemaClave} se profundiza al reemplazar análisis por copia.`
    }), construirParrafoAcademico({
      idea: `${next()}, el conductismo enfatiza estímulos y refuerzos para consolidar aprendizajes.`,
      explicacion: `La IA puede aplicar esta lógica mediante feedback inmediato y recompensas digitales.`,
      aplicacion: `En universidades, esto puede fortalecer habilidades básicas, pero no garantiza pensamiento crítico.`,
      ejemplo: `Un estudiante puede completar ejercicios con IA sin comprender el razonamiento subyacente.`,
      conexion: `Esto ilustra ${problemaClave} al evidenciar uso superficial de herramientas.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, el cognitivismo se centra en procesos internos como memoria y metacognición.`,
      explicacion: `Aprender implica regular estrategias y comprender cómo se procesa la información.`,
      aplicacion: `La IA puede apoyar este enfoque si ofrece explicaciones y rutas de estudio personalizadas.`,
      ejemplo: `Si el estudiante usa un sistema adaptativo sin revisar su razonamiento, la metacognición se debilita.`,
      conexion: `De este modo, ${problemaClave} aparece como riesgo en el uso de IA.`
    }), construirParrafoAcademico({
      idea: `${next()}, el aprendizaje adaptativo integra elementos de estos modelos para ajustar la enseñanza.`,
      explicacion: `Combina datos de desempeño con criterios pedagógicos para personalizar rutas.`,
      aplicacion: `En universidades, esto permite atender diversidad de perfiles, pero exige autonomía del estudiante.`,
      ejemplo: `Cuando el estudiante depende de ChatGPT para resolver todo, la adaptación pierde sentido formativo.`,
      conexion: `Así, ${problemaTexto.toLowerCase()} se vincula directamente con el uso inadecuado de IA.`
    }))
  ], tema, problemaTexto, conceptos, 3);

  const recientes = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, investigaciones recientes muestran el uso de IA para predecir riesgos académicos en universidades.`,
      explicacion: `Los modelos analizan datos de interacción, calificaciones y asistencia.`,
      aplicacion: `Esto permite diseñar tutorías personalizadas y estrategias de apoyo.`,
      ejemplo: `Cuando se detecta que un estudiante usa IA para copiar respuestas, se pueden activar intervenciones.`,
      conexion: `Este enfoque responde a ${problemaClave} y busca fortalecer el pensamiento crítico.`
    }), construirParrafoAcademico({
      idea: `${next()}, se reportan avances en evaluación automatizada y generación de feedback.`,
      explicacion: `La IA puede analizar textos y sugerir mejoras, pero su uso requiere criterios de validación.`,
      aplicacion: `En educación superior, esto plantea dilemas sobre qué evaluar: el texto generado o el proceso de aprendizaje.`,
      ejemplo: `Si el estudiante usa ChatGPT para producir ensayos sin comprender, la evaluación pierde sentido formativo.`,
      conexion: `Esto evidencia ${problemaClave} como un desafío central.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la literatura especializada advierte riesgos éticos y de dependencia.`,
      explicacion: `Los sistemas pueden reproducir sesgos o incentivar atajos cognitivos.`,
      aplicacion: `En universidades, la dependencia de IA afecta la autonomía y el desarrollo de habilidades críticas.`,
      ejemplo: `Cuando los estudiantes se acostumbran a respuestas automáticas, disminuye la capacidad de análisis propio.`,
      conexion: `Este riesgo se relaciona directamente con ${problemaClave}.`
    }), construirParrafoAcademico({
      idea: `${next()}, incluso con referencias limitadas, es posible construir síntesis académicas coherentes.`,
      explicacion: `Estas síntesis conectan teorías y prácticas sin recurrir a citas fragmentarias.`,
      aplicacion: `En este estudio, ello permite analizar el uso de IA en universidades con rigor conceptual.`,
      ejemplo: `Así se explica por qué el uso superficial de ChatGPT afecta la calidad del aprendizaje.`,
      conexion: `Este enfoque sostiene el análisis de ${problemaTexto.toLowerCase()}.`
    }))
  ], tema, problemaTexto, conceptos, 3);

  const comparacion = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la enseñanza tradicional se centra en clases magistrales y evaluación de resultados finales.`,
      explicacion: `Este modelo prioriza la uniformidad, con poca flexibilidad para trayectorias individuales.`,
      aplicacion: `En contraste, la enseñanza apoyada por IA permite ajustar actividades y feedback en tiempo real.`,
      ejemplo: `Un estudiante puede recibir ejercicios adaptados, pero si solo copia respuestas de ChatGPT, el beneficio desaparece.`,
      conexion: `Esto muestra ${problemaClave} y la necesidad de regular el uso de IA.`
    }), construirParrafoAcademico({
      idea: `${next()}, el rol docente se desplaza hacia la mediación crítica.`,
      explicacion: `La IA puede automatizar tareas, pero no reemplaza el juicio pedagógico.`,
      aplicacion: `En universidades, el docente debe enseñar cómo usar IA para fortalecer el aprendizaje.`,
      ejemplo: `Si el docente no guía, el estudiante puede depender de la IA y reducir su pensamiento crítico.`,
      conexion: `Este escenario intensifica ${problemaClave}.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la evaluación tradicional mide productos finales, mientras que la IA permite evaluar procesos.`,
      explicacion: `Esto ofrece oportunidades para monitorear aprendizaje continuo.`,
      aplicacion: `En educación superior, se puede distinguir entre comprensión real y producción automática.`,
      ejemplo: `Si un ensayo fue generado por ChatGPT sin análisis, el sistema debe detectar esa superficialidad.`,
      conexion: `Así, ${problemaClave} se convierte en un criterio para evaluar efectividad de la IA.`
    }))
  ], tema, problemaTexto, conceptos, 3);

  const sintesis = expandirParrafos([
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la síntesis teórica integra antecedentes, fundamentos y enfoques recientes.`,
      explicacion: `Esta integración permite comprender la IA como mediador pedagógico, no como sustituto del aprendizaje.`,
      aplicacion: `En universidades, el marco teórico orienta cómo evaluar la calidad del aprendizaje frente al uso de IA.`,
      ejemplo: `Por ejemplo, se diferencia entre uso de ChatGPT como apoyo crítico y uso como atajo.`,
      conexion: `Esto conecta con ${problemaClave} y justifica el enfoque del estudio.`
    }), construirParrafoAcademico({
      idea: `${next()}, el marco teórico fundamenta el objetivo de investigación y la selección de variables.`,
      explicacion: `Sin este sustento, el análisis quedaría en afirmaciones generales y poco verificables.`,
      aplicacion: `En educación superior, esto se traduce en indicadores sobre autonomía, pensamiento crítico y calidad del aprendizaje.`,
      ejemplo: `Un estudiante que depende de IA para responder sin analizar muestra disminución de estas competencias.`,
      conexion: `Este punto reafirma ${problemaClave} como eje central del estudio.`
    })),
    asegurarParrafoCalidad(construirParrafoAcademico({
      idea: `${next()}, la reflexión final destaca la necesidad de un uso ético y pedagógico de la IA.`,
      explicacion: `La tecnología puede potenciar el aprendizaje solo si se integra con criterios de formación crítica.`,
      aplicacion: `En universidades, esto implica políticas de uso, formación docente y alfabetización digital estudiantil.`,
      ejemplo: `Orientar a estudiantes para que utilicen ChatGPT como apoyo y no como sustituto del razonamiento es clave.`,
      conexion: `De esta manera se aborda ${problemaTexto.toLowerCase()} y se reduce la dependencia tecnológica.`
    }))
  ], tema, problemaTexto, conceptos, 3);

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

  texto = asegurarLongitud(texto, tema, problemaTexto, conceptos);
  if (contarPalabras(texto) < 1800) {
    texto = asegurarLongitud(texto, tema, problemaTexto, conceptos);
  }

  return texto;
}
