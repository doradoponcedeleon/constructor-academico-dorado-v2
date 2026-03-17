function renderTemasInvestigacion() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Generador de Temas de Investigación</h2>
      <p>Propone nuevos temas de investigación basados en referencias y vacíos.</p>
      <div class="bitacora-form">
        <button id="btnGenerarTemas" class="btn">Generar temas</button>
        <button id="btnEnviarTemas" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoTemas" class="card"></div>
      <div id="resultadoTemas" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoTemas");
  const resultado = cont.querySelector("#resultadoTemas");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnGenerarTemas").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    const vacios = localStorage.getItem("vacios_investigacion") || "";
    const estadoArte = localStorage.getItem("estado_arte") || "";

    const texto = generarTemasInvestigacion(refs, vacios, estadoArte);
    localStorage.setItem("temas_investigacion", texto);
    renderPreview(texto);
    setEstado("Temas generados", "estado-ok");
  });

  cont.querySelector("#btnEnviarTemas").addEventListener("click", () => {
    const texto = localStorage.getItem("temas_investigacion") || "";
    if (!texto) {
      setEstado("Genera los temas primero", "estado-warn");
      return;
    }
    localStorage.setItem("documento_base", texto);
    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(texto);
      setEstado("Enviado al editor", "estado-ok");
      return;
    }
    setEstado("No se pudo sincronizar con el editor", "estado-error");
  });

  const prev = localStorage.getItem("temas_investigacion");
  if (prev) renderPreview(prev);
}

function initTemasInvestigacion() {
  renderTemasInvestigacion();
}
