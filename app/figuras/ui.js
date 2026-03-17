window.CADModules = window.CADModules || {};
window.CADModules['figuras'] = window.CADModules['figuras'] || {};
window.CADModules['figuras'].ui = window.CADModules['figuras'].ui || {};
if (typeof renderFiguras === 'function') {
  window.CADModules['figuras'].ui.render = renderFiguras;
}
