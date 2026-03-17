const CAD_PANELES = [
  "panelCore",
  "panelEditor",
  "panelReferencias",
  "panelFiguras",
  "panelTablas",
  "panelBiblioteca",
  "panelVersiones",
  "panelExportadores",
  "panelMotorIdeas",
  "panelMotorPaper",
  "panelBuscadorPapers",
  "panelCitasAPA",
  "panelAsistenteRedaccion",
  "panelTesis",
  "panelRevision",
  "panelLegal",
  "panelSyncGithub"
];

function renderPanel(panelId) {
  logCAD("renderPanel", panelId);

  if (panelId === "panelEditor") {
    if (typeof renderEditor === "function") return renderEditor();
  }

  if (panelId === "panelReferencias") {
    if (typeof renderReferencias === "function") return renderReferencias();
  }

  if (panelId === "panelFiguras") {
    if (typeof renderFiguras === "function") return renderFiguras();
  }

  if (panelId === "panelTablas") {
    if (typeof renderTablas === "function") return renderTablas();
  }

  if (panelId === "panelBiblioteca") {
    if (typeof renderBiblioteca === "function") return renderBiblioteca();
  }

  if (panelId === "panelVersiones") {
    if (typeof renderVersiones === "function") return renderVersiones();
  }

  if (panelId === "panelExportadores") {
    if (typeof renderExportadores === "function") return renderExportadores();
  }

  if (panelId === "panelMotorIdeas") {
    if (typeof renderMotorIdeas === "function") return renderMotorIdeas();
  }

  if (panelId === "panelMotorPaper") {
    if (typeof renderMotorPaper === "function") return renderMotorPaper();
  }

  if (panelId === "panelBuscadorPapers") {
    if (typeof renderBuscadorPapers === "function") return renderBuscadorPapers();
  }

  if (panelId === "panelCitasAPA") {
    if (typeof renderCitasAPA === "function") return renderCitasAPA();
  }

  if (panelId === "panelAsistenteRedaccion") {
    if (typeof renderAsistenteRedaccion === "function") return renderAsistenteRedaccion();
  }

  if (panelId === "panelTesis") {
    if (typeof renderTesis === "function") return renderTesis();
  }

  if (panelId === "panelRevision") {
    if (typeof renderRevision === "function") return renderRevision();
  }

  if (panelId === "panelSyncGithub") {
    if (typeof renderSyncGithub === "function") return renderSyncGithub();
    if (typeof initSyncGithub === "function") return initSyncGithub();
  }

  if (panelId === "panelLegal") {
    if (typeof renderLegal === "function") return renderLegal();
  }

  const map = {
    panelCore: {
      titulo: "Core",
      descripcion: "Núcleo técnico de la plataforma"
    },
    panelLegal: {
      titulo: "Legal",
      descripcion: "Verificación legal de recursos"
    },
    panelSyncGithub: {
      titulo: "Sync GitHub",
      descripcion: "Sincronización de documentos con GitHub"
    },
    panelMotorPaper: {
      titulo: "Motor Paper",
      descripcion: "Generador de paper académico"
    },
    panelBuscadorPapers: {
      titulo: "Buscador Papers",
      descripcion: "Búsqueda académica simulada"
    },
    panelCitasAPA: {
      titulo: "Citas APA",
      descripcion: "Generador rápido de citas APA"
    },
    panelAsistenteRedaccion: {
      titulo: "Asistente de redacción",
      descripcion: "Mejora y reescritura académica"
    },
    panelTesis: {
      titulo: "Generador de tesis",
      descripcion: "Estructura base de tesis completa"
    }
  };

  const cont = document.getElementById("panelContenido");
  if (cont) {
    const target = map[panelId] || map.panelCore;
    cont.innerHTML = `
      <div class="modulo-card">
        <h2>${target.titulo}</h2>
        <p>${target.descripcion}</p>
        <p class="estado-warn">Módulo no cargado aún.</p>
      </div>
    `;
  }
}

function mostrarPanel(panelId) {
  if (!panelId || !CAD_PANELES.includes(panelId)) {
    logCAD("panelId inválido", panelId);
    const cont = document.getElementById("panelContenido");
    if (cont) {
      cont.innerHTML = `
        <div class="modulo-card">
          <h2>Panel no disponible</h2>
          <p class="estado-error">El panel solicitado no existe.</p>
        </div>
      `;
    }
    return;
  }

  renderPanel(panelId);

  const items = document.querySelectorAll("[data-panel]");
  items.forEach((item) => item.classList.remove("active"));
  const activeItem = document.querySelector(`[data-panel="${panelId}"]`);
  if (activeItem) activeItem.classList.add("active");
}

function initRouter() {
  const items = document.querySelectorAll("[data-panel]");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const panelId = item.getAttribute("data-panel");
      mostrarPanel(panelId);
    });
  });
}
