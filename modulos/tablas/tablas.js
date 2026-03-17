window.insertarTabla = function(titulo, contenido) {
  const doc = localStorage.getItem("documento_base") || "";

  const tabla = `
  
  Tabla ${Date.now()}
  ${titulo}
  
  ${contenido}
  
  `;

  localStorage.setItem("documento_base", doc + tabla);
};
