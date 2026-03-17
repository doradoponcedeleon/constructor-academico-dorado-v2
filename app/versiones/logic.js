window.CADModules = window.CADModules || {};
window.CADModules['versiones'] = window.CADModules['versiones'] || {};
window.CADModules['versiones'].logic = window.CADModules['versiones'].logic || {};
if (typeof initVersiones === 'function') {
  window.CADModules['versiones'].logic.init = initVersiones;
}
