window.CADModules = window.CADModules || {};
window.CADModules['buscador-papers'] = window.CADModules['buscador-papers'] || {};
window.CADModules['buscador-papers'].ui = window.CADModules['buscador-papers'].ui || {};
if (typeof renderBuscadorPapers === 'function') {
  window.CADModules['buscador-papers'].ui.render = renderBuscadorPapers;
}
