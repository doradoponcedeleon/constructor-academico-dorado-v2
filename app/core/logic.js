window.CADModules = window.CADModules || {};
window.CADModules['core'] = window.CADModules['core'] || {};
window.CADModules['core'].logic = window.CADModules['core'].logic || {};
if (typeof initCore === 'function') {
  window.CADModules['core'].logic.init = initCore;
}
