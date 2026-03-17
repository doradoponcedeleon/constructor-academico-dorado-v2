window.insertarFigura = function(titulo, descripcion, url) {
  const doc = localStorage.getItem("documento_base") || "";

  const figura = `
  
  Figura ${Date.now()}
  ${titulo}
  ${descripcion}
  [Imagen: ${url}]
  
  `;

  localStorage.setItem("documento_base", doc + figura);
};
