function limpiarTexto(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim();
}

function obtenerReferenciasLocal() {
  try {
    const refs = JSON.parse(localStorage.getItem("referencias") || "[]");
    return Array.isArray(refs) ? refs : [];
  } catch {
    return [];
  }
}

function formatearCitaBreve(ref) {
  const autor = ref.authors || ref.autor || "Autor";
  const anio = ref.year || ref.anio || "s.f.";
  return `(${autor.split(/[;,]/)[0].trim()}, ${anio})`;
}

function extraerPalabrasClave(texto) {
  const stop = new Set(["de","la","el","y","en","a","que","los","las","un","una","para","por","con","del","se","es","al","como","su","sus","más","menos","sobre"]);
  return limpiarTexto(texto).toLowerCase().split(" ").filter((w) => w.length > 3 && !stop.has(w)).slice(0, 10);
}

function enriquecerConectores(texto) {
  const conectores = [
    "Desde una perspectiva académica",
    "En términos analíticos",
    "A nivel conceptual",
    "En consecuencia",
    "De forma complementaria",
    "En este marco"
  ];
  const oraciones = limpiarTexto(texto).split(/(?<=[.!?])\s+/);
  return oraciones.map((o, i) => (i === 0 ? o : `${conectores[i % conectores.length]}, ${o.charAt(0).toLowerCase() + o.slice(1)}`)).join(" ");
}

function mejorarRedaccionLocal(texto) {
  const t = limpiarTexto(texto);
  if (!t) return "";
  const mejor = enriquecerConectores(t)
    .replace(/\bcosas\b/gi, "elementos")
    .replace(/\btema\b/gi, "tema de investigación")
    .replace(/\bproblema\b/gi, "problema de investigación");
  return `${mejor} Este planteamiento fortalece la coherencia argumentativa del apartado.`;
}

function resumirTextoLocal(texto) {
  const t = limpiarTexto(texto);
  if (!t) return "";
  const palabras = t.split(" ");
  return palabras.slice(0, 60).join(" ") + "...";
}

function ampliarTextoLocal(texto) {
  const t = limpiarTexto(texto);
  if (!t) return "";
  const refs = obtenerReferenciasLocal();
  const cita = refs.length ? formatearCitaBreve(refs[0]) : "";
  return `${t} Además, se incorporan antecedentes y fundamentos teóricos que permiten contextualizar la discusión. ${cita}`.trim();
}

function formalizarTextoLocal(texto) {
  const t = limpiarTexto(texto);
  if (!t) return "";
  return `Desde una perspectiva académica, ${t.charAt(0).toLowerCase() + t.slice(1)}`;
}

function generarConclusionLocal(texto) {
  const t = limpiarTexto(texto);
  if (!t) return "";
  return `En conclusión, ${t.charAt(0).toLowerCase() + t.slice(1)} evidencia la importancia del tema y orienta futuras líneas de investigación.`;
}

function aplicarReferenciasEnTexto(texto) {
  const refs = obtenerReferenciasLocal();
  if (!refs.length) return texto;
  const cita = formatearCitaBreve(refs[0]);
  const palabrasClave = extraerPalabrasClave(texto);
  if (!palabrasClave.length) return `${texto} ${cita}`.trim();
  return `${texto} ${cita}`.trim();
}

function mejorarConReferencias(texto) {
  const base = mejorarRedaccionLocal(texto);
  return aplicarReferenciasEnTexto(base);
}

function renderAsistenteRedaccion() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  const secciones = window.CADState?.editor?.secciones || [];
  const opciones = secciones.map((s, i) => `<option value="${i}">${s.titulo || "Sección"}</option>`).join("");

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Asistente de redacción</h2>
      <p>Mejora, resume o formaliza secciones del editor.</p>
      <div class="bitacora-form">
        <select id="arSeccion" class="input">${opciones}</select>
        <textarea id="arTexto" placeholder="Contenido original"></textarea>
        <button id="btnMejorar" class="btn">Mejorar redacción</button>
        <button id="btnResumir" class="btn">Resumir</button>
        <button id="btnAmpliar" class="btn">Ampliar</button>
        <button id="btnFormalizar" class="btn">Formalizar tono académico</button>
        <button id="btnConclusion" class="btn">Generar conclusión</button>
        <button id="btnAplicarRedaccion" class="btn">Aplicar al editor</button>
      </div>
      <div id="estadoAsistenteRedaccion" class="card"></div>
      <div id="arResultado" class="card"></div>
    </div>
  `;

  const select = cont.querySelector("#arSeccion");
  const texto = cont.querySelector("#arTexto");
  const resultado = cont.querySelector("#arResultado");
  const estado = cont.querySelector("#estadoAsistenteRedaccion");
  let salida = "";

  if (select && texto && secciones[select.value]) {
    texto.value = secciones[select.value].contenido || "";
  }

  if (select) {
    select.addEventListener("change", () => {
      const idx = parseInt(select.value, 10);
      texto.value = secciones[idx]?.contenido || "";
    });
  }

  const setSalida = (val, msg) => {
    salida = val;
    const safe = escapeHTML(salida);
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
    if (msg) window.setEstado(estado, msg, "estado-ok");
  };

  cont.querySelector("#btnMejorar").addEventListener("click", () => setSalida(mejorarConReferencias(texto.value), "Texto mejorado"));
  cont.querySelector("#btnResumir").addEventListener("click", () => setSalida(resumirTextoLocal(texto.value), "Resumen generado"));
  cont.querySelector("#btnAmpliar").addEventListener("click", () => setSalida(ampliarTextoLocal(texto.value), "Texto ampliado"));
  cont.querySelector("#btnFormalizar").addEventListener("click", () => setSalida(formalizarTextoLocal(texto.value), "Texto formalizado"));
  cont.querySelector("#btnConclusion").addEventListener("click", () => setSalida(generarConclusionLocal(texto.value), "Conclusión generada"));

  cont.querySelector("#btnAplicarRedaccion").addEventListener("click", () => {
    const idx = parseInt(select.value, 10);
    if (!window.CADState?.editor?.secciones || !window.CADState.editor.secciones[idx]) {
      window.setEstado(estado, "No hay sección válida", "estado-warn");
      return;
    }
    window.CADState.editor.secciones[idx].contenido = salida || texto.value;
    if (window.PEditor) PEditor.sections.lista = window.CADState.editor.secciones;
    if (window.CADCore?.storage?.guardarEstadoLocal) {
      CADCore.storage.guardarEstadoLocal(window.CADState);
    }
    if (typeof window.actualizarEditorVisual === "function") {
      window.actualizarEditorVisual();
    } else if (typeof renderEditor === "function") {
      renderEditor();
    }
    window.setEstado(estado, "Texto aplicado al editor", "estado-ok");
  });
}

function initAsistenteRedaccion() {
  renderAsistenteRedaccion();
}
