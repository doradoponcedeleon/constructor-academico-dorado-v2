window.CADModules = window.CADModules || {};
window.CADModules['mapa-red'] = window.CADModules['mapa-red'] || {};
window.CADModules['mapa-red'].ui = window.CADModules['mapa-red'].ui || {};
if (typeof renderMapaRed === 'function') {
  window.CADModules['mapa-red'].ui.render = renderMapaRed;
}
