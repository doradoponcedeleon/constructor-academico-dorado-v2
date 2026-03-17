function mejorarRedaccionLocal(texto) {
  return texto.replace(/\s+/g, " ").trim() + " En conclusión, se refuerza el carácter académico del texto.";
}

function resumirTextoLocal(texto) {
  return texto.split(" ").slice(0, 40).join(" ") + "...";
}

function ampliarTextoLocal(texto) {
  return texto + " Además, se consideran antecedentes y fundamentos teóricos relevantes.";
}

function formalizarTextoLocal(texto) {
  return "Desde una perspectiva académica, " + texto;
}

function generarConclusionLocal(texto) {
  return "En conclusión, " + texto + " evidencia la importancia del tema.";
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

  cont.querySelector("#btnMejorar").addEventListener("click", () => setSalida(mejorarRedaccionLocal(texto.value), "Texto mejorado"));
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
