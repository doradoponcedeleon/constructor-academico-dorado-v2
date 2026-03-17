function obtenerTablasPlataforma() {
  if (window.CADState && Array.isArray(window.CADState.tablas)) {
    return window.CADState.tablas;
  }
  return [];
}

function guardarTablasPlataforma(lista) {
  if (!window.CADState) return;
  window.CADState.tablas = Array.isArray(lista) ? lista : [];
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function agregarTablaPlataforma() {
  const titulo = document.getElementById("tablaTitulo").value.trim();
  const descripcion = document.getElementById("tablaDescripcion").value.trim();
  const filas = Number(document.getElementById("tablaFilas").value) || 3;
  const columnas = Number(document.getElementById("tablaColumnas").value) || 3;

  const lista = obtenerTablasPlataforma();
  lista.unshift({
    titulo,
    descripcion,
    filas,
    columnas,
    datos: crearMatrizTabla(filas, columnas)
  });

  guardarTablasPlataforma(lista);
  renderTablas();

  document.getElementById("tablaTitulo").value = "";
  document.getElementById("tablaDescripcion").value = "";
  document.getElementById("tablaFilas").value = "";
  document.getElementById("tablaColumnas").value = "";
}

function eliminarTablaPlataforma(index) {
  const lista = obtenerTablasPlataforma();
  lista.splice(index, 1);
  guardarTablasPlataforma(lista);
  renderTablas();
}

function renderTablas() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Tablas</h2>
      <p>Gestión de tablas académicas.</p>
      <div class="bitacora-form">
        <input id="tablaTitulo" type="text" placeholder="Título" />
        <input id="tablaDescripcion" type="text" placeholder="Descripción" />
        <input id="tablaFilas" type="number" min="1" placeholder="Filas" />
        <input id="tablaColumnas" type="number" min="1" placeholder="Columnas" />
        <button id="btnCrearTabla" class="btn">Crear tabla</button>
      </div>
      <div id="listaTablas"></div>
    </div>
  `;

  const lista = cont.querySelector("#listaTablas");
  const tablas = obtenerTablasPlataforma();

  if (!tablas.length) {
    lista.innerHTML = "<p class=\"muted\">No hay tablas registradas.</p>";
  } else {
    tablas.forEach((tabla, index) => {
      const card = document.createElement("div");
      card.className = "card";
      const tablaContainer = document.createElement("div");
      card.innerHTML = `
        <h3>${tabla.titulo || "Tabla"}</h3>
        <p class="muted">${tabla.descripcion || ""}</p>
      `;
      card.appendChild(tablaContainer);
      card.innerHTML += `
        <div class="button-row">
          <button class="btn btn-peligro" data-index="${index}">Eliminar</button>
        </div>
      `;
      lista.appendChild(card);

      renderTablaEditable(tabla, tablaContainer, (updated) => {
        tablas[index] = updated;
        guardarTablasPlataforma(tablas);
      });
    });

    lista.querySelectorAll("[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        eliminarTablaPlataforma(idx);
      });
    });
  }

  cont.querySelector("#btnCrearTabla").addEventListener("click", agregarTablaPlataforma);
}

function initTablas() {
  renderTablas();
}
