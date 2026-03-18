window.CADCitas = window.CADCitas || {};

window.CADCitas.injector = {
  normalizarRefs(refs) {
    return (Array.isArray(refs) ? refs : []).map((r) => ({
      authors: String(r.authors || r.autor || "").trim(),
      year: String(r.year || r.anio || "").trim(),
      title: r.title || r.titulo || "",
      source: r.source || r.revista || "",
      url: r.url || r.doi || ""
    }));
  },

  filtrarValidas(refs) {
    return refs.filter((r) => r.authors && r.year);
  },

  construirCita(ref) {
    const authorsRaw = ref.authors || "";
    const year = ref.year || "";
    const autores = authorsRaw.split(";").map((a) => a.trim()).filter(Boolean);
    if (!autores.length || !year) return "";
    if (autores.length === 1) {
      const apellido = autores[0].split(" ").filter(Boolean).slice(-1)[0] || autores[0];
      return `(${apellido}, ${year})`;
    }
    if (autores.length === 2) {
      const a1 = autores[0].split(" ").filter(Boolean).slice(-1)[0] || autores[0];
      const a2 = autores[1].split(" ").filter(Boolean).slice(-1)[0] || autores[1];
      return `(${a1} & ${a2}, ${year})`;
    }
    const a1 = autores[0].split(" ").filter(Boolean).slice(-1)[0] || autores[0];
    return `(${a1} et al., ${year})`;
  },

  inyectar(texto, referencias) {
    const refsRaw = this.normalizarRefs(referencias);
    const validRefs = this.filtrarValidas(refsRaw);
    console.log("REFERENCIAS DISPONIBLES:", refsRaw.length);
    console.log("REFERENCIAS VALIDAS PARA INYECCION:", validRefs.length);
    if (!validRefs.length) return { texto, used: false };

    const lines = String(texto || "").split("\n");
    let refIndex = 0;
    let paraCount = 0;
    let lastRefIdx = -1;

    const out = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) return line;
      if (trimmed.length < 80) return line;

      paraCount += 1;
      if (paraCount % 3 !== 0) return line;

      let idx = refIndex % validRefs.length;
      if (idx === lastRefIdx && validRefs.length > 1) {
        idx = (idx + 1) % validRefs.length;
      }
      const ref = validRefs[idx];
      refIndex += 1;
      lastRefIdx = idx;
      const cita = this.construirCita(ref);
      if (!cita) return line;
      return `${line} ${cita}`;
    });

    console.log("CITAS INSERTADAS EN TEXTO");
    return { texto: out.join("\n"), used: true };
  }
};
