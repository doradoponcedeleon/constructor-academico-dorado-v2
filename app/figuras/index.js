function obtenerFigurasPlataforma() {
  if (window.CADState && Array.isArray(window.CADState.figuras)) {
    return window.CADState.figuras;
  }
  return [];
}

function guardarFigurasPlataforma(lista) {
  if (!window.CADState) return;
  window.CADState.figuras = Array.isArray(lista) ? lista : [];
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function agregarFiguraPlataforma() {
  const titulo = document.getElementById("figTitulo").value.trim();
  const descripcion = document.getElementById("figDescripcion").value.trim();
  const fuente = document.getElementById("figFuente").value.trim();
  const archivo = document.getElementById("figArchivo").files[0];
  if (!titulo || !archivo) return;

  leerImagenFigura(archivo, (dataUrl) => {
    const lista = obtenerFigurasPlataforma();
    lista.unshift({ titulo, descripcion, fuente, imagen: dataUrl });
    guardarFigurasPlataforma(lista);
    renderFiguras();

    document.getElementById("figTitulo").value = "";
    document.getElementById("figDescripcion").value = "";
    document.getElementById("figFuente").value = "";
    document.getElementById("figArchivo").value = "";
  });
}

function eliminarFiguraPlataforma(index) {
  const lista = obtenerFigurasPlataforma();
  lista.splice(index, 1);
  guardarFigurasPlataforma(lista);
  renderFiguras();
}

function renderFiguras() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Figuras</h2>
      <p>Gestión de figuras académicas.</p>
      <div class="bitacora-form">
        <input id="figTitulo" type="text" placeholder="Título" />
        <input id="figDescripcion" type="text" placeholder="Descripción" />
        <input id="figFuente" type="text" placeholder="Fuente" />
        <input id="figArchivo" type="file" accept="image/*" />
        <button id="btnAgregarFigura" class="btn">Agregar figura</button>
      </div>
      <div id="galeriaFiguras"></div>
    </div>
  `;

  const galeria = cont.querySelector("#galeriaFiguras");
  renderGaleriaFiguras(obtenerFigurasPlataforma(), galeria);

  cont.querySelector("#btnAgregarFigura").addEventListener("click", agregarFiguraPlataforma);
}

function initFiguras() {
  renderFiguras();
}
