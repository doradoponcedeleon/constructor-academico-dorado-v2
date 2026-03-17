window.CADModules = window.CADModules || {};
window.CADModules['hipotesis'] = window.CADModules['hipotesis'] || {};
window.CADModules['hipotesis'].ui = window.CADModules['hipotesis'].ui || {};
if (typeof renderHipotesis === 'function') {
  window.CADModules['hipotesis'].ui.render = renderHipotesis;
}
