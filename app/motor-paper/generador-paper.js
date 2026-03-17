function generarPaperAcademico(data) {
  const titulo = data.titulo || "Título del trabajo";
  const problema = data.problema || "";
  const ideas = data.ideas || "";
  const conceptos = data.conceptos || "";
  const objetivos = data.objetivos || "";
  const autores = data.autores || "";
  const area = data.area || "";

  const resumen = ideas ? `Resumen basado en: ${ideas}` : "Resumen del trabajo.";
  const introduccion = problema || "Introducción del tema.";
  const marco = conceptos || "Marco teórico inicial.";
  const metodologia = objetivos || "Metodología propuesta.";
  const resultados = "Resultados preliminares.";
  const discusion = "Discusión de hallazgos.";
  const conclusiones = problema ? `Conclusiones sobre: ${problema}` : "Conclusiones generales.";
  const referencias = "Referencias iniciales.";

  return `# ${titulo}
${autores ? `\n**Autores:** ${autores}\n` : ""}${area ? `**Área académica:** ${area}\n` : ""}

## Resumen
${resumen}

## Introducción
${introduccion}

## Marco teórico
${marco}

## Metodología
${metodologia}

## Resultados
${resultados}

## Discusión
${discusion}

## Conclusiones
${conclusiones}

## Referencias
${referencias}
`;
}

function generarPaperAutomatico(data) {
  const tema = (data && data.tema) ? data.tema : "Tema académico";
  const titulo = data.titulo || `Análisis académico de ${tema}`;
  const resumen = data.resumen
    || (data.ideas ? `Este trabajo aborda ${tema} a partir de las ideas: ${data.ideas}.` : `Este trabajo analiza ${tema} y sus implicaciones principales.`);
  const introduccion = data.introduccion
    || (data.problema ? data.problema : `Se presenta una aproximación inicial al tema ${tema}, delimitando su contexto y relevancia.`);
  const problema = data.problema || `Se identifica el problema central asociado a ${tema} y sus desafíos más relevantes.`;
  const objetivos = data.objetivos || `Objetivo general: explicar y analizar ${tema} a partir de fuentes académicas y observaciones clave.`;
  const marco = data.marco || data.conceptos || `Se revisan fundamentos teóricos vinculados a ${tema} y a los conceptos principales del área.`;
  const metodologia = data.metodologia || `Se propone una metodología documental y descriptiva para estudiar ${tema}.`;
  const resultados = data.resultados || `Se esperan resultados que clarifiquen las relaciones entre ${tema} y sus variables centrales.`;
  const conclusiones = data.conclusiones || `Se concluye que ${tema} requiere un enfoque sistemático para su comprensión y aplicación.`;
  const bibliografia = data.bibliografia || "Referencias iniciales.";

  const markdown = `# ${titulo}

## Resumen
${resumen}

## Introducción
${introduccion}

## Problema
${problema}

## Objetivos
${objetivos}

## Marco teórico
${marco}

## Metodología
${metodologia}

## Resultados esperados
${resultados}

## Conclusiones
${conclusiones}

## Bibliografía
${bibliografia}
`;

  const secciones = [
    { titulo: "Resumen", contenido: resumen },
    { titulo: "Introducción", contenido: introduccion },
    { titulo: "Problema", contenido: problema },
    { titulo: "Objetivos", contenido: objetivos },
    { titulo: "Marco teórico", contenido: marco },
    { titulo: "Metodología", contenido: metodologia },
    { titulo: "Resultados esperados", contenido: resultados },
    { titulo: "Conclusiones", contenido: conclusiones },
    { titulo: "Bibliografía", contenido: bibliografia }
  ];

  return { titulo, markdown, secciones };
}
