window.CADState = {
  documentoActual: null,
  documentos: [],
  referencias: [],
  citas: [],
  figuras: [],
  tablas: [],
  bibliografia: [],
  revisiones: [],
  legal: [],
  versiones: [],
  configuracion: {
    area: "",
    tipo: ""
  }
};

function getState() {
  return window.CADState;
}

function normalizarEstado(data) {
  const base = window.CADState || {};
  const next = {
    ...base,
    ...data,
    configuracion: {
      ...(base.configuracion || {}),
      ...((data && data.configuracion) || {})
    }
  };

  const schemaDoc = (window.CADCore && CADCore.schema && CADCore.schema.documento)
    ? CADCore.schema.documento
    : {
        metadata: {
          titulo: "",
          area: "",
          tipo: "",
          autor: "",
          fecha: ""
        },
        secciones: [],
        referencias: [],
        citas: [],
        figuras: [],
        tablas: [],
        bibliografia: [],
        revisiones: [],
        legal: [],
        versiones: []
      };

  if (!next.documentoActual) {
    next.documentoActual = JSON.parse(JSON.stringify(schemaDoc));
  }

  next.documentoActual.metadata = {
    ...schemaDoc.metadata,
    ...(next.documentoActual.metadata || {})
  };

  const campos = ["secciones", "referencias", "citas", "figuras", "tablas", "bibliografia", "revisiones", "legal", "versiones"];
  campos.forEach((campo) => {
    if (data && data[campo] && (!next.documentoActual[campo] || !next.documentoActual[campo].length)) {
      next.documentoActual[campo] = data[campo];
    }
    if (next.documentoActual[campo] && (!next[campo] || !next[campo].length)) {
      next[campo] = next.documentoActual[campo];
    }
  });

  return next;
}

function setState(partial) {
  if (!partial || typeof partial !== "object") return;
  window.CADState = normalizarEstado(partial);
  if (window.CADCore && CADCore.storage && typeof CADCore.storage.guardarEstadoLocal === "function") {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function resetState() {
  const base = {
    documentoActual: null,
    documentos: [],
    referencias: [],
    citas: [],
    figuras: [],
    tablas: [],
    bibliografia: [],
    revisiones: [],
    legal: [],
    versiones: [],
    configuracion: {
      area: "",
      tipo: ""
    }
  };
  window.CADState = normalizarEstado(base);
  if (window.CADCore && CADCore.storage && typeof CADCore.storage.guardarEstadoLocal === "function") {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}
