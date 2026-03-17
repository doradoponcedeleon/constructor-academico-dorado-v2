function generarTesisAcademica(data) {
  const titulo = data.titulo || "Título de tesis";
  const autor = data.autor || "";
  const carrera = data.carrera || "";
  const universidad = data.universidad || "";
  const linea = data.linea || "";

  const resumen = data.resumen || "Resumen de la tesis.";
  const introduccion = data.introduccion || "Introducción de la tesis.";
  const problema = data.problema || "Planteamiento del problema.";
  const justificacion = data.justificacion || "Justificación del trabajo.";
  const objetivos = data.objetivos || "Objetivos del estudio.";
  const marco = data.marco || "Marco teórico.";
  const metodologia = data.metodologia || "Metodología.";
  const resultados = data.resultados || "Resultados esperados.";
  const discusion = data.discusion || "Discusión.";
  const conclusiones = data.conclusiones || "Conclusiones.";
  const recomendaciones = data.recomendaciones || "Recomendaciones.";
  const referencias = data.referencias || "Referencias.";
  const anexos = data.anexos || "Anexos.";

  return `# ${titulo}
${autor ? `\n**Autor:** ${autor}\n` : ""}${carrera ? `**Carrera / Programa:** ${carrera}\n` : ""}${universidad ? `**Universidad:** ${universidad}\n` : ""}${linea ? `**Línea de investigación:** ${linea}\n` : ""}

## Resumen
${resumen}

## Introducción
${introduccion}

## Planteamiento del problema
${problema}

## Justificación
${justificacion}

## Objetivos
${objetivos}

## Marco teórico
${marco}

## Metodología
${metodologia}

## Resultados esperados
${resultados}

## Discusión
${discusion}

## Conclusiones
${conclusiones}

## Recomendaciones
${recomendaciones}

## Referencias
${referencias}

## Anexos
${anexos}
`;
}
