window.actualizarEditorVisual = function () {
  logCAD("actualizarEditorVisual");
  if (window.PEditor?.renderer && window.CADState?.editor?.secciones) {
    const cont = document.getElementById("panelContenido");
    if (cont) {
      PEditor.renderer.render(cont, window.CADState.editor.secciones);
      return;
    }
  }
  if (typeof renderEditor === "function") {
    renderEditor();
  }
};
