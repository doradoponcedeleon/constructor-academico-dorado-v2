function obtenerRevisionPlataforma() {
  if (window.CADState && window.CADState.revision && Array.isArray(window.CADState.revision.resultados)) {
    return window.CADState.revision.resultados;
  }
  return [];
}

function guardarRevisionPlataforma(lista) {
  if (!window.CADState) return;
  if (!window.CADState.revision) window.CADState.revision = { resultados: [] };
  window.CADState.revision.resultados = Array.isArray(lista) ? lista : [];
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function ejecutarRevisionPlataforma() {
  const state = window.CADState || {};
  const secciones = state.editor?.secciones || [];

  const resultado = [
    ...revisarEstructuraPlataforma(secciones),
    ...revisarCoherenciaPlataforma(secciones),
    ...revisarFormatoPlataforma(state)
  ];

  guardarRevisionPlataforma(resultado);
  renderRevision();
}

function renderRevision() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  const lista = obtenerRevisionPlataforma();

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Revisión</h2>
      <p>Revisión académica modular.</p>
      <div class="button-row">
        <button id="btnEjecutarRevision" class="btn">Ejecutar revisión</button>
      </div>
      <div id="listaRevision"></div>
    </div>
  `;

  const listEl = cont.querySelector("#listaRevision");
  if (!lista.length) {
    listEl.innerHTML = "<p class=\"muted\">No hay observaciones.</p>";
  } else {
    lista.forEach((o) => {
      const item = document.createElement("div");
      item.className = "card";
      item.innerHTML = `<strong>${o.tipo.toUpperCase()}</strong> — ${o.mensaje}`;
      listEl.appendChild(item);
    });
  }

  cont.querySelector("#btnEjecutarRevision").addEventListener("click", ejecutarRevisionPlataforma);
}

function initRevision() {
  renderRevision();
}
