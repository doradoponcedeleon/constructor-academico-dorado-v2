function renderArticuloCientifico() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Generador de Artículo Científico</h2>
      <p>Compone un artículo científico con base en módulos previos.</p>
      <div class="bitacora-form">
        <button id="btnGenerarArticulo" class="btn">Generar artículo</button>
        <button id="btnEnviarArticulo" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoArticulo" class="card"></div>
      <div id="resultadoArticulo" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoArticulo");
  const resultado = cont.querySelector("#resultadoArticulo");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  cont.querySelector("#btnGenerarArticulo").addEventListener("click", () => {
    const texto = generarArticuloCientifico();
    renderPreview(texto);
    setEstado("Artículo generado", "estado-ok");
  });

  cont.querySelector("#btnEnviarArticulo").addEventListener("click", () => {
    const texto = localStorage.getItem("articulo_cientifico") || "";
    if (!texto) {
      setEstado("Genera el artículo primero", "estado-warn");
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

  const prev = localStorage.getItem("articulo_cientifico");
  if (prev) renderPreview(prev);
}

function initArticuloCientifico() {
  renderArticuloCientifico();
}
