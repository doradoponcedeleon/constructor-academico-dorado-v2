function renderHipotesis() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Generador de Hipótesis</h2>
      <p>Construye hipótesis académicas a partir de la evidencia disponible.</p>
      <div class="bitacora-form">
        <button id="btnGenerarHipotesis" class="btn">Generar hipótesis</button>
        <button id="btnEnviarHipotesis" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoHipotesis" class="card"></div>
      <div id="resultadoHipotesis" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoHipotesis");
  const resultado = cont.querySelector("#resultadoHipotesis");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnGenerarHipotesis").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    const vacios = localStorage.getItem("vacios_investigacion") || "";
    const estadoArte = localStorage.getItem("estado_arte") || "";

    const texto = generarHipotesis(refs, vacios, estadoArte);
    localStorage.setItem("hipotesis", texto);
    renderPreview(texto);
    setEstado("Hipótesis generadas", "estado-ok");
  });

  cont.querySelector("#btnEnviarHipotesis").addEventListener("click", () => {
    const texto = localStorage.getItem("hipotesis") || "";
    if (!texto) {
      setEstado("Genera las hipótesis primero", "estado-warn");
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

  const prev = localStorage.getItem("hipotesis");
  if (prev) renderPreview(prev);
}

function initHipotesis() {
  renderHipotesis();
}
