window.PEditor = window.PEditor || {};

function initEditor() {
  if (!window.CADState) return;
  if (!window.CADState.editor) window.CADState.editor = { secciones: [] };
  PEditor.sections.lista = window.CADState.editor.secciones || [];
}

function renderEditor() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  if (!window.CADState) return;
  if (!window.CADState.editor) window.CADState.editor = { secciones: [] };

  const docEditor = localStorage.getItem("documento_editor") || "";
  const docBaseRaw = localStorage.getItem("documento_base") || "";

  if (!docEditor && !docBaseRaw && !window.CADState.editor.secciones.length) {
    window.CADState.editor.secciones = [{ titulo: "Introducción", contenido: "" }];
  }
  PEditor.sections.lista = window.CADState.editor.secciones;

  PEditor.renderer.render(cont, PEditor.sections.lista);

  const estado = cont.querySelector("#estadoEditor");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const editorEl = cont.querySelector("#editor");
  if (editorEl) {
    if (docEditor) {
      editorEl.value = docEditor;
    } else if (docBaseRaw) {
      editorEl.value = docBaseRaw;
      localStorage.setItem("documento_editor", docBaseRaw);
    }
  }

  const paper = localStorage.getItem("paper_base");
  if (paper && typeof window.sincronizarEditorConPaper === "function") {
    window.sincronizarEditorConPaper(paper);
  }

  const btnAgregar = cont.querySelector("#btnAgregarSeccion");
  const btnGuardar = cont.querySelector("#btnGuardarEditor");

  if (btnAgregar) btnAgregar.addEventListener("click", agregarSeccionEditor);
  if (btnGuardar) btnGuardar.addEventListener("click", guardarEditorLocal);

  cont.querySelectorAll("[data-action='subir']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"), 10);
      moverSeccionEditor(index, -1);
    });
  });

  cont.querySelectorAll("[data-action='bajar']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"), 10);
      moverSeccionEditor(index, 1);
    });
  });

  cont.querySelectorAll("[data-action='eliminar']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"), 10);
      eliminarSeccionEditor(index);
    });
  });

  cont.querySelectorAll(".input, .textarea").forEach((el) => {
    el.addEventListener("input", () => {
      const index = parseInt(el.getAttribute("data-index"), 10);
      const field = el.getAttribute("data-field");
      if (!Number.isNaN(index) && field) {
        PEditor.sections.lista[index][field] = el.value;
        window.CADState.editor.secciones = PEditor.sections.lista;
      }
    });
  });

  const editorBase = cont.querySelector("#editor");
  if (editorBase) {
    editorBase.addEventListener("input", () => {
      setEstado("Editando...", "estado-warn");
    });
  }
}

function agregarSeccionEditor() {
  PEditor.sections.agregar("Nueva sección", "");
  window.CADState.editor.secciones = PEditor.sections.lista;
  renderEditor();
}

function eliminarSeccionEditor(index) {
  PEditor.sections.eliminar(index);
  window.CADState.editor.secciones = PEditor.sections.lista;
  renderEditor();
}

function guardarEditorLocal() {
  const estado = document.getElementById("estadoEditor");
  window.setEstado(estado, "Generando...", "estado-warn");
  PEditor.sections.guardar(PEditor.sections.lista);
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
  const editorEl = document.getElementById("editor");
  const contenido = window.compilarDocumentoEditor
    ? window.compilarDocumentoEditor(editorEl ? editorEl.value : "", PEditor.sections.lista)
    : "";
  try {
    if (contenido) {
      localStorage.setItem("documento_editor", contenido);
    }
    window.setEstado(estado, "Guardado correctamente", "estado-ok");
  } catch (e) {
    window.setEstado(estado, "Error", "estado-error");
  }
}

function moverSeccionEditor(index, delta) {
  const lista = PEditor.sections.lista;
  const nuevoIndex = index + delta;
  if (nuevoIndex < 0 || nuevoIndex >= lista.length) return;
  const temp = lista[index];
  lista[index] = lista[nuevoIndex];
  lista[nuevoIndex] = temp;
  window.CADState.editor.secciones = lista;
  guardarEditorLocal();
  renderEditor();
}

function cargarEditorLocal() {
  if (!window.CADState) return;
  PEditor.sections.lista = PEditor.sections.cargar();
  window.CADState.editor.secciones = PEditor.sections.lista;
}
