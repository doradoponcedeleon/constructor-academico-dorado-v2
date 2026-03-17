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
}

window.sincronizarEditorConDocumentoBase = sincronizarEditorConDocumentoBase;

function generarDocumento() {
  const problema = (document.getElementById("problema")?.value || "").trim();
  const ideas = (document.getElementById("ideas")?.value || "").trim();
  const conceptos = (document.getElementById("conceptos")?.value || "").trim();
  const objetivos = (document.getElementById("objetivos")?.value || "").trim();

  if (!problema && !ideas && !conceptos && !objetivos) {
    mostrarEstadoMotorIdeas("Escribe contenido antes de generar");
    return;
  }

  const data = {
    tema: (document.getElementById("miTema")?.value || "").trim(),
    problema,
    ideas,
    conceptos,
    objetivos
  };

  const resultado = generarDocumentoBasePlataforma(data);
  const documento = resultado.markdown || "";

  localStorage.setItem("documento_base", documento);
  mostrarEstadoMotorIdeas("Documento base generado");

  const resultadoDiv = document.getElementById("resultadoMotor");
  if (resultadoDiv) {
    const safeDoc = documento
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    resultadoDiv.innerHTML = `<pre>${safeDoc}</pre>`;
    const info = document.createElement("div");
    info.style.fontSize = "12px";
    info.style.opacity = "0.7";
    info.style.marginTop = "8px";
    info.textContent = "Caracteres: " + documento.length;
    resultadoDiv.appendChild(info);
  }
}

function aplicarEditor() {
  const doc = localStorage.getItem("documento_base") || "";
  if (!doc) {
    mostrarEstadoMotorIdeas("No existe contenido para aplicar");
    return;
  }
  sincronizarEditorConDocumentoBase(doc);
  mostrarEstadoMotorIdeas("Documento aplicado al editor");
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

  const doc = localStorage.getItem("documento_base");
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
