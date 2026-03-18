function extraerBloqueMarkdown(texto, titulo) {
  const regex = new RegExp(`##\\s*${titulo}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*|$)`, "i");
  const match = (texto || "").match(regex);
  return match ? match[1].trim() : "";
}

function renderTesis() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Generador de Tesis</h2>
      <p>Genera una estructura completa de tesis.</p>
      <div class="bitacora-form">
        <input id="tesisTitulo" type="text" placeholder="Título de tesis" />
        <input id="tesisAutor" type="text" placeholder="Autor" />
        <input id="tesisCarrera" type="text" placeholder="Carrera / Programa" />
        <input id="tesisUniversidad" type="text" placeholder="Universidad" />
        <input id="tesisLinea" type="text" placeholder="Línea de investigación" />
        <textarea id="tesisObjetivo" placeholder="Objetivo general"></textarea>
        <button id="btnGenerarTesis" class="btn">Generar tesis</button>
        <button id="btnGenerarTesisCompleta" class="btn">Generar tesis completa</button>
        <button id="btnEnviarTesis" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoTesis" class="card"></div>
      <div id="previewTesis" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoTesis");
  const preview = cont.querySelector("#previewTesis");

  cont.querySelector("#btnGenerarTesis").addEventListener("click", () => {
    window.setEstado(estado, "Generando...", "estado-warn");
    const docBaseRaw = localStorage.getItem("documento_base") || "";
    const docBaseObj = window.parseDocumentoBase ? window.parseDocumentoBase() : null;
    const docBaseMarkdown = window.documentoBaseToMarkdown
      ? window.documentoBaseToMarkdown(docBaseObj)
      : docBaseRaw;
    const paperBase = localStorage.getItem("paper_base") || "";
    const refs = safeGetJSON("referencias", []);

    const data = {
      titulo: (document.getElementById("tesisTitulo")?.value || "").trim(),
      autor: (document.getElementById("tesisAutor")?.value || "").trim(),
      carrera: (document.getElementById("tesisCarrera")?.value || "").trim(),
      universidad: (document.getElementById("tesisUniversidad")?.value || "").trim(),
      linea: (document.getElementById("tesisLinea")?.value || "").trim(),
      resumen: extraerBloqueMarkdown(paperBase, "Resumen"),
      introduccion: docBaseObj?.introduccion || extraerBloqueMarkdown(docBaseMarkdown, "Introducción"),
      problema: docBaseObj?.problema || extraerBloqueMarkdown(docBaseMarkdown, "Problema"),
      justificacion: "Justificación derivada del documento base.",
      objetivos: (document.getElementById("tesisObjetivo")?.value || "").trim() || docBaseObj?.objetivos || extraerBloqueMarkdown(docBaseMarkdown, "Objetivos"),
      marco: extraerBloqueMarkdown(docBaseMarkdown, "Conceptos clave"),
      metodologia: extraerBloqueMarkdown(paperBase, "Metodología"),
      resultados: "Resultados esperados según la línea de investigación.",
      discusion: "Discusión de aportes esperados.",
      conclusiones: extraerBloqueMarkdown(docBaseMarkdown, "Ideas"),
      recomendaciones: "Recomendaciones finales.",
      referencias: refs.map((r) => (typeof generarReferenciaAPA === "function" ? generarReferenciaAPA(r) : "")).join("\n"),
      anexos: "Anexos técnicos."
    };

    try {
      const tesis = generarTesisAcademica(data);
      localStorage.setItem("tesis_base", tesis);
      window.setEstado(estado, "Guardado correctamente", "estado-ok");

      const safe = escapeHTML(tesis);
      if (preview) preview.innerHTML = `<pre>${safe}</pre>`;
    } catch (e) {
      window.setEstado(estado, "Error", "estado-error");
    }
  });

  cont.querySelector("#btnGenerarTesisCompleta").addEventListener("click", () => {
    window.setEstado(estado, "Generando...", "estado-warn");
    try {
      const editorDoc = localStorage.getItem("documento_editor") || "";
      const citas = safeGetJSON("citas_apa", []);
      const contenido = [
        "# Tesis completa",
        editorDoc,
        "## Referencias APA",
        Array.isArray(citas) ? citas.join("\n") : ""
      ].filter(Boolean).join("\n\n").trim();
      localStorage.setItem("tesis_completa", contenido);
      if (preview) preview.innerHTML = `<pre>${escapeHTML(contenido)}</pre>`;
      window.setEstado(estado, "Guardado correctamente", "estado-ok");
    } catch (e) {
      window.setEstado(estado, "Error", "estado-error");
    }
  });

  cont.querySelector("#btnEnviarTesis").addEventListener("click", () => {
    const tesis = localStorage.getItem("tesis_base") || "";
    if (!tesis) {
      window.setEstado(estado, "No existe tesis para enviar", "estado-warn");
      return;
    }
    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(tesis);
      window.setEstado(estado, "Tesis enviada al editor", "estado-ok");
    } else if (window.CADState) {
      if (!window.CADState.editor) window.CADState.editor = { secciones: [] };
      window.CADState.editor.secciones = [{ titulo: "Tesis", contenido: tesis }];
      if (window.CADCore?.storage?.guardarEstadoLocal) {
        CADCore.storage.guardarEstadoLocal(window.CADState);
      }
      if (typeof window.actualizarEditorVisual === "function") {
        window.actualizarEditorVisual();
      } else if (typeof renderEditor === "function") {
        renderEditor();
      }
      window.setEstado(estado, "Tesis enviada al editor", "estado-ok");
    }
  });

  const prev = localStorage.getItem("tesis_base");
  if (prev && preview) {
    const safe = escapeHTML(prev);
    preview.innerHTML = `<pre>${safe}</pre>`;
  }
}

function initTesis() {
  renderTesis();
}
