function guardarDocumentoEnBiblioteca() {
  const nombre = document.getElementById("bibliotecaNombreDocumento").value.trim();
  if (!nombre) return;

  const state = window.CADState;
  if (!state) return;
  const doc = {
    nombre,
    fecha: new Date().toISOString(),
    datos: CADCore?.utils?.clonarObjeto ? CADCore.utils.clonarObjeto(state) : JSON.parse(JSON.stringify(state))
  };

  const lista = obtenerBiblioteca();
  lista.unshift(doc);
  guardarBiblioteca(lista);
  renderBiblioteca();

  document.getElementById("bibliotecaNombreDocumento").value = "";
}

function listarDocumentosBiblioteca(lista) {
  const cont = document.getElementById("listaBiblioteca");
  if (!cont) return;
  cont.innerHTML = "";

  if (!lista.length) {
    cont.innerHTML = "<p class=\"muted\">No hay documentos guardados.</p>";
    return;
  }

  lista.forEach((doc, index) => {
    const card = document.createElement("div");
    card.className = "card";
    const fecha = doc.fecha ? new Date(doc.fecha).toLocaleString() : "";
    card.innerHTML = `
      <h3>${doc.nombre}</h3>
      <p class="muted">${fecha}</p>
      <div class="button-row">
        <button class="btn" data-abrir="${index}">Abrir</button>
        <button class="btn btn-peligro" data-eliminar="${index}">Eliminar</button>
      </div>
    `;
    cont.appendChild(card);
  });

  cont.querySelectorAll("[data-abrir]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-abrir"), 10);
      abrirDocumentoBiblioteca(index);
    });
  });

  cont.querySelectorAll("[data-eliminar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-eliminar"), 10);
      eliminarDocumentoBiblioteca(index);
    });
  });
}

function abrirDocumentoBiblioteca(index) {
  const lista = obtenerBiblioteca();
  const doc = lista[index];
  if (!doc) return;
  window.CADState = CADCore?.utils?.clonarObjeto ? CADCore.utils.clonarObjeto(doc.datos) : JSON.parse(JSON.stringify(doc.datos));
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function eliminarDocumentoBiblioteca(index) {
  const lista = obtenerBiblioteca();
  lista.splice(index, 1);
  guardarBiblioteca(lista);
  renderBiblioteca();
}

function renderBiblioteca() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Biblioteca</h2>
      <p>Documentos guardados y buscador interno.</p>
      <div class="bitacora-form">
        <input id="bibliotecaNombreDocumento" type="text" placeholder="Nombre del documento" />
        <button id="btnGuardarBiblioteca" class="btn">Guardar documento actual</button>
        <input id="bibliotecaBusqueda" type="text" placeholder="Buscar documento" />
      </div>
      <div id="listaBiblioteca"></div>
    </div>
  `;

  const lista = obtenerBiblioteca();
  listarDocumentosBiblioteca(lista);

  cont.querySelector("#btnGuardarBiblioteca").addEventListener("click", guardarDocumentoEnBiblioteca);
  cont.querySelector("#bibliotecaBusqueda").addEventListener("input", (e) => {
    listarDocumentosBiblioteca(buscarDocumentosBiblioteca(e.target.value));
  });
}

function initBiblioteca() {
  renderBiblioteca();
}
