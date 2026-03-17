window.CADModules = window.CADModules || {};
window.CADModules['generador-tesis'] = window.CADModules['generador-tesis'] || {};
window.CADModules['generador-tesis'].ui = window.CADModules['generador-tesis'].ui || {};
if (typeof renderGeneradorTesis === 'function') {
  window.CADModules['generador-tesis'].ui.render = renderGeneradorTesis;
}
