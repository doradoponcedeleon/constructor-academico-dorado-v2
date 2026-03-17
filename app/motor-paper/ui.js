window.CADModules = window.CADModules || {};
window.CADModules['motor-paper'] = window.CADModules['motor-paper'] || {};
window.CADModules['motor-paper'].ui = window.CADModules['motor-paper'].ui || {};
if (typeof renderMotorPaper === 'function') {
  window.CADModules['motor-paper'].ui.render = renderMotorPaper;
}
