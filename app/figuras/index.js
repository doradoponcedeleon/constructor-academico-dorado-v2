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

function construirBloqueFigura(fig) {
  const id = fig.id || `fig_${Date.now().toString(36)}`;
  const titulo = fig.titulo || "Figura";
  const descripcion = fig.descripcion || "";
  const fuente = fig.fuente || "";
  return [
    `### Figura: ${titulo}`,
    `[[FIGURA:${id}]]`,
    descripcion ? `*Descripción:* ${descripcion}` : "",
    fuente ? `*Fuente:* ${fuente}` : ""
  ].filter(Boolean).join("\n\n");
}

function insertarFiguraEnDocumento(fig, destino, posicion) {
  if (!fig.id) {
    fig.id = `fig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const lista = obtenerFigurasPlataforma();
    const idx = lista.findIndex((f) => f === fig || (f.imagen && f.imagen === fig.imagen));
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], id: fig.id };
      guardarFigurasPlataforma(lista);
    }
  }
  const bloque = construirBloqueFigura(fig);
  if (!bloque) return false;

  if (destino && destino.startsWith("seccion:")) {
    const idx = parseInt(destino.split(":")[1], 10);
    if (!Number.isNaN(idx) && window.PEditor?.sections?.lista?.[idx]) {
      const actual = window.PEditor.sections.lista[idx].contenido || "";
      window.PEditor.sections.lista[idx].contenido = [actual.trim(), bloque].filter(Boolean).join("\n\n");
      if (window.CADState?.editor) {
        window.CADState.editor.secciones = window.PEditor.sections.lista;
      }
      if (window.CADCore?.storage?.guardarEstadoLocal) {
        CADCore.storage.guardarEstadoLocal(window.CADState);
      }
      if (typeof window.compilarDocumentoEditor === "function") {
        const editorEl = document.getElementById("editor");
        const editorBase = editorEl ? editorEl.value : (localStorage.getItem("documento_editor") || "");
        const compilado = window.compilarDocumentoEditor(editorBase, window.PEditor.sections.lista);
        localStorage.setItem("documento_editor", compilado);
      }
      if (typeof window.actualizarEditorVisual === "function") {
        window.actualizarEditorVisual();
      }
      return true;
    }
  }

  const actual = localStorage.getItem("documento_editor") || "";
  const nuevo = posicion === "inicio"
    ? [bloque, actual.trim()].filter(Boolean).join("\n\n")
    : [actual.trim(), bloque].filter(Boolean).join("\n\n");
  localStorage.setItem("documento_editor", nuevo);
  if (typeof window.actualizarEditorVisual === "function") {
    window.actualizarEditorVisual();
  }
  return true;
}

function agregarFiguraPlataforma() {
  const titulo = document.getElementById("figTitulo").value.trim();
  const descripcion = document.getElementById("figDescripcion").value.trim();
  const fuente = document.getElementById("figFuente").value.trim();
  const archivo = document.getElementById("figArchivo").files[0];
  if (!titulo || !archivo) return;

  leerImagenFigura(archivo, (dataUrl) => {
    const lista = obtenerFigurasPlataforma();
    const id = `fig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    lista.unshift({ id, titulo, descripcion, fuente, imagen: dataUrl });
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
        <select id="figDestino" class="input">
          <option value="documento">Documento principal</option>
        </select>
        <select id="figPosicion" class="input">
          <option value="final">Insertar al final</option>
          <option value="inicio">Insertar al inicio</option>
        </select>
      </div>
      <div id="estadoFiguras" class="card"></div>
      <div id="galeriaFiguras"></div>
    </div>
  `;

  const galeria = cont.querySelector("#galeriaFiguras");
  const estado = cont.querySelector("#estadoFiguras");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const destino = cont.querySelector("#figDestino");
  if (destino && window.CADState?.editor?.secciones?.length) {
    window.CADState.editor.secciones.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = `seccion:${idx}`;
      opt.textContent = `Sección: ${s.titulo || `Sección ${idx + 1}`}`;
      destino.appendChild(opt);
    });
  }
  renderGaleriaFiguras(obtenerFigurasPlataforma(), galeria);

  cont.querySelector("#btnAgregarFigura").addEventListener("click", agregarFiguraPlataforma);

  cont.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-insert-fig]");
    if (!btn) return;
    const idx = parseInt(btn.getAttribute("data-insert-fig"), 10);
    const lista = obtenerFigurasPlataforma();
    const fig = lista[idx];
    if (!fig) return;
    const destinoVal = cont.querySelector("#figDestino")?.value || "documento";
    const posVal = cont.querySelector("#figPosicion")?.value || "final";
    const ok = insertarFiguraEnDocumento(fig, destinoVal, posVal);
    setEstado(ok ? "Figura insertada en el documento" : "No se pudo insertar la figura", ok ? "estado-ok" : "estado-error");
  });
}

function initFiguras() {
  renderFiguras();
}
