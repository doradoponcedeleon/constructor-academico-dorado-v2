window.CADLegal = window.CADLegal || {};

CADLegal.recursos = function(state) {
  const hallazgos = [];
  const figuras = state.figuras || [];
  const tablas = state.tablas || [];
  figuras.forEach((f, i) => {
    if (!f.fuente) hallazgos.push(`Figura ${i + 1} sin fuente.`);
  });
  tablas.forEach((t, i) => {
    if (!t.titulo) hallazgos.push(`Tabla ${i + 1} sin título.`);
  });
  return hallazgos;
};
