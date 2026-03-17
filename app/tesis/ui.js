window.CADModules = window.CADModules || {};
window.CADModules['tesis'] = window.CADModules['tesis'] || {};
window.CADModules['tesis'].ui = window.CADModules['tesis'].ui || {};
if (typeof renderTesis === 'function') {
  window.CADModules['tesis'].ui.render = renderTesis;
}
