window.CADModules = window.CADModules || {};
window.CADModules['dashboard'] = window.CADModules['dashboard'] || {};
window.CADModules['dashboard'].logic = window.CADModules['dashboard'].logic || {};
if (typeof initDashboard === 'function') {
  window.CADModules['dashboard'].logic.init = initDashboard;
}
