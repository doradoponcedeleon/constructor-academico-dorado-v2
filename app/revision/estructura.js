function revisarEstructuraPlataforma(secciones) {
  const obs = [];
  const nombres = (secciones || []).map((s) => (s.titulo || "").toLowerCase());

  if (!secciones || !secciones.length) {
    obs.push({ tipo: "pendiente", mensaje: "No hay secciones en el documento." });
    return obs;
  }

  const requeridas = ["introducción", "problema", "objetivos", "conclusiones"];
  requeridas.forEach((req) => {
    if (!nombres.some((n) => n.includes(req))) {
      obs.push({ tipo: "revisar", mensaje: `Falta sección: ${req}` });
    } else {
      obs.push({ tipo: "correcto", mensaje: `Sección presente: ${req}` });
    }
  });

  return obs;
}
