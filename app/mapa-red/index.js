function renderMapaRed() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Red de Literatura Científica</h2>
      <p>Visualiza la red de autores, papers y palabras clave.</p>
      <div class="bitacora-form">
        <button id="btnConstruirRed" class="btn">Construir red</button>
        <button id="btnEnviarRed" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoMapaRed" class="card"></div>
      <div id="infoMapaRed" class="card"></div>
      <div id="canvasMapaRed" style="height:420px;"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoMapaRed");
  const info = cont.querySelector("#infoMapaRed");
  const canvas = cont.querySelector("#canvasMapaRed");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderInfo = (node) => {
    if (!info) return;
    if (!node || !node.data) {
      info.innerHTML = "";
      return;
    }
    const d = node.data;
    const html = `
      <strong>${escapeHTML(d.titulo || node.label || "")}</strong><br/>
      ${d.autores ? `<span class=\"muted\">${escapeHTML(d.autores)} (${escapeHTML(d.anio || "")})</span><br/>` : ""}
      ${d.resumen ? `<p>${escapeHTML(d.resumen)}</p>` : ""}
    `;
    info.innerHTML = html;
  };

  cont.querySelector("#btnConstruirRed").addEventListener("click", async () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (!refs.length) {
      setEstado("No hay referencias guardadas", "estado-warn");
      return;
    }
    if (!canvas) return;
    setEstado("Construyendo red...", "estado-warn");
    try {
      await renderRedLiteratura(canvas, renderInfo);
      setEstado("Red construida", "estado-ok");
    } catch (e) {
      setEstado("No se pudo cargar la red", "estado-error");
      if (window.logCAD) logCAD("mapa-red error", e);
    }
  });

  cont.querySelector("#btnEnviarRed").addEventListener("click", () => {
    const data = localStorage.getItem("red_literatura") || "";
    if (!data) {
      setEstado("Construye la red primero", "estado-warn");
      return;
    }
    localStorage.setItem("documento_base", data);
    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(data);
      setEstado("Enviado al editor", "estado-ok");
      return;
    }
    setEstado("No se pudo sincronizar con el editor", "estado-error");
  });
}

function initMapaRed() {
  renderMapaRed();
}
