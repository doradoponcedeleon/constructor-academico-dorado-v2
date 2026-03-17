window.CADModules = window.CADModules || {};
window.CADModules['sync-github'] = window.CADModules['sync-github'] || {};
window.CADModules['sync-github'].ui = window.CADModules['sync-github'].ui || {};
if (typeof renderSyncGithub === 'function') {
  window.CADModules['sync-github'].ui.render = renderSyncGithub;
}
