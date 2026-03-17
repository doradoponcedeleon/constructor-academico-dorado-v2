function renderVaciosInvestigacion() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Detector de Vacíos de Investigación</h2>
      <p>Analiza referencias para detectar vacíos y oportunidades.</p>
      <div class="bitacora-form">
        <button id="btnAnalizarVacios" class="btn">Analizar vacíos</button>
        <button id="btnEnviarVacios" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoVacios" class="card"></div>
      <div id="resultadoVacios" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoVacios");
  const resultado = cont.querySelector("#resultadoVacios");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnAnalizarVacios").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (!refs.length) {
      setEstado("No hay referencias guardadas", "estado-warn");
    }
    const texto = detectarVaciosInvestigacion(refs);
    localStorage.setItem("vacios_investigacion", texto);
    renderPreview(texto);
    setEstado("Vacíos detectados", "estado-ok");
  });

  cont.querySelector("#btnEnviarVacios").addEventListener("click", () => {
    const texto = localStorage.getItem("vacios_investigacion") || "";
    if (!texto) {
      setEstado("Genera el análisis primero", "estado-warn");
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

  const prev = localStorage.getItem("vacios_investigacion");
  if (prev) renderPreview(prev);
}

function initVaciosInvestigacion() {
  renderVaciosInvestigacion();
}
