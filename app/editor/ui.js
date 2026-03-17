window.CADModules = window.CADModules || {};
window.CADModules['editor'] = window.CADModules['editor'] || {};
window.CADModules['editor'].ui = window.CADModules['editor'].ui || {};
if (typeof renderEditor === 'function') {
  window.CADModules['editor'].ui.render = renderEditor;
}
