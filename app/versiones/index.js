function guardarVersionPlataforma() {
  const descripcion = document.getElementById("descripcionVersion").value.trim();
  const lista = obtenerVersionesPlataforma();
  const snap = capturarSnapshotPlataforma();
  snap.descripcion = descripcion || "Versión sin descripción";
  lista.unshift(snap);
  guardarVersionesPlataforma(lista);
  renderVersiones();
  document.getElementById("descripcionVersion").value = "";
}

function listarVersionesPlataforma(lista) {
  const cont = document.getElementById("listaVersiones");
  if (!cont) return;
  cont.innerHTML = "";

  if (!lista.length) {
    cont.innerHTML = "<p class=\"muted\">No hay versiones guardadas.</p>";
    return;
  }

  lista.forEach((ver, index) => {
    const card = document.createElement("div");
    card.className = "card";
    const fecha = ver.fecha ? new Date(ver.fecha).toLocaleString() : "";
    card.innerHTML = `
      <h3>${fecha}</h3>
      <p class="muted">${ver.descripcion}</p>
      <div class="button-row">
        <button class="btn" data-restaurar="${index}">Restaurar</button>
        <button class="btn btn-peligro" data-eliminar="${index}">Eliminar</button>
      </div>
    `;
    cont.appendChild(card);
  });

  cont.querySelectorAll("[data-restaurar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-restaurar"), 10);
      restaurarVersionPlataforma(idx);
    });
  });

  cont.querySelectorAll("[data-eliminar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-eliminar"), 10);
      eliminarVersionPlataforma(idx);
    });
  });
}

function renderVersiones() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Versiones</h2>
      <p>Historial y snapshots del documento.</p>
      <div class="bitacora-form">
        <input id="descripcionVersion" type="text" placeholder="Descripción de la versión" />
        <button id="btnGuardarVersion" class="btn">Guardar versión</button>
      </div>
      <div id="listaVersiones"></div>
    </div>
  `;

  const lista = obtenerVersionesPlataforma();
  listarVersionesPlataforma(lista);

  cont.querySelector("#btnGuardarVersion").addEventListener("click", guardarVersionPlataforma);
}

function initVersiones() {
  renderVersiones();
}
