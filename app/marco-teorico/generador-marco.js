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

function buildParagraph(context, indice) {
  const { tema, problema, conceptos, seccion } = context;
  const problemaClave = "el uso inadecuado de IA, la dependencia y la pérdida de pensamiento crítico";
  const ejemplos = [
    "por ejemplo, un estudiante que utiliza ChatGPT solo para copiar respuestas sin analizar fuentes",
    "en plataformas de aprendizaje adaptativo que ajustan ejercicios pero no explican el razonamiento",
    "cuando la evaluación automatizada se usa sin revisión crítica del proceso de aprendizaje",
    "en cursos universitarios donde los estudiantes delegan la argumentación a la IA"
  ];
  const ejemplo = ejemplos[indice % ejemplos.length];
  const v = indice % 3;

  if (seccion === "introduccion") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `El marco teórico de **${tema}** define el conjunto de categorías que permiten interpretar el fenómeno de estudio.`,
        explicacion: `No se limita a enumerar conceptos, sino que explica cómo operan y por qué son pertinentes en educación superior.`,
        aplicacion: `En universidades, la IA interviene en plataformas, tutorías y evaluación, configurando nuevas formas de estudiar.`,
        ejemplo: `Esto se observa ${ejemplo}.`,
        conexion: `Por ello, el análisis se vincula con ${problema.toLowerCase()} y con ${problemaClave}.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `La introducción del marco teórico sitúa **${tema}** dentro de un campo de discusión pedagógica y tecnológica.`,
        explicacion: `Su propósito es explicar por qué la IA modifica la manera en que se aprende y se evalúa en educación superior.`,
        aplicacion: `En el ámbito universitario, esto implica revisar cómo se usan herramientas como ChatGPT y sistemas adaptativos.`,
        ejemplo: `Se evidencia ${ejemplo}.`,
        conexion: `Estas prácticas hacen visible ${problemaClave} y el riesgo de uso superficial.`
      });
    }
    return construirParrafoAcademico({
      idea: `Este capítulo establece la relación entre teoría educativa y transformación digital en universidades.`,
      explicacion: `La teoría define criterios para distinguir aprendizaje profundo de respuestas automáticas.`,
      aplicacion: `En educación superior, esa distinción se aplica a tareas, evaluaciones y uso de plataformas inteligentes.`,
      ejemplo: `Un caso ilustrativo aparece ${ejemplo}.`,
      conexion: `Así se conecta el marco con ${problema.toLowerCase()} y con ${problemaClave}.`
    });
  }

  if (seccion === "antecedentes") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `La IA en educación surge con la transformación digital y la necesidad de ampliar el acceso al conocimiento universitario.`,
        explicacion: `La evolución va desde repositorios digitales a modelos que analizan datos de aprendizaje.`,
        aplicacion: `En educación superior, esto habilita personalización, alertas tempranas y automatización de feedback.`,
        ejemplo: `Un caso típico ocurre ${ejemplo}.`,
        conexion: `Esto revela ${problemaClave} cuando el uso se vuelve superficial.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `Los antecedentes muestran un tránsito desde plataformas administrativas hacia sistemas capaces de interpretar trayectorias de estudio.`,
        explicacion: `Este tránsito fue impulsado por la disponibilidad de datos y por la demanda de seguimiento académico.`,
        aplicacion: `En universidades, la IA comenzó a orientar tutorías y a anticipar riesgos de bajo rendimiento.`,
        ejemplo: `Se aprecia ${ejemplo}.`,
        conexion: `Sin acompañamiento pedagógico, estas herramientas pueden reforzar ${problemaClave}.`
      });
    }
    return construirParrafoAcademico({
      idea: `La expansión de herramientas generativas marcó una fase reciente en la historia de la IA educativa.`,
      explicacion: `La posibilidad de producir textos y respuestas rápidas modificó prácticas de estudio y evaluación.`,
      aplicacion: `En educación superior, esto obliga a redefinir criterios de autoría y de aprendizaje significativo.`,
      ejemplo: `Esto ocurre ${ejemplo}.`,
      conexion: `De ahí que ${problema.toLowerCase()} sea un problema central en universidades.`
    });
  }

  if (seccion === "fundamentos") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `La inteligencia artificial aprende patrones a partir de datos y genera respuestas con base en modelos entrenados.`,
        explicacion: `Su funcionamiento se apoya en algoritmos que ajustan parámetros para reconocer regularidades.`,
        aplicacion: `En universidades, esto se usa para recomendar recursos, evaluar actividades y apoyar tutorías.`,
        ejemplo: `Se aprecia ${ejemplo}.`,
        conexion: `Si el uso se limita a copiar respuestas, ${problemaClave} se intensifica.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `El aprendizaje adaptativo se fundamenta en la lectura continua del desempeño del estudiante.`,
        explicacion: `La IA interpreta errores y aciertos para ajustar contenidos y ritmos.`,
        aplicacion: `En educación superior, esto puede mejorar resultados si el estudiante participa activamente en la ruta propuesta.`,
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Cuando se usa como atajo, el adaptativo pierde sentido y se amplifica ${problemaClave}.`
      });
    }
    return construirParrafoAcademico({
      idea: `La educación digital integra plataformas, interacción en línea y evaluación continua.`,
      explicacion: `No equivale a simple virtualización; implica reconfigurar la relación con el conocimiento.`,
      aplicacion: `En universidades, conviven aulas presenciales con recursos digitales inteligentes.`,
      ejemplo: `Esto ocurre ${ejemplo}.`,
      conexion: `Si el estudiante delega el razonamiento a la IA, ${problemaClave} se vuelve más visible.`
    });
  }

  if (seccion === "modelos") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `Los modelos del aprendizaje orientan cómo debe usarse la IA para fomentar comprensión y no solo resultados.`,
        explicacion: `Constructivismo, conductismo y cognitivismo aportan criterios distintos sobre el proceso educativo.`,
        aplicacion: `En universidades, estos enfoques guían el diseño de sistemas adaptativos y de evaluación.`,
        ejemplo: `Esto se ve ${ejemplo}.`,
        conexion: `La falta de alineación con estos modelos favorece ${problemaClave}.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `Desde el constructivismo, la IA debe promover exploración y reflexión, no respuestas cerradas.`,
        explicacion: `El aprendizaje se construye cuando el estudiante confronta ideas y reorganiza significados.`,
        aplicacion: `En universidades, esto exige que las herramientas inteligentes estimulen análisis crítico.`,
        ejemplo: `Si el estudiante usa ChatGPT sin contrastar fuentes, pierde la construcción activa del conocimiento.`,
        conexion: `Esa pérdida refuerza ${problemaClave}.`
      });
    }
    return construirParrafoAcademico({
      idea: `El conductismo y el cognitivismo ofrecen marcos complementarios para entender la retroalimentación automatizada.`,
      explicacion: `Mientras el primero enfatiza el refuerzo, el segundo prioriza procesos internos y metacognición.`,
      aplicacion: `En educación superior, la IA debe equilibrar feedback inmediato con reflexión sobre el razonamiento.`,
      ejemplo: `Esto se aprecia ${ejemplo}.`,
      conexion: `Si no se equilibra, se normaliza ${problemaClave}.`
    });
  }

  if (seccion === "investigaciones") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `Las investigaciones recientes describen usos de IA para personalizar aprendizaje y automatizar evaluación en universidades.`,
        explicacion: `Los estudios reportan mejoras, pero también alertan sobre dependencia y sesgos.`,
        aplicacion: `En educación superior, estos hallazgos orientan políticas de uso responsable.`,
        ejemplo: `Una evidencia cotidiana ocurre ${ejemplo}.`,
        conexion: `Estos resultados refuerzan ${problemaClave} como desafío vigente.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `La literatura sobre IA educativa destaca avances en analítica del aprendizaje y seguimiento continuo.`,
        explicacion: `Estos enfoques permiten intervenir antes de que aparezcan fallas de rendimiento.`,
        aplicacion: `En universidades, esto se traduce en tutorías y acompañamientos personalizados.`,
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Sin embargo, si el estudiante solo copia respuestas, ${problemaClave} persiste.`
      });
    }
    return construirParrafoAcademico({
      idea: `Los estudios también discuten riesgos éticos y dependencia tecnológica en contextos universitarios.`,
      explicacion: `El uso intensivo de IA puede debilitar autonomía si no se regula.`,
      aplicacion: `En educación superior, esto exige criterios de evaluación que premien razonamiento y no solo resultados.`,
      ejemplo: `Esto se evidencia ${ejemplo}.`,
      conexion: `Estos riesgos se vinculan con ${problemaClave} y con ${problema.toLowerCase()}.`
    });
  }

  if (seccion === "comparacion") {
    if (v == 0) {
      return construirParrafoAcademico({
        idea: `La enseñanza tradicional enfatiza contenidos y evaluación final; la IA introduce seguimiento continuo y personalización.`,
        explicacion: `Esto transforma roles, pero también puede desplazar el razonamiento si no se regula.`,
        aplicacion: `En universidades, la IA debe ser apoyo crítico y no sustituto del aprendizaje.`,
        ejemplo: `Esto se evidencia ${ejemplo}.`,
        conexion: `Sin regulación, ${problemaClave} se profundiza.`
      });
    }
    if (v == 1) {
      return construirParrafoAcademico({
        idea: `La comparación entre enfoques muestra que la IA puede acelerar procesos, pero no garantiza comprensión.`,
        explicacion: `La enseñanza tradicional suele exigir argumentación propia, mientras que la IA facilita respuestas inmediatas.`,
        aplicacion: `En universidades, esto obliga a rediseñar evaluación y seguimiento del aprendizaje.`,
        ejemplo: `Se observa ${ejemplo}.`,
        conexion: `Si no se controla, ${problemaClave} se vuelve estructural.`
      });
    }
    return construirParrafoAcademico({
      idea: `El rol del docente cambia: de transmisor a mediador crítico de herramientas inteligentes.`,
      explicacion: `La IA puede apoyar, pero sin orientación puede reducir el pensamiento crítico.`,
      aplicacion: `En educación superior, esto implica formación docente y reglas claras de uso.`,
      ejemplo: `Esto se evidencia ${ejemplo}.`,
      conexion: `Sin esa mediación, ${problemaClave} se incrementa.`
    });
  }

  return construirParrafoAcademico({
    idea: `La síntesis teórica integra antecedentes, conceptos y modelos para explicar el uso de IA en universidades.`,
    explicacion: `Este marco permite evaluar impacto, límites y riesgos en la formación.`,
    aplicacion: `En educación superior, se traduce en criterios para medir autonomía y pensamiento crítico.`,
    ejemplo: `Esto se hace visible ${ejemplo}.`,
    conexion: `Así se conecta con ${problema.toLowerCase()} y con ${problemaClave}.`
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
