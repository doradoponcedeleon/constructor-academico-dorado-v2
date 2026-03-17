window.CADModules = window.CADModules || {};
window.CADModules['motor-ideas'] = window.CADModules['motor-ideas'] || {};
window.CADModules['motor-ideas'].ui = window.CADModules['motor-ideas'].ui || {};
if (typeof renderMotorIdeas === 'function') {
  window.CADModules['motor-ideas'].ui.render = renderMotorIdeas;
}
