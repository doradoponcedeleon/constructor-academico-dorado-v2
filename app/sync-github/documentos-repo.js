window.CADSync = window.CADSync || {};

function buildRepoUrl(path) {
  return `https://api.github.com/repos/${CADSync.api.owner}/${CADSync.api.repo}/contents/${path}`;
}

async function guardarDocumentoGitHubPlataforma() {
  const owner = CADSync.api.owner;
  const repo = CADSync.api.repo;
  const token = CADSync.api.token;
  const nombre = (document.getElementById("ghNombre")?.value || "").trim();
  if (!owner || !repo || !token) return { error: "Faltan credenciales." };
  if (!nombre) return { error: "Falta nombre de archivo." };

  const stateBase = typeof getState === "function" ? getState() : (window.CADState || {});
  const state = {
    ...stateBase,
    documentoActual: {
      ...(stateBase.documentoActual || {}),
      secciones: window.PEditor?.sections?.lista || stateBase.documentoActual?.secciones || []
    },
    referencias: typeof obtenerReferenciasPlataforma === "function" ? obtenerReferenciasPlataforma() : stateBase.referencias || [],
    figuras: typeof obtenerFigurasPlataforma === "function" ? obtenerFigurasPlataforma() : stateBase.figuras || [],
    tablas: typeof obtenerTablasPlataforma === "function" ? obtenerTablasPlataforma() : stateBase.tablas || []
  };

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));
  const url = buildRepoUrl(`documentos/${nombre}`);
  const res = await githubPut(url, token, {
    message: `Guardar documento ${nombre}`,
    content
  });
  return res.json();
}

async function listarDocumentosGitHubPlataforma() {
  const owner = CADSync.api.owner;
  const repo = CADSync.api.repo;
  const token = CADSync.api.token;
  if (!owner || !repo || !token) return { error: "Faltan credenciales." };
  const url = buildRepoUrl("documentos");
  const res = await githubGet(url, token);
  return res.json();
}

async function cargarDocumentoGitHubPlataforma(nombreArchivo) {
  const owner = CADSync.api.owner;
  const repo = CADSync.api.repo;
  const token = CADSync.api.token;
  if (!owner || !repo || !token) return { error: "Faltan credenciales." };
  if (!nombreArchivo) return { error: "Falta nombre de archivo." };

  const url = buildRepoUrl(`documentos/${nombreArchivo}`);
  const res = await githubGet(url, token);
  const file = await res.json();
  if (!file || !file.content) return { error: "Archivo no encontrado." };

  const decoded = decodeURIComponent(escape(atob(file.content)));
  return JSON.parse(decoded);
}

CADSync.documentos = {
  guardarDocumentoGitHubPlataforma,
  listarDocumentosGitHubPlataforma,
  cargarDocumentoGitHubPlataforma
};
