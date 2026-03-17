function renderEstadoArte() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Estado del Arte</h2>
      <p>Analiza referencias para generar un estado del arte.</p>
      <div class="bitacora-form">
        <button id="btnAnalizarEstado" class="btn">Analizar literatura</button>
        <button id="btnEnviarEstado" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoEstadoArte" class="card"></div>
      <div id="resultadoEstadoArte" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoEstadoArte");
  const resultado = cont.querySelector("#resultadoEstadoArte");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnAnalizarEstado").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (!refs.length) {
      setEstado("No hay referencias guardadas", "estado-warn");
    }
    const texto = generarEstadoArte(refs);
    localStorage.setItem("estado_arte", texto);
    renderPreview(texto);
    setEstado("Estado del arte generado", "estado-ok");
  });

  cont.querySelector("#btnEnviarEstado").addEventListener("click", () => {
    const texto = localStorage.getItem("estado_arte") || "";
    if (!texto) {
      setEstado("Genera el estado del arte primero", "estado-warn");
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

  const prev = localStorage.getItem("estado_arte");
  if (prev) renderPreview(prev);
}

function initEstadoArte() {
  renderEstadoArte();
}
