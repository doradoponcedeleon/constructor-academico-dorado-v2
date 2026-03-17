window.CADModules = window.CADModules || {};
window.CADModules['legal'] = window.CADModules['legal'] || {};
window.CADModules['legal'].ui = window.CADModules['legal'].ui || {};
if (typeof renderLegal === 'function') {
  window.CADModules['legal'].ui.render = renderLegal;
}
