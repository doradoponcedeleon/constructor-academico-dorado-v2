window.CADModules = window.CADModules || {};
window.CADModules['exportadores'] = window.CADModules['exportadores'] || {};
window.CADModules['exportadores'].ui = window.CADModules['exportadores'].ui || {};
if (typeof renderExportadores === 'function') {
  window.CADModules['exportadores'].ui.render = renderExportadores;
}
