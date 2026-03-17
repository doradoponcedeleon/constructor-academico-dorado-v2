window.CADModules = window.CADModules || {};
window.CADModules['motor-paper'] = window.CADModules['motor-paper'] || {};
window.CADModules['motor-paper'].logic = window.CADModules['motor-paper'].logic || {};
if (typeof initMotorPaper === 'function') {
  window.CADModules['motor-paper'].logic.init = initMotorPaper;
}
