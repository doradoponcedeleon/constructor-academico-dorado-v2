window.CADModules = window.CADModules || {};
window.CADModules['sync-github'] = window.CADModules['sync-github'] || {};
window.CADModules['sync-github'].logic = window.CADModules['sync-github'].logic || {};
if (typeof initSyncGithub === 'function') {
  window.CADModules['sync-github'].logic.init = initSyncGithub;
}
