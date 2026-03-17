window.CADSync = window.CADSync || {};

function initSyncGithub() {
  renderSyncGithub();
}

function renderSyncGithub() {
  const panel = document.getElementById("panelContenido");
  if (!panel) return;

  panel.innerHTML = `
    <div class="modulo-card">
      <h2>Sync GitHub</h2>
      <p>Sincroniza documentos JSON con un repositorio GitHub.</p>
      <div class="bitacora-form">
        <input id="ghOwner" type="text" placeholder="Owner" />
        <input id="ghRepo" type="text" placeholder="Repositorio" />
        <input id="ghToken" type="password" placeholder="Token" />
        <input id="ghNombre" type="text" placeholder="documento.json" />
        <div class="button-row">
          <button id="btnGuardarRepo" class="btn">Guardar en GitHub</button>
          <button id="btnListarRepo" class="btn">Listar documentos</button>
          <button id="btnCargarRepo" class="btn">Cargar documento</button>
        </div>
      </div>
      <div id="listaRepo" class="card"></div>
    </div>
  `;

  const owner = panel.querySelector("#ghOwner");
  const repo = panel.querySelector("#ghRepo");
  const token = panel.querySelector("#ghToken");
  const nombre = panel.querySelector("#ghNombre");
  const lista = panel.querySelector("#listaRepo");

  const syncConfig = () => {
    CADSync.api.owner = owner.value.trim();
    CADSync.api.repo = repo.value.trim();
    CADSync.api.token = token.value.trim();
  };

  const ensureCreds = () => {
    if (!CADSync.api.owner || !CADSync.api.repo || !CADSync.api.token) {
      lista.innerHTML = "<p class=\"muted\">Faltan credenciales: owner, repositorio y token.</p>";
      return false;
    }
    return true;
  };

  panel.querySelector("#btnListarRepo").addEventListener("click", async () => {
    syncConfig();
    if (!ensureCreds()) return;
    const data = await listarDocumentosGitHubPlataforma();
    if (data && data.error) {
      lista.innerHTML = `<p class="muted">${data.error}</p>`;
      return;
    }
    lista.innerHTML = Array.isArray(data)
      ? data.map((d) => `<div>${d.name}</div>`).join("")
      : "Sin resultados";
  });

  panel.querySelector("#btnGuardarRepo").addEventListener("click", async () => {
    syncConfig();
    if (!ensureCreds()) return;
    const res = await guardarDocumentoGitHubPlataforma();
    if (res && res.error) {
      lista.innerHTML = `<p class="muted">${res.error}</p>`;
    } else {
      lista.innerHTML = "<p class=\"muted\">Documento guardado en GitHub.</p>";
    }
  });

  panel.querySelector("#btnCargarRepo").addEventListener("click", async () => {
    syncConfig();
    if (!ensureCreds()) return;
    const name = nombre.value.trim();
    const data = await cargarDocumentoGitHubPlataforma(name);
    if (data && data.error) {
      lista.innerHTML = `<p class="muted">${data.error}</p>`;
      return;
    }
    if (typeof setState === "function") setState(data);
    if (window.PEditor?.sections?.lista && data?.documentoActual?.secciones) {
      window.PEditor.sections.lista = data.documentoActual.secciones;
    }
    lista.innerHTML = "<p class=\"muted\">Documento cargado desde GitHub.</p>";
  });
}
