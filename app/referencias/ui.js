window.CADModules = window.CADModules || {};
window.CADModules['referencias'] = window.CADModules['referencias'] || {};
window.CADModules['referencias'].ui = window.CADModules['referencias'].ui || {};
if (typeof renderReferencias === 'function') {
  window.CADModules['referencias'].ui.render = renderReferencias;
}
