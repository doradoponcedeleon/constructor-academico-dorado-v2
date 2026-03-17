function analizarIdeasPlataforma() {
  return {
    tema: document.getElementById("miTema")?.value || "",
    problema: document.getElementById("miProblema")?.value || "",
    ideas: document.getElementById("miIdeas")?.value || "",
    conceptos: document.getElementById("miConceptos")?.value || "",
    objetivos: document.getElementById("miObjetivos")?.value || ""
  };
}
