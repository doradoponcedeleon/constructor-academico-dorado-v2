function exportarTXTPlataforma() {
  const state = window.CADState || {};
  const meta = state.metadata || {};
  const secciones = state.editor?.secciones || [];
  const referencias = state.referencias || [];
  const figuras = state.figuras || [];
  const tablas = state.tablas || [];

  const lines = [];
  lines.push(`=== DOCUMENTO ACADEMICO ===`);
  lines.push(`Título: ${meta.titulo || "-"}`);
  lines.push(`Autor: ${meta.autor || "-"}`);
  lines.push(`Área: ${meta.area || "-"}`);
  lines.push(`Tipo: ${meta.tipo || "-"}`);
  lines.push("");

  lines.push("=== SECCIONES ===");
  if (!secciones.length) {
    lines.push("No hay secciones.");
  } else {
    secciones.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.titulo || "Sección"}`);
      lines.push(s.contenido || "");
      lines.push("");
    });
  }

  lines.push("=== FIGURAS ===");
  if (!figuras.length) {
    lines.push("No hay figuras.");
  } else {
    figuras.forEach((f, i) => {
      lines.push(`Figura ${i + 1}: ${f.titulo || ""}`);
      if (f.descripcion) lines.push(`Descripción: ${f.descripcion}`);
      if (f.fuente) lines.push(`Fuente: ${f.fuente}`);
      lines.push("");
    });
  }

  lines.push("=== TABLAS ===");
  if (!tablas.length) {
    lines.push("No hay tablas.");
  } else {
    tablas.forEach((t, i) => {
      lines.push(`Tabla ${i + 1}: ${t.titulo || ""}`);
      if (t.descripcion) lines.push(`Descripción: ${t.descripcion}`);
      if (Array.isArray(t.datos)) {
        t.datos.forEach((row) => lines.push(row.join(" | ")));
      }
      lines.push("");
    });
  }

  lines.push("=== REFERENCIAS ===");
  if (!referencias.length) {
    lines.push("No hay referencias.");
  } else {
    referencias.forEach((r, i) => {
      lines.push(`${i + 1}. ${r.autor || "Autor"} (${r.anio || "s.f."}). ${r.titulo || "Título"}. ${r.fuente || "Fuente"}.`);
    });
  }

  const text = lines.join("\n");
  if (window.CADCore?.utils?.descargarArchivo) {
    CADCore.utils.descargarArchivo("constructor-academico-dorado.txt", text, "text/plain");
    return;
  }
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "constructor-academico-dorado.txt";
  link.click();
  URL.revokeObjectURL(url);
}
