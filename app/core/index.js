window.CADCore = window.CADCore || {};

function initCore() {
  if (!CADCore.schema || !CADCore.config || !CADCore.utils || !CADCore.storage) {
    console.warn("Core incompleto");
    return;
  }

  if (!window.CADPlugins) {
    window.CADPlugins = {
      plugins: {},
      registrar(nombre, plugin) {
        if (!nombre || !plugin) return false;
        this.plugins[nombre] = plugin;
        return true;
      },
      obtener(nombre) {
        return this.plugins[nombre] || null;
      },
      ejecutar(nombre, contexto) {
        const plugin = this.obtener(nombre);
        if (!plugin || typeof plugin.run !== "function") return null;
        return plugin.run(contexto);
      }
    };
  }

  if (typeof cargarPluginsDesdeManifest === "function") {
    cargarPluginsDesdeManifest();
  }

  const base = CADCore.utils.clonarObjeto(CADCore.schema.CADState);
  if (!base.metadata.fechaCreacion) {
    base.metadata.fechaCreacion = CADCore.utils.fechaActual();
  }

  const saved = CADCore.storage.cargarEstadoLocal();

  if (!window.CADState) {
    window.CADState = CADCore.utils.clonarObjeto(base);
  }

  if (saved && typeof saved === "object") {
    window.CADState = {
      ...base,
      ...saved,
      metadata: {
        ...base.metadata,
        ...(saved.metadata || {})
      },
      editor: {
        ...base.editor,
        ...(saved.editor || {})
      },
      revision: {
        ...base.revision,
        ...(saved.revision || {})
      },
      legal: {
        ...base.legal,
        ...(saved.legal || {})
      }
    };
  } else {
    window.CADState = { ...base, ...window.CADState };
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}
