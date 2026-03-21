function mostrarEstadoMotorIdeas(mensaje) {
  const el = document.getElementById("estadoMotorIdeas");
  if (el) el.textContent = mensaje;
}

function extraerSeccionesDesdeMarkdown(doc) {
  const secciones = [];
  if (!doc) return secciones;

  const obtenerBloque = (titulo) => {
    const regex = new RegExp(`##\\s*${titulo}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*|$)`, "i");
    const match = doc.match(regex);
    return match ? match[1].trim() : "";
  };

  const problema = obtenerBloque("Problema");
  const ideas = obtenerBloque("Ideas");
  const conceptos = obtenerBloque("Conceptos clave");
  const objetivos = obtenerBloque("Objetivos");

  if (problema) secciones.push({ titulo: "Problema", contenido: problema });
  if (ideas) secciones.push({ titulo: "Ideas", contenido: ideas });
  if (conceptos) secciones.push({ titulo: "Conceptos clave", contenido: conceptos });
  if (objetivos) secciones.push({ titulo: "Objetivos", contenido: objetivos });

  return secciones;
}

function sincronizarEditorConDocumentoBase(doc) {
  let documento = doc;
  if (typeof doc === "string") {
    try {
      const parsed = JSON.parse(doc);
      if (parsed && typeof parsed === "object") documento = parsed;
    } catch (e) {
      documento = doc;
    }
  }

  if (documento && typeof documento === "object" && !documento.raw) {
    const secciones = window.documentoBaseToSecciones
      ? window.documentoBaseToSecciones(documento)
      : [];
    if (window.CADState) {
      if (!window.CADState.editor) window.CADState.editor = { secciones: [] };
      window.CADState.editor.secciones = secciones.length
        ? secciones
        : [{ titulo: "Documento base", contenido: window.documentoBaseToMarkdown(documento) }];
    }
    if (window.PEditor) {
      PEditor.sections.lista = window.CADState.editor.secciones;
    }
    if (window.PEditor?.renderer) {
      const cont = document.getElementById("panelContenido");
      if (cont) {
        PEditor.renderer.render(cont, window.CADState.editor.secciones);
      }
    }
    const markdown = window.documentoBaseToMarkdown ? window.documentoBaseToMarkdown(documento) : "";
    if (markdown) localStorage.setItem("documento_editor", markdown);
    return;
  }

  const editor = document.getElementById("editor");
  const secciones = extraerSeccionesDesdeMarkdown(doc);

  if (editor && editor.value !== doc) {
    editor.value = doc;
  }

  if (!window.CADState) return;
  if (!window.CADState.editor) window.CADState.editor = { secciones: [] };

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
    window.CADState.editor.secciones = [{ titulo: "Documento base", contenido: doc }];
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
  if (doc) localStorage.setItem("documento_editor", doc);
}

window.sincronizarEditorConDocumentoBase = sincronizarEditorConDocumentoBase;

function generarDocumento() {
  const problema = (document.getElementById("problema")?.value || "").trim();
  const ideas = (document.getElementById("ideas")?.value || "").trim();
  const conceptos = (document.getElementById("conceptos")?.value || "").trim();
  const objetivos = (document.getElementById("objetivos")?.value || "").trim();
  const tema = (document.getElementById("miTema")?.value || "").trim();

  if (!tema && !problema && !ideas && !conceptos && !objetivos) {
    mostrarEstadoMotorIdeas("Escribe contenido antes de generar");
    return;
  }

  try {
    mostrarEstadoMotorIdeas("Generando...");
    const documento = [
      "# Documento base",
      "",
      "## Tema",
      tema,
      "",
      "## Problema",
      problema,
      "",
      "## Ideas principales",
      ideas,
      "",
      "## Conceptos clave",
      conceptos,
      "",
      "## Objetivo general",
      objetivos
    ].join("\n");
    localStorage.setItem("motor_ideas_preview", documento);
    mostrarEstadoMotorIdeas("Documento generado (preview)");
    console.log("PREVIEW GENERATED");
  } catch (e) {
    mostrarEstadoMotorIdeas("Error al generar");
  }

  const resultadoDiv = document.getElementById("resultadoMotor");
  if (resultadoDiv) {
    const doc = localStorage.getItem("motor_ideas_preview") || "";
    const safeDoc = doc
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    resultadoDiv.innerHTML = `<pre>${safeDoc}</pre>`;
    const info = document.createElement("div");
    info.style.fontSize = "12px";
    info.style.opacity = "0.7";
    info.style.marginTop = "8px";
    info.textContent = "Caracteres: " + doc.length;
    resultadoDiv.appendChild(info);
  }
}

function aplicarEditor() {
  const doc = localStorage.getItem("motor_ideas_preview") || "";
  if (!doc) {
    mostrarEstadoMotorIdeas("No existe contenido para aplicar");
    return;
  }
  try {
    mostrarEstadoMotorIdeas("Generando...");
    console.log("APPLIED TO EDITOR");
    localStorage.setItem("documento_editor", doc);
    localStorage.setItem("documento_base", doc);
    if (window.CADState?.editor) {
      window.CADState.editor.secciones = [];
    }
    if (window.PEditor) {
      PEditor.sections.lista = [];
    }
    if (window.CADCore?.storage?.guardarEstadoLocal) {
      CADCore.storage.guardarEstadoLocal(window.CADState);
    }
    if (typeof window.actualizarEditorVisual === "function") {
      window.actualizarEditorVisual();
    }
    mostrarEstadoMotorIdeas("Documento aplicado al editor");
  } catch (e) {
    mostrarEstadoMotorIdeas("Error al generar");
  }
}

function renderMotorIdeas() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Motor de ideas</h2>
      <p>Transforma ideas en estructura base.</p>
      <div class="bitacora-form">
        <input id="miTema" type="text" placeholder="Tema" />
        <textarea id="problema" placeholder="Problema"></textarea>
        <textarea id="ideas" placeholder="Ideas"></textarea>
        <textarea id="conceptos" placeholder="Conceptos"></textarea>
        <textarea id="objetivos" placeholder="Objetivos"></textarea>
        <button id="btnGenerarIdeas" class="btn" onclick="generarDocumento()">Generar documento base</button>
        <button id="btnAplicarIdeas" class="btn" onclick="aplicarEditor()">Aplicar al editor</button>
        <button id="btnLimpiarPreview" class="btn">Limpiar preview</button>
      </div>
      <div id="estadoMotorIdeas" class="card"></div>
      <div id="resultadoMotor" class="card"></div>
    </div>
  `;

  const btnLimpiar = document.getElementById("btnLimpiarPreview");
  if (btnLimpiar) {
    btnLimpiar.onclick = () => {
      localStorage.removeItem("documento_base");
      const resultadoDiv = document.getElementById("resultadoMotor");
      if (resultadoDiv) {
        resultadoDiv.innerHTML = "";
      }
      mostrarEstadoMotorIdeas("Preview limpiado");
    };
  }

  const doc = localStorage.getItem("motor_ideas_preview");
  if (doc) {
    const resultadoDiv = document.getElementById("resultadoMotor");
    if (resultadoDiv) {
      const safeDoc = doc
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      resultadoDiv.innerHTML = `<pre>${safeDoc}</pre>`;
    }
  }
}

function initMotorIdeas() {
  renderMotorIdeas();
}
