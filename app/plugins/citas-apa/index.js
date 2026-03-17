if (window.CADPlugins && typeof CADPlugins.registrar === "function") {
  CADPlugins.registrar("citas-apa", {
    nombre: "Citas APA",
    version: "1.0",
    run(contexto) {
      const ref = (contexto && contexto.referencia) ? contexto.referencia : {};
      return (ref.autor || "") + " (" + (ref.anio || "") + "). " +
             (ref.titulo || "") + ". " +
             (ref.fuente || "");
    }
  });
}
