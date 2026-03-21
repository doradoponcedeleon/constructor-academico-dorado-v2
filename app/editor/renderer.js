window.PEditor = window.PEditor || {};

PEditor.renderer = {
  render(container, secciones) {
    container.innerHTML = `
      <div class="card">
        <h2>Editor</h2>
        <p class="muted">Editor académico modular</p>
        <div class="button-row">
          <button id="btnAgregarSeccion" class="btn">Agregar sección</button>
          <button id="btnGuardarEditor" class="btn">Guardar editor</button>
          <button id="btnLimpiarEditor" class="btn btn-peligro">Limpiar editor</button>
        </div>
        <div id="estadoEditor" class="card"></div>
        <div id="editorFuente" class="muted"></div>
      </div>
      <div class="card">
        <h3>Documento base</h3>
        <textarea id="editor" class="textarea" placeholder="Contenido generado"></textarea>
      </div>
      <div class="card">
        <h3>Vista final</h3>
        <button id="btnVistaFinalEditor" class="btn">Actualizar vista final</button>
        <div id="previewFinalEditor" class="card"></div>
      </div>
      <div id="seccionesEditor" class="editor-list"></div>
    `;

    const list = container.querySelector("#seccionesEditor");
    secciones.forEach((sec, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <input type="text" class="input" value="${sec.titulo}" data-index="${index}" data-field="titulo" />
        <textarea class="textarea" data-index="${index}" data-field="contenido">${sec.contenido}</textarea>
        <div class="button-row">
          <button class="btn" data-action="subir" data-index="${index}">↑ Subir</button>
          <button class="btn" data-action="bajar" data-index="${index}">↓ Bajar</button>
          <button class="btn btn-peligro" data-action="eliminar" data-index="${index}">Eliminar</button>
        </div>
      `;
      list.appendChild(card);
    });
  }
};
