window.CADDebug = true;
window.logCAD = function (...args) {
  if (window.CADDebug) console.log("[CAD]", ...args);
};

window.safeGetJSON = function (key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return data ?? fallback;
  } catch (e) {
    logCAD("safeGetJSON error", key, e);
    return fallback;
  }
};

window.safeSetJSON = function (key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    logCAD("safeSetJSON error", key, e);
    return false;
  }
};

window.escapeHTML = function (str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

window.getEditorSectionsSafe = function () {
  if (!window.CADState) return [];
  if (!window.CADState.editor) window.CADState.editor = { secciones: [] };
  if (!Array.isArray(window.CADState.editor.secciones)) {
    window.CADState.editor.secciones = [];
  }
  return window.CADState.editor.secciones;
};

window.setEstado = function (el, msg, type) {
  if (!el) return;
  el.textContent = msg || "";
  el.classList.remove("estado-ok", "estado-warn", "estado-error");
  if (type) el.classList.add(type);
};

window.parseDocumentoBase = function () {
  const raw = localStorage.getItem("documento_base");
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data && typeof data === "object") return data;
  } catch (e) {
    return { raw };
  }
  return null;
};

window.documentoBaseToMarkdown = function (doc) {
  if (!doc) return "";
  if (doc.raw) return String(doc.raw);
  const partes = [];
  if (doc.tema) partes.push(`# ${doc.tema}`);
  if (doc.introduccion) partes.push(`## Introducción\n${doc.introduccion}`);
  if (doc.problema) partes.push(`## Problema\n${doc.problema}`);
  if (doc.objetivos) partes.push(`## Objetivos\n${doc.objetivos}`);
  return partes.join("\n\n").trim();
};

window.documentoBaseToSecciones = function (doc) {
  if (!doc) return [];
  if (doc.raw) {
    return [{ titulo: "Documento base", contenido: String(doc.raw) }];
  }
  const secciones = [];
  if (doc.introduccion) secciones.push({ titulo: "Introducción", contenido: doc.introduccion });
  if (doc.problema) secciones.push({ titulo: "Problema", contenido: doc.problema });
  if (doc.objetivos) secciones.push({ titulo: "Objetivos", contenido: doc.objetivos });
  return secciones;
};

window.compilarDocumentoEditor = function (editorValor, secciones) {
  const bloques = [];
  if (editorValor) bloques.push(String(editorValor).trim());
  (Array.isArray(secciones) ? secciones : []).forEach((s) => {
    if (!s) return;
    const titulo = s.titulo ? String(s.titulo).trim() : "Sección";
    const contenido = s.contenido ? String(s.contenido).trim() : "";
    bloques.push(`## ${titulo}\n\n${contenido}`.trim());
  });
  return bloques.filter(Boolean).join("\n\n").trim();
};

window.appendDocumentoEditor = function (texto) {
  const actual = localStorage.getItem("documento_editor") || "";
  const nuevo = [actual.trim(), String(texto || "").trim()].filter(Boolean).join("\n\n");
  localStorage.setItem("documento_editor", nuevo);
  return nuevo;
};

window.obtenerDocumentoFinalPlataforma = function () {
  const secciones = window.CADState?.editor?.secciones || [];
  const editorEl = document.getElementById("editor");
  const editorBase = editorEl ? editorEl.value : (localStorage.getItem("documento_editor") || "");
  let contenido = "";

  if (typeof window.compilarDocumentoEditor === "function") {
    contenido = window.compilarDocumentoEditor(editorBase, secciones);
  } else {
    contenido = editorBase || "";
  }

  if (!contenido) {
    contenido = localStorage.getItem("documento_editor")
      || localStorage.getItem("documento_base")
      || "";
  }

  let citas = [];
  try {
    citas = JSON.parse(localStorage.getItem("citas_apa") || "[]");
  } catch {
    citas = [];
  }
  if (citas.length && !/##\s*Citas APA/i.test(contenido)) {
    contenido += "\n\n## Citas APA\n\n" + citas.join("\n");
  }

  localStorage.setItem("documento_final", contenido);
  return contenido;
};

window.renderDocumentoPreviewHTML = function (texto) {
  const raw = String(texto || "");
  const safe = raw.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const withImgs = safe.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const cleanAlt = String(alt || "").replace(/"/g, "&quot;");
    const cleanSrc = String(src || "").replace(/"/g, "&quot;");
    return `<img src="${cleanSrc}" alt="${cleanAlt}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`;
  });
  return withImgs.replace(/\n/g, "<br/>");
};
