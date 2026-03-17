window.CADModules = window.CADModules || {};
window.CADModules['revision'] = window.CADModules['revision'] || {};
window.CADModules['revision'].ui = window.CADModules['revision'].ui || {};
if (typeof renderRevision === 'function') {
  window.CADModules['revision'].ui.render = renderRevision;
}
