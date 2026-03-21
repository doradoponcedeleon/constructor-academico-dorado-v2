function exportarHTMLPlataforma() {
  const state = window.CADState || {};
  const meta = state.metadata || {};
  const referencias = state.referencias || [];
  const figuras = state.figuras || [];
  const tablas = state.tablas || [];
  const contenido = window.obtenerDocumentoFinalPlataforma
    ? window.obtenerDocumentoFinalPlataforma()
    : (localStorage.getItem("documento_editor") || localStorage.getItem("documento_base") || "");

  const seccionesHTML = contenido
    ? `<section><h2>Documento</h2><pre>${contenido.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></section>`
    : "";

  const referenciasHTML = referencias.length
    ? `<h2>Referencias</h2><ul>${referencias.map((r) => `
        <li>${r.autor || "Autor"} (${r.anio || "s.f."}). ${r.titulo || "Título"}. ${r.fuente || "Fuente"}.</li>
      `).join("")}</ul>`
    : "";

  const figurasHTML = figuras.length
    ? `<h2>Figuras</h2>${figuras.map((f, i) => `
        <figure>
          ${f.imagen ? `<img src="${f.imagen}" alt="Figura ${i + 1}" style="max-width:100%;border-radius:8px;" />` : ""}
          <figcaption>Figura ${i + 1}. ${f.titulo || ""} ${f.descripcion ? `- ${f.descripcion}` : ""} ${f.fuente ? `(${f.fuente})` : ""}</figcaption>
        </figure>
      `).join("")}`
    : "";

  const tablasHTML = tablas.length
    ? `<h2>Tablas</h2>${tablas.map((t, i) => `
        <div>
          <h3>Tabla ${i + 1}. ${t.titulo || "Tabla"}</h3>
          <p>${t.descripcion || ""}</p>
          <table border="1" cellpadding="6" cellspacing="0">
            ${(t.datos || []).map((row) => `<tr>${row.map((cell) => `<td>${cell || ""}</td>`).join("")}</tr>`).join("")}
          </table>
        </div>
      `).join("")}`
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${meta.titulo || "Documento académico"}</title>
      <style>
        body{font-family:Arial, sans-serif; margin:40px; color:#111;}
        h1{margin-bottom:0;}
        .meta{color:#555; margin-bottom:24px;}
        section{margin-bottom:24px;}
        figure{margin:16px 0;}
        figcaption{font-size:14px; color:#555;}
        table{width:100%; border-collapse:collapse; margin:12px 0;}
        td,th{border:1px solid #ccc;}
      </style>
    </head>
    <body>
      <h1>${meta.titulo || "Documento académico"}</h1>
      <div class="meta">Autor: ${meta.autor || "—"} | Área: ${meta.area || "—"} | Tipo: ${meta.tipo || "—"}</div>
      ${seccionesHTML}
      ${figurasHTML}
      ${tablasHTML}
      ${referenciasHTML}
    </body>
    </html>
  `;

  if (window.CADCore?.utils?.descargarArchivo) {
    CADCore.utils.descargarArchivo("constructor-academico-dorado.html", html, "text/html");
    return;
  }
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "constructor-academico-dorado.html";
  link.click();
  URL.revokeObjectURL(url);
}
