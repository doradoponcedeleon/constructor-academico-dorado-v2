window.CADModules = window.CADModules || {};
window.CADModules['asistente-redaccion'] = window.CADModules['asistente-redaccion'] || {};
window.CADModules['asistente-redaccion'].ui = window.CADModules['asistente-redaccion'].ui || {};
if (typeof renderAsistenteRedaccion === 'function') {
  window.CADModules['asistente-redaccion'].ui.render = renderAsistenteRedaccion;
}
