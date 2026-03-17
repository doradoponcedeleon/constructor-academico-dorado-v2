window.CADLegal = window.CADLegal || {};

CADLegal.atribuciones = function(state) {
  const hallazgos = [];
  const referencias = state.referencias || [];
  referencias.forEach((r, i) => {
    if (!r.autor || !r.titulo || !r.anio || !r.fuente) {
      hallazgos.push(`Referencia ${i + 1} incompleta.`);
    }
  });
  return hallazgos;
};
