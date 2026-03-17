function renderGeneradorTesis() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Generador de tesis</h2>
      <p>Genera estructura y capítulos académicos.</p>
      <div class="bitacora-form">
        <input id="tesisTema" type="text" placeholder="Tema de investigación" />
        <input id="tesisTitulo" type="text" placeholder="Título" />
        <input id="tesisAutor" type="text" placeholder="Autor" />
        <input id="tesisCarrera" type="text" placeholder="Carrera" />
        <input id="tesisUniversidad" type="text" placeholder="Universidad" />
        <input id="tesisLinea" type="text" placeholder="Línea de investigación" />
        <input id="tesisObjetivo" type="text" placeholder="Objetivo" />
        <select id="tesisNivel" class="input">
          <option value="Licenciatura">Licenciatura</option>
          <option value="Maestría">Maestría</option>
          <option value="Doctorado">Doctorado</option>
        </select>
        <select id="tesisArea" class="input">
          <option value="Ingeniería">Ingeniería</option>
          <option value="Educación">Educación</option>
          <option value="Medicina">Medicina</option>
          <option value="Ciencias Sociales">Ciencias Sociales</option>
          <option value="Humanidades">Humanidades</option>
          <option value="Administración">Administración</option>
          <option value="Otro">Otro</option>
        </select>
        <select id="tesisSeccion" class="input">
          <option value="">Seleccionar sección</option>
        </select>
        <button id="btnGenerarEstructura" class="btn">Generar estructura de tesis</button>
        <button id="btnGenerarCapitulo" class="btn">Generar capítulo</button>
        <button id="btnGenerarCapituloExtendido" class="btn">Generar capítulo extendido</button>
        <button id="btnGenerarMarcoTeorico" class="btn">Generar marco teórico automático</button>
        <button id="btnGenerarTesisCompleta" class="btn">Generar tesis completa</button>
        <button id="btnEnviarTesis" class="btn">Enviar al editor</button>
      </div>
      <div id="estadoGeneradorTesis" class="card"></div>
      <div id="resultadoGeneradorTesis" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoGeneradorTesis");
  const resultado = cont.querySelector("#resultadoGeneradorTesis");
  const seccionSelect = cont.querySelector("#tesisSeccion");

  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const cargarBaseGuardada = () => {
    const base = safeGetJSON("tesis_base", null);
    if (base && base.estructura && seccionSelect) {
      seccionSelect.innerHTML = "<option value=\"\">Seleccionar sección</option>" +
        base.estructura.map((s) => `<option value=\"${escapeHTML(s.titulo)}\">${escapeHTML(s.titulo)}</option>`).join("");
      if (resultado && base.markdown) {
        const safe = base.markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        resultado.innerHTML = `<pre>${safe}</pre>`;
      }
    }
  };

  cont.querySelector("#btnGenerarEstructura").addEventListener("click", () => {
    const data = {
      tema: (document.getElementById("tesisTema")?.value || "").trim(),
      nivel: (document.getElementById("tesisNivel")?.value || "").trim(),
      area: (document.getElementById("tesisArea")?.value || "").trim()
    };

    const estructura = construirEstructuraTesis(data);
    safeSetJSON("tesis_base", estructura);

    if (seccionSelect) {
      seccionSelect.innerHTML = "<option value=\"\">Seleccionar sección</option>" +
        estructura.estructura.map((s) => `<option value=\"${escapeHTML(s.titulo)}\">${escapeHTML(s.titulo)}</option>`).join("");
    }

    const safe = estructura.markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
    setEstado("Estructura generada", "estado-ok");
  });

  cont.querySelector("#btnGenerarCapitulo").addEventListener("click", () => {
    const base = safeGetJSON("tesis_base", null);
    const seccion = (document.getElementById("tesisSeccion")?.value || "").trim();
    if (!seccion) {
      setEstado("Selecciona una sección", "estado-warn");
      return;
    }

    const tema = (document.getElementById("tesisTema")?.value || base?.tema || "").trim();
    const nivel = (document.getElementById("tesisNivel")?.value || base?.nivel || "").trim();
    const area = (document.getElementById("tesisArea")?.value || base?.area || "").trim();
    const referencias = safeGetJSON("referencias", []);
    const ideasBase = localStorage.getItem("documento_base") || "";

    const texto = construirTextoCapitulo({
      seccion,
      tema,
      nivel,
      area,
      referencias,
      ideasBase
    });

    const capitulos = safeGetJSON("tesis_capitulos", {});
    capitulos[seccion] = texto;
    safeSetJSON("tesis_capitulos", capitulos);

    const safe = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
    setEstado("Capítulo generado", "estado-ok");
  });

  cont.querySelector("#btnGenerarCapituloExtendido").addEventListener("click", () => {
    const seccion = (document.getElementById("tesisSeccion")?.value || "").trim();
    if (!seccion) {
      setEstado("Selecciona una sección", "estado-warn");
      return;
    }
    const texto = generarCapituloExtendido(seccion);
    const safe = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
    setEstado("Capítulo extendido generado", "estado-ok");
  });

  cont.querySelector("#btnGenerarMarcoTeorico").addEventListener("click", () => {
    const texto = generarMarcoTeoricoAutomatico();
    const safe = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
    setEstado("Marco teórico generado", "estado-ok");
  });

  cont.querySelector("#btnGenerarTesisCompleta").addEventListener("click", () => {
    const data = {
      titulo: (document.getElementById("tesisTitulo")?.value || "").trim(),
      autor: (document.getElementById("tesisAutor")?.value || "").trim(),
      carrera: (document.getElementById("tesisCarrera")?.value || "").trim(),
      universidad: (document.getElementById("tesisUniversidad")?.value || "").trim(),
      linea: (document.getElementById("tesisLinea")?.value || "").trim(),
      objetivo: (document.getElementById("tesisObjetivo")?.value || "").trim()
    };

    const doc = generarTesisCompleta(data);
    const safe = doc.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;

    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(doc);
      setEstado("Tesis completa generada y enviada al editor", "estado-ok");
    } else {
      setEstado("Tesis completa generada", "estado-ok");
    }
  });

  cont.querySelector("#btnEnviarTesis").addEventListener("click", () => {
    const base = safeGetJSON("tesis_base", null);
    const capitulos = safeGetJSON("tesis_capitulos", {});
    const doc = prepararDocumentoTesisCompleto(base, capitulos);
    localStorage.setItem("documento_base", doc);

    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(doc);
      setEstado("Tesis enviada al editor", "estado-ok");
      return;
    }
    if (typeof window.sincronizarEditorConPaper === "function") {
      window.sincronizarEditorConPaper(doc);
      setEstado("Tesis enviada al editor", "estado-ok");
      return;
    }
    setEstado("No se pudo sincronizar con el editor", "estado-error");
  });

  cargarBaseGuardada();
}

function initGeneradorTesis() {
  renderGeneradorTesis();
}
