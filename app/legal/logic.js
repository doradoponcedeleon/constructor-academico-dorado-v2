window.CADModules = window.CADModules || {};
window.CADModules['legal'] = window.CADModules['legal'] || {};
window.CADModules['legal'].logic = window.CADModules['legal'].logic || {};
if (typeof initLegal === 'function') {
  window.CADModules['legal'].logic.init = initLegal;
}
