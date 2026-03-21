function obtenerTablasPlataforma() {
  if (window.CADState && Array.isArray(window.CADState.tablas)) {
    return window.CADState.tablas;
  }
  return [];
}

function guardarTablasPlataforma(lista) {
  if (!window.CADState) return;
  window.CADState.tablas = Array.isArray(lista) ? lista : [];
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function construirBloqueTabla(tabla) {
  const id = tabla.id || `tbl_${Date.now().toString(36)}`;
  const titulo = tabla.titulo || "Tabla";
  const descripcion = tabla.descripcion || "";
  return [
    `### Tabla: ${titulo}`,
    `[[TABLA:${id}]]`,
    descripcion ? `*Descripción:* ${descripcion}` : ""
  ].filter(Boolean).join("\n\n");
}

function insertarTablaEnDocumento(tabla, destino, posicion) {
  if (!tabla.id) {
    tabla.id = `tbl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const lista = obtenerTablasPlataforma();
    const idx = lista.findIndex((t) => t === tabla);
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], id: tabla.id };
      guardarTablasPlataforma(lista);
    }
  }
  const bloque = construirBloqueTabla(tabla);
  if (!bloque) return false;

  if (destino && destino.startsWith("seccion:")) {
    const idx = parseInt(destino.split(":")[1], 10);
    if (!Number.isNaN(idx) && window.PEditor?.sections?.lista?.[idx]) {
      const actual = window.PEditor.sections.lista[idx].contenido || "";
      window.PEditor.sections.lista[idx].contenido = [actual.trim(), bloque].filter(Boolean).join("\n\n");
      if (window.CADState?.editor) {
        window.CADState.editor.secciones = window.PEditor.sections.lista;
      }
      if (window.CADCore?.storage?.guardarEstadoLocal) {
        CADCore.storage.guardarEstadoLocal(window.CADState);
      }
      if (typeof window.compilarDocumentoEditor === "function") {
        const editorEl = document.getElementById("editor");
        const editorBase = editorEl ? editorEl.value : (localStorage.getItem("documento_editor") || "");
        const compilado = window.compilarDocumentoEditor(editorBase, window.PEditor.sections.lista);
        localStorage.setItem("documento_editor", compilado);
      }
      if (typeof window.actualizarEditorVisual === "function") {
        window.actualizarEditorVisual();
      }
      return true;
    }
  }

  const actual = localStorage.getItem("documento_editor") || "";
  const nuevo = posicion === "inicio"
    ? [bloque, actual.trim()].filter(Boolean).join("\n\n")
    : [actual.trim(), bloque].filter(Boolean).join("\n\n");
  localStorage.setItem("documento_editor", nuevo);
  if (typeof window.actualizarEditorVisual === "function") {
    window.actualizarEditorVisual();
  }
  return true;
}

function agregarTablaPlataforma() {
  const titulo = document.getElementById("tablaTitulo").value.trim();
  const descripcion = document.getElementById("tablaDescripcion").value.trim();
  const filas = Number(document.getElementById("tablaFilas").value) || 3;
  const columnas = Number(document.getElementById("tablaColumnas").value) || 3;

  const lista = obtenerTablasPlataforma();
  lista.unshift({
    id: `tbl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    titulo,
    descripcion,
    filas,
    columnas,
    datos: crearMatrizTabla(filas, columnas)
  });

  guardarTablasPlataforma(lista);
  renderTablas();

  document.getElementById("tablaTitulo").value = "";
  document.getElementById("tablaDescripcion").value = "";
  document.getElementById("tablaFilas").value = "";
  document.getElementById("tablaColumnas").value = "";
}

function eliminarTablaPlataforma(index) {
  const lista = obtenerTablasPlataforma();
  lista.splice(index, 1);
  guardarTablasPlataforma(lista);
  renderTablas();
}

function renderTablas() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Tablas</h2>
      <p>Gestión de tablas académicas.</p>
      <div class="bitacora-form">
        <input id="tablaTitulo" type="text" placeholder="Título" />
        <input id="tablaDescripcion" type="text" placeholder="Descripción" />
        <input id="tablaFilas" type="number" min="1" placeholder="Filas" />
        <input id="tablaColumnas" type="number" min="1" placeholder="Columnas" />
        <button id="btnCrearTabla" class="btn">Crear tabla</button>
        <select id="tablaDestino" class="input">
          <option value="documento">Documento principal</option>
        </select>
        <select id="tablaPosicion" class="input">
          <option value="final">Insertar al final</option>
          <option value="inicio">Insertar al inicio</option>
        </select>
      </div>
      <div id="estadoTablas" class="card"></div>
      <div id="listaTablas"></div>
    </div>
  `;

  const lista = cont.querySelector("#listaTablas");
  const tablas = obtenerTablasPlataforma();
  const estado = cont.querySelector("#estadoTablas");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const destino = cont.querySelector("#tablaDestino");
  if (destino && window.CADState?.editor?.secciones?.length) {
    window.CADState.editor.secciones.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = `seccion:${idx}`;
      opt.textContent = `Sección: ${s.titulo || `Sección ${idx + 1}`}`;
      destino.appendChild(opt);
    });
  }

  if (!tablas.length) {
    lista.innerHTML = "<p class=\"muted\">No hay tablas registradas.</p>";
  } else {
    tablas.forEach((tabla, index) => {
      const card = document.createElement("div");
      card.className = "card";
      const tablaContainer = document.createElement("div");
      card.innerHTML = `
        <h3>${tabla.titulo || "Tabla"}</h3>
        <p class="muted">${tabla.descripcion || ""}</p>
      `;
      card.appendChild(tablaContainer);
      card.innerHTML += `
        <div class="button-row">
          <button class="btn" data-insert-tabla="${index}">Insertar en editor</button>
          <button class="btn btn-peligro" data-index="${index}">Eliminar</button>
        </div>
      `;
      lista.appendChild(card);

      renderTablaEditable(tabla, tablaContainer, (updated) => {
        tablas[index] = updated;
        guardarTablasPlataforma(tablas);
      });
    });

    lista.querySelectorAll("[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        eliminarTablaPlataforma(idx);
      });
    });
  }

  cont.querySelector("#btnCrearTabla").addEventListener("click", agregarTablaPlataforma);

  cont.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-insert-tabla]");
    if (!btn) return;
    const idx = parseInt(btn.getAttribute("data-insert-tabla"), 10);
    const tabla = obtenerTablasPlataforma()[idx];
    if (!tabla) return;
    const destinoVal = cont.querySelector("#tablaDestino")?.value || "documento";
    const posVal = cont.querySelector("#tablaPosicion")?.value || "final";
    const ok = insertarTablaEnDocumento(tabla, destinoVal, posVal);
    setEstado(ok ? "Tabla insertada en el documento" : "No se pudo insertar la tabla", ok ? "estado-ok" : "estado-error");
  });
}

function initTablas() {
  renderTablas();
}
