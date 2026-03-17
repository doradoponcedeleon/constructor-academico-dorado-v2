window.CADModules = window.CADModules || {};
window.CADModules['mapa-literatura'] = window.CADModules['mapa-literatura'] || {};
window.CADModules['mapa-literatura'].ui = window.CADModules['mapa-literatura'].ui || {};
if (typeof renderMapaLiteratura === 'function') {
  window.CADModules['mapa-literatura'].ui.render = renderMapaLiteratura;
}
