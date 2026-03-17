function renderMapaLiteratura() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Mapa de Literatura Científica</h2>
      <p>Analiza referencias académicas para construir un mapa conceptual.</p>
      <div class="bitacora-form">
        <button id="btnAnalizarMapa" class="btn">Analizar literatura</button>
        <button id="btnEnviarMapa" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoMapa" class="card"></div>
      <div id="resultadoMapa" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoMapa");
  const resultado = cont.querySelector("#resultadoMapa");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnAnalizarMapa").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (!refs.length) {
      setEstado("No hay referencias guardadas", "estado-warn");
    }
    const texto = generarMapaLiteratura(refs);
    localStorage.setItem("mapa_literatura", texto);
    renderPreview(texto);
    setEstado("Mapa generado", "estado-ok");
  });

  cont.querySelector("#btnEnviarMapa").addEventListener("click", () => {
    const texto = localStorage.getItem("mapa_literatura") || "";
    if (!texto) {
      setEstado("Genera el mapa primero", "estado-warn");
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

  const prev = localStorage.getItem("mapa_literatura");
  if (prev) renderPreview(prev);
}

function initMapaLiteratura() {
  renderMapaLiteratura();
}
