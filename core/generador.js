window.generarDocumento = function(tipo) {
  const base = localStorage.getItem("documento_base") || "";
  const refs = JSON.parse(localStorage.getItem("referencias") || "[]");

  let estructura = "";

  switch(tipo) {
    case "tesis":
      estructura = "Introducción\nMarco teórico\nMetodología\nResultados\nConclusiones";
      break;

    case "reporte":
      estructura = "Objetivo\nMateriales\nProcedimiento\nResultados\nConclusiones";
      break;

    case "informe":
      estructura = "Resumen\nAnálisis\nDiscusión\nConclusiones";
      break;

    default:
      estructura = "Contenido académico";
  }

  const final = `
  ${estructura}
  
  ${base}
  
  Referencias:
  ${refs.map(r => r.titulo).join("\n")}
  `;

  localStorage.setItem("documento_final", final);

  return final;
};
