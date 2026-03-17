window.CADModules = window.CADModules || {};
window.CADModules['biblioteca'] = window.CADModules['biblioteca'] || {};
window.CADModules['biblioteca'].ui = window.CADModules['biblioteca'].ui || {};
if (typeof renderBiblioteca === 'function') {
  window.CADModules['biblioteca'].ui.render = renderBiblioteca;
}
