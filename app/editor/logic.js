window.CADModules = window.CADModules || {};
window.CADModules['editor'] = window.CADModules['editor'] || {};
window.CADModules['editor'].logic = window.CADModules['editor'].logic || {};
if (typeof initEditor === 'function') {
  window.CADModules['editor'].logic.init = initEditor;
}
