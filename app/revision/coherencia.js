function revisarCoherenciaPlataforma(secciones) {
  const obs = [];
  const objetivos = (secciones || []).find((s) => (s.titulo || "").toLowerCase().includes("objetivo"));
  const conclusiones = (secciones || []).find((s) => (s.titulo || "").toLowerCase().includes("conclusion"));

  if (objetivos && !conclusiones) {
    obs.push({ tipo: "revisar", mensaje: "Hay objetivos definidos pero no hay conclusiones." });
  } else if (objetivos && conclusiones) {
    obs.push({ tipo: "correcto", mensaje: "Objetivos y conclusiones presentes." });
  } else {
    obs.push({ tipo: "pendiente", mensaje: "No se identificaron objetivos ni conclusiones suficientes." });
  }

  return obs;
}
