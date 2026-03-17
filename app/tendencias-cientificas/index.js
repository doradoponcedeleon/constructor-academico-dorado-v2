function renderTendenciasCientificas() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Analizador de Tendencias Científicas</h2>
      <p>Analiza referencias y muestra tendencias con tablas simples.</p>
      <div class="bitacora-form">
        <button id="btnAnalizarTendencias" class="btn">Analizar tendencias</button>
        <button id="btnEnviarTendencias" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoTendencias" class="card"></div>
      <div id="resultadoTendencias" class="card"></div>
      <div id="visualTendencias" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoTendencias");
  const resultado = cont.querySelector("#resultadoTendencias");
  const visual = cont.querySelector("#visualTendencias");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const renderPreview = (texto) => {
    const safe = (texto || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
  };

  const renderTabla = (titulo, items, countMap) => {
    if (!visual) return;
    const rows = items.map((k) => `<tr><td>${escapeHTML(k)}</td><td>${countMap[k]}</td></tr>`).join("");
    const html = `
      <div style="margin-bottom:12px;">
        <strong>${escapeHTML(titulo)}</strong>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr><th style="text-align:left;">Elemento</th><th style="text-align:right;">Frecuencia</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    visual.innerHTML += html;
  };

  cont.querySelector("#btnAnalizarTendencias").addEventListener("click", () => {
    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (!refs.length) {
      setEstado("No hay referencias guardadas", "estado-warn");
    }
    const res = generarTendenciasCientificas(refs);
    localStorage.setItem("tendencias_cientificas", res.markdown);
    renderPreview(res.markdown);

    if (visual) visual.innerHTML = "";
    renderTabla("Evolución temporal", res.years, res.yearsCount);
    renderTabla("Palabras clave", res.topKeywords, res.keywordsCount);
    renderTabla("Autores", res.topAutores, res.autoresCount);

    setEstado("Tendencias analizadas", "estado-ok");
  });

  cont.querySelector("#btnEnviarTendencias").addEventListener("click", () => {
    const texto = localStorage.getItem("tendencias_cientificas") || "";
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

  const prev = localStorage.getItem("tendencias_cientificas");
  if (prev) renderPreview(prev);
}

function initTendenciasCientificas() {
  renderTendenciasCientificas();
}
