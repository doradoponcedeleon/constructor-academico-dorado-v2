window.CADModules = window.CADModules || {};
window.CADModules['biblioteca'] = window.CADModules['biblioteca'] || {};
window.CADModules['biblioteca'].logic = window.CADModules['biblioteca'].logic || {};
if (typeof initBiblioteca === 'function') {
  window.CADModules['biblioteca'].logic.init = initBiblioteca;
}
