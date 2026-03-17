window.CADModules = window.CADModules || {};
window.CADModules['dashboard'] = window.CADModules['dashboard'] || {};
window.CADModules['dashboard'].ui = window.CADModules['dashboard'].ui || {};
if (typeof renderDashboard === 'function') {
  window.CADModules['dashboard'].ui.render = renderDashboard;
}
