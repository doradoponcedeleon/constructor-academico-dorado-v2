function renderDashboard() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Dashboard de Investigación</h2>
      <p>Resumen del estado actual del proyecto.</p>
      <div class="bitacora-form">
        <button id="btnActualizarDashboard" class="btn">Actualizar dashboard</button>
      </div>
      <div class="grid">
        <div id="panelProyecto" class="card"></div>
        <div id="panelDocumento" class="card"></div>
        <div id="panelReferencias" class="card"></div>
        <div id="panelSistema" class="card"></div>
      </div>
    </div>
  `;

  const panelProyecto = cont.querySelector("#panelProyecto");
  const panelDocumento = cont.querySelector("#panelDocumento");
  const panelReferencias = cont.querySelector("#panelReferencias");
  const panelSistema = cont.querySelector("#panelSistema");

  const actualizar = () => {
    const tesis = typeof safeGetJSON === "function" ? safeGetJSON("tesis_base", null) : null;
    const tema = tesis?.tema || "(sin tema)";
    const autor = tesis?.autor || "(sin autor)";
    const universidad = tesis?.universidad || "(sin universidad)";
    const linea = tesis?.linea || "(sin línea)";

    if (panelProyecto) {
      panelProyecto.innerHTML = `
        <strong>Proyecto</strong><br/>
        Tema: ${escapeHTML(tema)}<br/>
        Autor: ${escapeHTML(autor)}<br/>
        Universidad: ${escapeHTML(universidad)}<br/>
        Línea: ${escapeHTML(linea)}
      `;
    }

    const doc = localStorage.getItem("documento_base") || "";
    const secciones = (doc.match(/^##\s+/gm) || []).length + (doc.match(/^#\s+/gm) ? 1 : 0);
    const palabras = doc.trim() ? doc.trim().split(/\s+/).length : 0;
    const paginas = palabras ? Math.max(1, Math.ceil(palabras / 300)) : 0;

    if (panelDocumento) {
      panelDocumento.innerHTML = `
        <strong>Documento</strong><br/>
        Secciones: ${secciones}<br/>
        Páginas estimadas: ${paginas}<br/>
        Capítulos: ${secciones > 0 ? secciones - 1 : 0}
      `;
    }

    const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
    if (panelReferencias) {
      panelReferencias.innerHTML = `
        <strong>Referencias</strong><br/>
        Total: ${refs.length}
      `;
    }

    const versiones = typeof safeGetJSON === "function" ? safeGetJSON("versiones", []) : [];
    const sync = localStorage.getItem("github_sync") || "desconocido";
    if (panelSistema) {
      panelSistema.innerHTML = `
        <strong>Sistema</strong><br/>
        Versiones guardadas: ${Array.isArray(versiones) ? versiones.length : 0}<br/>
        Estado de sincronización GitHub: ${escapeHTML(sync)}
      `;
    }
  };

  cont.querySelector("#btnActualizarDashboard").addEventListener("click", actualizar);
  actualizar();
}

function initDashboard() {
  renderDashboard();
}
