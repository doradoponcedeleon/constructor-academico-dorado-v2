const PROMPTS_BASE = {
  introduccion: (tema) => `Este documento aborda el tema ${tema || "principal"} desde una perspectiva académica y estructurada.`,
  problema: (problema) => problema ? `El problema central se define como: ${problema}.` : "El problema central requiere precisión y delimitación académica.",
  objetivos: (objetivos) => objetivos ? `Los objetivos planteados son: ${objetivos}.` : "Definir objetivos claros y medibles para guiar la investigación.",
  justificacion: (tema) => `La relevancia del estudio se sostiene en la necesidad de comprender ${tema || "el fenómeno"} y sus implicaciones.",
  marco: (conceptos) => `Se analizarán los conceptos clave: ${conceptos || "conceptos fundamentales"}, para sustentar la base teórica.",
  metodologia: () => "Se empleará una metodología adecuada al tipo de estudio, con fases ordenadas y criterios de validación.",
  resultados: (tema) => `Se espera obtener resultados que clarifiquen el problema y aporten evidencia sobre ${tema || "el tema"}.",
  conclusiones: () => "Las conclusiones resumirán los hallazgos y propondrán líneas futuras de análisis."
};
