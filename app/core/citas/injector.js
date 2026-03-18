window.CADCitas = window.CADCitas || {};

window.CADCitas.injector = {
  normalizarRefs(refs) {
    return (Array.isArray(refs) ? refs : []).map((r) => ({
      authors: r.authors || r.autor || "",
      year: r.year || r.anio || "",
      title: r.title || r.titulo || "",
      source: r.source || r.revista || "",
      url: r.url || r.doi || ""
    })).filter((r) => r.authors || r.title);
  },

  construirCita(ref) {
    const autor = (ref.authors || "Autor").split(";")[0].trim();
    const year = ref.year || "s.f.";
    if (!autor) return `(Autor, ${year})`;
    if (autor.includes(",")) return `(${autor}, ${year})`;
    const parts = autor.split(" ").filter(Boolean);
    const apellido = parts.length ? parts[parts.length - 1] : autor;
    return `(${apellido}, ${year})`;
  },

  inyectar(texto, referencias) {
    const refs = this.normalizarRefs(referencias);
    if (!refs.length) return { texto, used: false };

    const lines = String(texto || "").split("\n");
    let refIndex = 0;
    let paraCount = 0;

    const out = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) return line;

      paraCount += 1;
      if (paraCount % 2 === 0) {
        const ref = refs[refIndex % refs.length];
        refIndex += 1;
        const cita = this.construirCita(ref);
        return `${line} ${cita}`;
      }
      return line;
    });

    return { texto: out.join("\n"), used: true };
  }
};
