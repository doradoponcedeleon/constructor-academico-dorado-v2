window.CAD_CORE = {
  version: "2.0",
  locked: true,

  getDocumento: () => localStorage.getItem("documento_base") || "",

  setDocumento: (contenido) => {
    localStorage.setItem("documento_base", contenido);
  },

  getReferencias: () => JSON.parse(localStorage.getItem("referencias") || "[]"),

  log: (msg) => console.log("[CAD_CORE]", msg)
};
