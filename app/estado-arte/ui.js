window.CADModules = window.CADModules || {};
window.CADModules['estado-arte'] = window.CADModules['estado-arte'] || {};
window.CADModules['estado-arte'].ui = window.CADModules['estado-arte'].ui || {};
if (typeof renderEstadoArte === 'function') {
  window.CADModules['estado-arte'].ui.render = renderEstadoArte;
}
