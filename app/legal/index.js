window.CADLegal = window.CADLegal || {};

function initLegal() {
  renderLegal();
}

function renderLegal() {
  const panel = document.getElementById("panelContenido");
  if (!panel) return;

  const state = window.CADState || {};

  const recursos = CADLegal.recursos(state);
  const atribuciones = CADLegal.atribuciones(state);

  panel.innerHTML = `
    <div class="modulo-card">
      <h2>Legal</h2>
      <p>Verificación básica de recursos académicos.</p>
      <div class="card">
        <h3>Recursos</h3>
        ${recursos.length ? recursos.map((x) => `<div>${x}</div>`).join("") : "<div>Sin observaciones.</div>"}
      </div>
      <div class="card">
        <h3>Atribuciones</h3>
        ${atribuciones.length ? atribuciones.map((x) => `<div>${x}</div>`).join("") : "<div>Sin observaciones.</div>"}
      </div>
    </div>
  `;
}
