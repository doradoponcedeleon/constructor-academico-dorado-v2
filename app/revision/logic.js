window.CADModules = window.CADModules || {};
window.CADModules['revision'] = window.CADModules['revision'] || {};
window.CADModules['revision'].logic = window.CADModules['revision'].logic || {};
if (typeof initRevision === 'function') {
  window.CADModules['revision'].logic.init = initRevision;
}
