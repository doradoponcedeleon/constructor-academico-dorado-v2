function renderMetodologia() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Diseñador de Metodología</h2>
      <p>Genera la sección metodológica de la investigación.</p>
      <div class="bitacora-form">
        <button id="btnGenerarMetodologia" class="btn">Generar metodología</button>
        <button id="btnEnviarMetodologia" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoMetodologia" class="card"></div>
      <div id="resultadoMetodologia" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoMetodologia");
  const resultado = cont.querySelector("#resultadoMetodologia");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnGenerarMetodologia").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    const hipotesis = localStorage.getItem("hipotesis") || "";
    const vacios = localStorage.getItem("vacios_investigacion") || "";
    const estadoArte = localStorage.getItem("estado_arte") || "";

    const texto = generarMetodologia(refs, hipotesis, vacios, estadoArte);
    localStorage.setItem("metodologia", texto);
    renderPreview(texto);
    setEstado("Metodología generada", "estado-ok");
  });

  cont.querySelector("#btnEnviarMetodologia").addEventListener("click", () => {
    const texto = localStorage.getItem("metodologia") || "";
    if (!texto) {
      setEstado("Genera la metodología primero", "estado-warn");
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

  const prev = localStorage.getItem("metodologia");
  if (prev) renderPreview(prev);
}

function initMetodologia() {
  renderMetodologia();
}
