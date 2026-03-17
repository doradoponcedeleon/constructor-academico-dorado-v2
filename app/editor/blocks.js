window.PEditor = window.PEditor || {};

PEditor.blocks = {
  tipos: ["texto"],
  crearBloqueTexto(contenido = "") {
    return { tipo: "texto", contenido };
  }
};
