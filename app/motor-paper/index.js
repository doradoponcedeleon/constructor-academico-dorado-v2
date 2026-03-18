function extraerDatosDesdeDocumentoBase() {
  const doc = window.parseDocumentoBase ? window.parseDocumentoBase() : null;
  if (doc && !doc.raw) {
    return {
      problema: doc.problema || "",
      ideas: doc.introduccion || "",
      conceptos: "",
      objetivos: doc.objetivos || ""
    };
  }
  const raw = localStorage.getItem("documento_base") || "";
  const getBlock = (titulo) => {
    const regex = new RegExp(`##\\s*${titulo}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*|$)`, "i");
    const match = raw.match(regex);
    return match ? match[1].trim() : "";
  };
  return {
    problema: getBlock("Problema"),
    ideas: getBlock("Ideas"),
    conceptos: getBlock("Conceptos clave"),
    objetivos: getBlock("Objetivos")
  };
}

function extraerSeccionesDesdePaper(doc) {
  const secciones = [];
  if (!doc) return secciones;
  const matches = Array.from(doc.matchAll(/^##\s*(.+)\s*$/gm));
  matches.forEach((match, index) => {
    const titulo = (match[1] || "").trim();
    const inicio = match.index + match[0].length;
    const fin = (index + 1 < matches.length) ? matches[index + 1].index : doc.length;
    const bloque = doc.slice(inicio, fin).trim();
    if (titulo) secciones.push({ titulo, contenido: bloque });
  });
  return secciones;
}

function construirBloquePaper(paper, meta = {}) {
  const partes = ["## Paper académico"];
  if (meta.titulo) partes.push(`**Título:** ${meta.titulo}`);
  if (meta.autores) partes.push(`**Autores:** ${meta.autores}`);
  if (meta.area) partes.push(`**Área:** ${meta.area}`);
  partes.push("");
  partes.push(paper || "");
  return partes.join("\n");
}

function integrarPaperEnEditor(paper, meta = {}) {
  const existente = localStorage.getItem("documento_editor") || "";
  console.log("EDITOR BEFORE MERGE:", existente);
  console.log("PAPER TO MERGE:", paper);
  const bloque = construirBloquePaper(paper, meta);
  const merged = [existente.trim(), bloque.trim()].filter(Boolean).join("\n\n");
  localStorage.setItem("documento_editor", merged);
  console.log("EDITOR AFTER MERGE:", merged);
  return merged;
}

function sincronizarEditorConPaper(paper, seccionesOverride) {
  const editor = document.getElementById("editor");
  const actual = localStorage.getItem("documento_editor") || "";
  if (editor && actual && editor.value !== actual) {
    editor.value = actual;
  } else if (editor && !actual && editor.value !== paper) {
    editor.value = paper;
  }

  if (!window.CADState) return;
  if (!window.CADState.editor) window.CADState.editor = { secciones: [] };

  const secciones = Array.isArray(seccionesOverride) && seccionesOverride.length
    ? seccionesOverride
    : extraerSeccionesDesdePaper(paper);

  if (secciones.length) {
    if (Array.isArray(window.CADState.editor.secciones) && window.CADState.editor.secciones.length) {
      const mapa = {};
      window.CADState.editor.secciones.forEach((s) => {
        mapa[(s.titulo || "").toLowerCase()] = s;
      });
      secciones.forEach((s) => {
        const key = (s.titulo || "").toLowerCase();
        if (mapa[key]) {
          mapa[key].contenido = s.contenido;
        } else {
          window.CADState.editor.secciones.push(s);
        }
      });
    } else {
      window.CADState.editor.secciones = secciones;
    }
  } else if (!window.CADState.editor.secciones.length) {
    window.CADState.editor.secciones = [{ titulo: "Paper", contenido: paper }];
  }

  if (window.PEditor) {
    PEditor.sections.lista = window.CADState.editor.secciones;
  }

  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }

  if (window.PEditor?.renderer) {
    const cont = document.getElementById("panelContenido");
    if (cont) {
      PEditor.renderer.render(cont, window.CADState.editor.secciones);
    }
  }
}

window.sincronizarEditorConPaper = sincronizarEditorConPaper;

function renderMotorPaper() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Motor Paper</h2>
      <p>Genera un paper académico base.</p>
      <div class="bitacora-form">
        <input id="paperTema" type="text" placeholder="Tema" />
        <input id="paperTitulo" type="text" placeholder="Título" />
        <input id="paperAutores" type="text" placeholder="Autores" />
        <input id="paperArea" type="text" placeholder="Área académica" />
        <label style="display:flex;align-items:center;gap:8px;">
          <input id="paperAutoToggle" type="checkbox" />
          Generación automática
        </label>
        <button id="btnGenerarPaper" class="btn">Generar paper</button>
        <button id="btnEnviarPaper" class="btn">Enviar al editor</button>
        <button id="btnLimpiarPaper" class="btn">Limpiar paper</button>
      </div>
      <div id="estadoMotorPaper" class="card"></div>
      <div id="resultadoMotorPaper" class="card"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoMotorPaper");
  const resultado = cont.querySelector("#resultadoMotorPaper");

  const setEstado = (msg) => { if (estado) estado.textContent = msg; };

  cont.querySelector("#btnGenerarPaper").addEventListener("click", () => {
    setEstado("Generando...");
    const dataBase = extraerDatosDesdeDocumentoBase();
    const data = {
      tema: (document.getElementById("paperTema")?.value || "").trim(),
      titulo: (document.getElementById("paperTitulo")?.value || "").trim(),
      autores: (document.getElementById("paperAutores")?.value || "").trim(),
      area: (document.getElementById("paperArea")?.value || "").trim(),
      ...dataBase
    };

    const auto = !!document.getElementById("paperAutoToggle")?.checked;
    try {
      if (auto) {
        const resultadoAuto = generarPaperAutomatico(data);
        const paper = resultadoAuto.markdown || "";
        localStorage.setItem("paper_base", paper);
        localStorage.setItem("paper_secciones", JSON.stringify(resultadoAuto.secciones || []));
        window.appendDocumentoEditor && window.appendDocumentoEditor(paper);
        setEstado("Guardado correctamente");
        const safe = paper.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
        return;
      }

      const paper = generarPaperAcademico(data);
      localStorage.setItem("paper_base", paper);
      localStorage.removeItem("paper_secciones");
      window.appendDocumentoEditor && window.appendDocumentoEditor(paper);
      setEstado("Guardado correctamente");

      const safe = paper.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (resultado) resultado.innerHTML = `<pre>${safe}</pre>`;
    } catch (e) {
      setEstado("Error");
    }
  });

  cont.querySelector("#btnEnviarPaper").addEventListener("click", () => {
    setEstado("Generando...");
    const paper = localStorage.getItem("paper_base") || "";
    if (!paper) {
      setEstado("No existe paper para enviar");
      return;
    }
    const meta = {
      titulo: (document.getElementById("paperTitulo")?.value || "").trim(),
      autores: (document.getElementById("paperAutores")?.value || "").trim(),
      area: (document.getElementById("paperArea")?.value || "").trim()
    };
    const merged = integrarPaperEnEditor(paper, meta);
    const editor = document.getElementById("editor");
    if (editor) editor.value = merged;
    let secciones = [];
    try {
      const raw = localStorage.getItem("paper_secciones");
      secciones = raw ? JSON.parse(raw) : [];
    } catch (e) {
      secciones = [];
    }
    if (typeof window.sincronizarEditorConPaper === "function") {
      window.sincronizarEditorConPaper(paper, secciones);
      setEstado("Contenido del paper integrado al editor");
      return;
    }
    if (typeof window.sincronizarEditorConDocumentoBase === "function") {
      window.sincronizarEditorConDocumentoBase(paper);
      setEstado("Contenido del paper integrado al editor");
      return;
    }
    setEstado("Error");
  });

  cont.querySelector("#btnLimpiarPaper").addEventListener("click", () => {
    localStorage.removeItem("paper_base");
    localStorage.removeItem("paper_secciones");
    if (resultado) resultado.innerHTML = "";
    setEstado("Paper limpiado");
  });

  const prev = localStorage.getItem("paper_base");
  if (prev && resultado) {
    const safe = prev.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    resultado.innerHTML = `<pre>${safe}</pre>`;
  }
}

function initMotorPaper() {
  renderMotorPaper();
}
