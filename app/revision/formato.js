function revisarFormatoPlataforma(state) {
  const obs = [];
  const refs = state.referencias || [];
  const figuras = state.figuras || [];
  const tablas = state.tablas || [];

  if (!refs.length) {
    obs.push({ tipo: "pendiente", mensaje: "No hay referencias registradas." });
  } else {
    obs.push({ tipo: "correcto", mensaje: "Referencias registradas." });
  }

  figuras.forEach((f, i) => {
    if (!f.fuente) {
      obs.push({ tipo: "revisar", mensaje: `Figura ${i + 1} sin fuente.` });
    }
  });

  tablas.forEach((t, i) => {
    if (!t.descripcion) {
      obs.push({ tipo: "revisar", mensaje: `Tabla ${i + 1} sin descripción.` });
    }
  });

  return obs;
}
