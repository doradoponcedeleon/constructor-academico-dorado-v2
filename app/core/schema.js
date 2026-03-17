window.CADCore = window.CADCore || {};

CADCore.schema = {
  CADState: {
    metadata: {
      titulo: "",
      autor: "",
      area: "",
      tipo: "",
      fechaCreacion: ""
    },
    editor: {
      secciones: []
    },
    referencias: [],
    figuras: [],
    tablas: [],
    biblioteca: [],
    versiones: [],
    revision: {
      resultados: []
    },
    legal: {
      observaciones: []
    }
  }
};
