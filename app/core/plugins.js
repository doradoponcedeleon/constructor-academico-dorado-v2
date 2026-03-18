(function () {
  const root = window.CADPlugins = window.CADPlugins || {};

  root.plugins = root.plugins || {};
  root.registrar = root.registrar || function registrar(nombre, plugin) {
    if (!nombre || !plugin) return false;
    this.plugins[nombre] = plugin;
    return true;
  };
  root.obtener = root.obtener || function obtener(nombre) {
    return this.plugins[nombre] || null;
  };
  root.ejecutar = root.ejecutar || function ejecutar(nombre, contexto) {
    const plugin = this.obtener(nombre);
    if (!plugin || typeof plugin.run !== "function") return null;
    return plugin.run(contexto);
  };

  root.modules = root.modules || {};
  root.estado = root.estado || {
    habilitados: {},
    cargados: {},
    preferenciaKey: "cad_modulos"
  };
  root._loadedScripts = root._loadedScripts || new Set();

  root._resolveSrc = function _resolveSrc(mod, file) {
    if (!file) return "";
    if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("/")) {
      return file;
    }
    if (mod && mod.basePath) {
      const base = mod.basePath.replace(/\/$/, "");
      return `${base}/${file}`;
    }
    return file;
  };

  root._cargarScript = function _cargarScript(src) {
    if (!src) return Promise.resolve(false);
    if (this._loadedScripts.has(src)) return Promise.resolve(true);
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        this._loadedScripts.add(src);
        resolve(true);
      };
      script.onerror = () => {
        console.warn(`CADPlugins: fallo al cargar ${src}`);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  };

  root.registrarModulo = function registrarModulo(def) {
    if (!def || !def.id) return false;
    const base = {
      enabled: true,
      orden: 100,
      basePath: "",
      scripts: []
    };
    const mod = { ...base, ...def };
    this.modules[mod.id] = mod;
    if (!(mod.id in this.estado.habilitados)) {
      this.estado.habilitados[mod.id] = mod.enabled !== false;
    }
    return true;
  };

  root.registrarModulos = function registrarModulos(lista) {
    (Array.isArray(lista) ? lista : []).forEach((def) => this.registrarModulo(def));
  };

  root.cargarPreferencias = function cargarPreferencias() {
    try {
      const raw = localStorage.getItem(this.estado.preferenciaKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      Object.keys(data).forEach((id) => {
        this.estado.habilitados[id] = Boolean(data[id]);
      });
    } catch (err) {
      console.warn("CADPlugins: no se pudieron leer preferencias", err);
    }
  };

  root.guardarPreferencias = function guardarPreferencias() {
    try {
      localStorage.setItem(this.estado.preferenciaKey, JSON.stringify(this.estado.habilitados));
    } catch (err) {
      console.warn("CADPlugins: no se pudieron guardar preferencias", err);
    }
  };

  root.activar = function activar(id) {
    if (!this.modules[id]) return false;
    this.estado.habilitados[id] = true;
    this.guardarPreferencias();
    return this.cargarModulo(id);
  };

  root.desactivar = function desactivar(id) {
    if (!this.modules[id]) return false;
    this.estado.habilitados[id] = false;
    this.guardarPreferencias();
    return true;
  };

  root.cargarModulo = function cargarModulo(id) {
    const mod = this.modules[id];
    if (!mod) return Promise.reject(new Error(`Módulo no registrado: ${id}`));
    if (this.estado.cargados[id]) return Promise.resolve(mod);
    if (mod._loadingPromise) return mod._loadingPromise;

    const scripts = Array.isArray(mod.scripts) ? mod.scripts : [];
    mod._loadingPromise = scripts
      .reduce((p, file) => p.then(() => this._cargarScript(this._resolveSrc(mod, file))), Promise.resolve())
      .then(() => {
        this.estado.cargados[id] = true;
        return mod;
      })
      .finally(() => {
        mod._loadingPromise = null;
      });

    return mod._loadingPromise;
  };

  root.cargarModulosIniciales = function cargarModulosIniciales() {
    this.cargarPreferencias();
    const ids = Object.keys(this.modules)
      .filter((id) => this.estado.habilitados[id]);

    ids.sort((a, b) => (this.modules[a].orden || 0) - (this.modules[b].orden || 0));

    return ids.reduce((p, id) => p.then(() => this.cargarModulo(id)), Promise.resolve());
  };
})();

window.CADPlugins.registrarModulos([
  {
    id: "core",
    basePath: "core",
    orden: 1,
    scripts: [
      "config.js",
      "utils.js",
      "schema.js",
      "storage.js",
      "index.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "editor",
    basePath: "editor",
    orden: 10,
    scripts: [
      "index.js",
      "sections.js",
      "blocks.js",
      "renderer.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "referencias",
    basePath: "referencias",
    orden: 20,
    scripts: [
      "index.js",
      "citas.js",
      "bibliografia.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "figuras",
    basePath: "figuras",
    orden: 30,
    scripts: [
      "index.js",
      "uploader.js",
      "gallery.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "tablas",
    basePath: "tablas",
    orden: 40,
    scripts: [
      "index.js",
      "table-builder.js",
      "table-renderer.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "biblioteca",
    basePath: "biblioteca",
    orden: 50,
    scripts: [
      "index.js",
      "documentos.js",
      "buscador.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "versiones",
    basePath: "versiones",
    orden: 60,
    scripts: [
      "index.js",
      "historial.js",
      "snapshots.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "exportadores",
    basePath: "exportadores",
    orden: 70,
    scripts: [
      "index.js",
      "exportar-pdf.js",
      "exportar-docx.js",
      "exportar-html.js",
      "exportar-txt.js",
      "exportar-json.js",
      "google-drive.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "motor-ideas",
    basePath: "motor-ideas",
    orden: 80,
    scripts: [
      "index.js",
      "analizador.js",
      "generador.js",
      "prompts-base.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "motor-paper",
    basePath: "motor-paper",
    orden: 90,
    scripts: [
      "index.js",
      "generador-paper.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "buscador-papers",
    basePath: "buscador-papers",
    orden: 100,
    scripts: [
      "index.js",
      "buscador.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "citas-apa",
    basePath: "citas-apa",
    orden: 110,
    scripts: [
      "index.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "asistente-redaccion",
    basePath: "asistente-redaccion",
    orden: 120,
    scripts: [
      "index.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "generador-tesis",
    basePath: "generador-tesis",
    orden: 125,
    scripts: [
      "index.js",
      "generador-tesis.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "marco-teorico",
    basePath: "marco-teorico",
    orden: 127,
    scripts: [
      "index.js",
      "generador-marco.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "mapa-literatura",
    basePath: "mapa-literatura",
    orden: 128,
    scripts: [
      "index.js",
      "generador-mapa.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "mapa-red",
    basePath: "mapa-red",
    orden: 129,
    scripts: [
      "index.js",
      "red-literatura.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "estado-arte",
    basePath: "estado-arte",
    orden: 129.5,
    scripts: [
      "index.js",
      "generador-estado.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "vacios-investigacion",
    basePath: "vacios-investigacion",
    orden: 129.7,
    scripts: [
      "index.js",
      "generador-vacios.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "hipotesis",
    basePath: "hipotesis",
    orden: 129.9,
    scripts: [
      "index.js",
      "generador-hipotesis.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "metodologia",
    basePath: "metodologia",
    orden: 129.95,
    scripts: [
      "index.js",
      "generador-metodologia.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "articulo-cientifico",
    basePath: "articulo-cientifico",
    orden: 129.97,
    scripts: [
      "index.js",
      "generador-articulo.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "temas-investigacion",
    basePath: "temas-investigacion",
    orden: 129.98,
    scripts: [
      "index.js",
      "generador-temas.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "tendencias-cientificas",
    basePath: "tendencias-cientificas",
    orden: 129.99,
    scripts: [
      "index.js",
      "generador-tendencias.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "hub-investigacion",
    basePath: "hub-investigacion",
    orden: 129.995,
    scripts: [
      "index.js",
      "hub-investigacion.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "dashboard",
    basePath: "dashboard",
    orden: 129.997,
    scripts: [
      "index.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "tesis",
    basePath: "tesis",
    orden: 130,
    scripts: [
      "index.js",
      "generador-tesis.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "revision",
    basePath: "revision",
    orden: 140,
    scripts: [
      "index.js",
      "estructura.js",
      "coherencia.js",
      "formato.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "legal",
    basePath: "legal",
    orden: 150,
    scripts: [
      "index.js",
      "recursos.js",
      "atribuciones.js",
      "ui.js",
      "logic.js"
    ]
  },
  {
    id: "sync-github",
    basePath: "sync-github",
    orden: 160,
    scripts: [
      "index.js",
      "github-api.js",
      "documentos-repo.js",
      "ui.js",
      "logic.js"
    ]
  }
]);

function cargarPluginsDesdeManifest() {
  const manifestUrl = "plugins/manifest.json";
  return fetch(manifestUrl)
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar el manifest de plugins");
      return res.json();
    })
    .then((data) => {
      const lista = Array.isArray(data.plugins) ? data.plugins : [];
      if (!lista.length) {
        console.info("CADPlugins: manifest vacío.");
        return [];
      }
      const cargas = lista.map((src) => new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
          console.info(`CADPlugins: cargado ${src}`);
          resolve({ src, ok: true });
        };
        script.onerror = () => {
          console.warn(`CADPlugins: fallo al cargar ${src}`);
          resolve({ src, ok: false });
        };
        document.head.appendChild(script);
      }));
      return Promise.all(cargas);
    })
    .catch((err) => {
      console.warn("CADPlugins: error al cargar manifest", err);
      return [];
    });
}
