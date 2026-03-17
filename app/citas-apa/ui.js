window.CADModules = window.CADModules || {};
window.CADModules['citas-apa'] = window.CADModules['citas-apa'] || {};
window.CADModules['citas-apa'].ui = window.CADModules['citas-apa'].ui || {};
if (typeof renderCitasAPA === 'function') {
  window.CADModules['citas-apa'].ui.render = renderCitasAPA;
}
