window.addEventListener("DOMContentLoaded", () => {
  const iniciar = () => {
    if (typeof initCore === "function") {
      initCore();
    }
    if (typeof initEditor === "function") {
      initEditor();
    }
    if (typeof initRouter === "function") {
      initRouter();
    }
    if (typeof mostrarPanel === "function") {
      mostrarPanel("panelEditor");
    }
  };

  if (window.CADPlugins && typeof CADPlugins.cargarModulosIniciales === "function") {
    CADPlugins.cargarModulosIniciales()
      .then(iniciar)
      .catch((err) => {
        console.warn("CADPlugins: error al cargar módulos", err);
        iniciar();
      });
  } else {
    iniciar();
  }
});
