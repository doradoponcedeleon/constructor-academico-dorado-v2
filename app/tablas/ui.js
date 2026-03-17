window.CADModules = window.CADModules || {};
window.CADModules['tablas'] = window.CADModules['tablas'] || {};
window.CADModules['tablas'].ui = window.CADModules['tablas'].ui || {};
if (typeof renderTablas === 'function') {
  window.CADModules['tablas'].ui.render = renderTablas;
}
