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
