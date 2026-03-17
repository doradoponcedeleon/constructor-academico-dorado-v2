window.CADModules = window.CADModules || {};
window.CADModules['versiones'] = window.CADModules['versiones'] || {};
window.CADModules['versiones'].ui = window.CADModules['versiones'].ui || {};
if (typeof renderVersiones === 'function') {
  window.CADModules['versiones'].ui.render = renderVersiones;
}
