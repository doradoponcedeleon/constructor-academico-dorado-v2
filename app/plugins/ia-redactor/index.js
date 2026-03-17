if (window.CADPlugins && typeof CADPlugins.registrar === "function") {
  CADPlugins.registrar("ia-redactor", {
    nombre: "IA Redactor",
    version: "1.0",
    descripcion: "Generador de texto académico base",
    run(contexto) {
      const tema = (contexto && contexto.tema) ? contexto.tema : "";
      return {
        titulo: "Estudio sobre " + tema,
        introduccion:
          "El presente trabajo analiza el tema de " + tema +
          " desde una perspectiva académica.",
        problema:
          "El problema central consiste en comprender las implicaciones de " + tema,
        objetivos:
          "Analizar las características principales de " + tema,
        conclusion:
          "El análisis realizado permite comprender la relevancia de " + tema
      };
    }
  });
}
