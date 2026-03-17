function mostrarMensaje(texto, tipo) {
  const status = document.getElementById("statusBar");
  if (!status) return;

  status.textContent = texto || "";
  status.className = "status";
  if (tipo) status.classList.add(`status-${tipo}`);
}

function actualizarTituloDocumento(texto) {
  const el = document.querySelector("#panelEditor h2");
  if (el) el.textContent = texto || "Editor";
}

function renderTarjetaResumen(contenedorId, titulo, valor, descripcion) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h2>${titulo}</h2>
    <p class="muted">${descripcion || ""}</p>
    <div class="badge">${valor}</div>
  `;
  contenedor.appendChild(card);
}

function limpiarContenedor(id) {
  const contenedor = document.getElementById(id);
  if (contenedor) contenedor.innerHTML = "";
}

function setContenidoPrincipal(html) {
  const contenedor = document.getElementById("panelContenido");
  if (contenedor) contenedor.innerHTML = html;
}
