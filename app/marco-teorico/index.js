function renderMarcoTeorico() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Generador de Marco Teórico</h2>
      <p>Genera un marco teórico completo desde referencias guardadas.</p>
      <div class="bitacora-form">
        <button id="btnGenerarMarcoTeorico" class="btn">Generar marco teórico</button>
        <button id="btnEnviarMarcoTeorico" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoMarcoTeorico" class="card"></div>
      <div id="resultadoMarcoTeorico" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoMarcoTeorico");
  const resultado = cont.querySelector("#resultadoMarcoTeorico");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnGenerarMarcoTeorico").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (!refs.length) {
      setEstado("No hay referencias guardadas", "estado-warn");
    }
    try {
      const texto = generarMarcoTeorico(refs);
      localStorage.setItem("marco_teorico", texto);
      window.appendDocumentoEditor && window.appendDocumentoEditor(texto);
      renderPreview(texto);
      console.log("MARCO TEORICO LENGTH:", texto.length);
      setEstado("Marco teórico generado correctamente", "estado-ok");
    } catch (e) {
      setEstado("Error", "estado-error");
    }
  });

  cont.querySelector("#btnEnviarMarcoTeorico").addEventListener("click", () => {
    const texto = localStorage.getItem("marco_teorico") || "";
    if (!texto) {
      setEstado("Genera el marco teórico primero", "estado-warn");
      return;
    }
    localStorage.setItem("documento_editor", window.appendDocumentoEditor ? window.appendDocumentoEditor(texto) : texto);
    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(texto);
      setEstado("Guardado correctamente", "estado-ok");
      return;
    }
    if (typeof window.sincronizarEditorConPaper === "function") {
      window.sincronizarEditorConPaper(texto);
      setEstado("Guardado correctamente", "estado-ok");
      return;
    }
    setEstado("Error", "estado-error");
  });

  const prev = localStorage.getItem("marco_teorico");
  if (prev) renderPreview(prev);
}

function initMarcoTeorico() {
  renderMarcoTeorico();
}
