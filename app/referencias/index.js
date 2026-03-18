function obtenerReferenciasPlataforma() {
  try {
    const raw = localStorage.getItem("referencias");
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardarReferenciasPlataforma(lista) {
  const data = (Array.isArray(lista) ? lista : []).map((ref) => ({
    title: ref.title || ref.titulo || "",
    authors: ref.authors || ref.autor || "",
    year: ref.year || ref.anio || "",
    source: ref.source || ref.revista || "",
    url: ref.url || ref.doi || ""
  }));
  localStorage.setItem("referencias", JSON.stringify(data));
  if (window.CADState) {
    window.CADState.referencias = data;
  }
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function normalizarAutoresAPA(autoresRaw) {
  if (!autoresRaw) return "Autor";
  const autores = autoresRaw
    .split(";")
    .map((a) => a.trim())
    .filter(Boolean);
  return autores.length ? autores.join(", ") : autoresRaw.trim();
}

function generarReferenciaAPA(ref) {
  const autor = normalizarAutoresAPA(ref.authors || "");
  const anio = ref.year || "s.f.";
  const titulo = ref.title || "Título";
  const fuente = ref.source || "";
  const url = ref.url || "";
  const finalFuente = [fuente, url].filter(Boolean).join(". ");
  return `${autor} (${anio}). ${titulo}. ${finalFuente}`.trim();
}

function agregarReferenciaPlataforma() {
  const authors = document.getElementById("refAutor")?.value.trim() || "";
  const year = document.getElementById("refAnio")?.value.trim() || "";
  const title = document.getElementById("refTitulo")?.value.trim() || "";
  const source = document.getElementById("refRevista")?.value.trim() || "";
  const url = document.getElementById("refDoi")?.value.trim() || "";

  if (!authors && !title) return;

  const lista = obtenerReferenciasPlataforma();
  lista.unshift({ title, authors, year, source, url });
  guardarReferenciasPlataforma(lista);
  renderReferencias();
  console.log("REFERENCIAS:", lista);

  const ids = ["refAutor", "refAnio", "refTitulo", "refRevista", "refEditorial", "refDoi"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function actualizarCampoReferencia(index, campo, valor) {
  const lista = obtenerReferenciasPlataforma();
  if (!lista[index]) return;
  lista[index][campo] = valor;
  guardarReferenciasPlataforma(lista);
}

function eliminarReferenciaPlataforma(index) {
  const lista = obtenerReferenciasPlataforma();
  lista.splice(index, 1);
  guardarReferenciasPlataforma(lista);
  renderReferencias();
}

function limpiarReferenciasPlataforma() {
  localStorage.removeItem("referencias");
  if (window.CADState) {
    window.CADState.referencias = [];
  }
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
  console.log("REFERENCIAS CLEARED");
  console.log("REFERENCIAS AFTER CLEAR:", localStorage.getItem("referencias"));
  renderReferencias();
}

function insertarReferenciasEnDocumento() {
  const lista = obtenerReferenciasPlataforma();
  if (!lista.length || !window.CADState) return;
  if (!window.CADState.editor) window.CADState.editor = { secciones: [] };

  const texto = lista.map((r) => generarReferenciaAPA(r)).join("\n");
  const idx = window.CADState.editor.secciones.findIndex((s) => (s.titulo || "").toLowerCase() === "referencias");
  if (idx >= 0) {
    window.CADState.editor.secciones[idx].contenido = texto;
  } else {
    window.CADState.editor.secciones.push({ titulo: "Referencias", contenido: texto });
  }

  if (window.PEditor) {
    PEditor.sections.lista = window.CADState.editor.secciones;
  }
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
  if (typeof renderEditor === "function") {
    renderEditor();
  }
}

function generarCitasAPADesdeReferencias() {
  const lista = obtenerReferenciasPlataforma();
  const citas = lista.map((r) => generarReferenciaAPA(r));
  localStorage.setItem("citas_apa", JSON.stringify(citas));
  console.log("APA:", citas);
  return citas;
}

function renderReferencias() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  const lista = obtenerReferenciasPlataforma();

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Referencias</h2>
      <p>Gestión de referencias APA.</p>
      <div class="bitacora-form">
        <input id="refAutor" type="text" placeholder="Autor(es)" />
        <input id="refAnio" type="text" placeholder="Año" />
        <input id="refTitulo" type="text" placeholder="Título" />
        <input id="refRevista" type="text" placeholder="Revista / Libro" />
        <input id="refEditorial" type="text" placeholder="Editorial" />
        <input id="refDoi" type="text" placeholder="DOI / URL" />
        <button id="btnAgregarReferencia" class="btn">Agregar referencia</button>
        <button id="btnInsertarReferencias" class="btn">Insertar en documento</button>
        <button id="btnLimpiarReferencias" class="btn btn-peligro">Limpiar referencias</button>
      </div>
      <div id="estadoReferencias" class="card"></div>
      <div id="listaReferencias"></div>
      <div class="card">
        <h3>Citas APA</h3>
        <button id="btnGenerarCitasAPA" class="btn">Generar citas APA</button>
        <div id="listaCitasAPA" class="muted"></div>
      </div>
    </div>
  `;

  const listEl = cont.querySelector("#listaReferencias");
  if (!lista.length) {
    listEl.innerHTML = "<p class=\"muted\">No hay referencias guardadas</p>";
  } else {
    lista.forEach((ref, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <input class="input" data-index="${index}" data-field="authors" value="${ref.authors || ""}" placeholder="Autor(es)" />
        <input class="input" data-index="${index}" data-field="year" value="${ref.year || ""}" placeholder="Año" />
        <input class="input" data-index="${index}" data-field="title" value="${ref.title || ""}" placeholder="Título" />
        <input class="input" data-index="${index}" data-field="source" value="${ref.source || ""}" placeholder="Revista / Libro" />
        <input class="input" data-index="${index}" data-field="editorial" value="" placeholder="Editorial (no persistente)" />
        <input class="input" data-index="${index}" data-field="url" value="${ref.url || ""}" placeholder="DOI / URL" />
        <p class="muted">${generarReferenciaAPA(ref)}</p>
        <div class="button-row">
          <button class="btn btn-peligro" data-index="${index}">Eliminar</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    listEl.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.getAttribute("data-index"), 10);
        const field = e.target.getAttribute("data-field");
        actualizarCampoReferencia(idx, field, e.target.value);
      });
    });

    listEl.querySelectorAll("[data-index]").forEach((btn) => {
      if (btn.classList.contains("btn-peligro")) {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-index"), 10);
          eliminarReferenciaPlataforma(idx);
        });
      }
    });
  }

  const estado = cont.querySelector("#estadoReferencias");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  cont.querySelector("#btnAgregarReferencia").addEventListener("click", () => {
    agregarReferenciaPlataforma();
    setEstado("Referencia agregada", "estado-ok");
  });
  cont.querySelector("#btnInsertarReferencias").addEventListener("click", insertarReferenciasEnDocumento);
  cont.querySelector("#btnLimpiarReferencias").addEventListener("click", () => {
    limpiarReferenciasPlataforma();
    setEstado("Referencias limpiadas correctamente", "estado-ok");
  });

  const btnCitas = cont.querySelector("#btnGenerarCitasAPA");
  const listaCitas = cont.querySelector("#listaCitasAPA");
  if (btnCitas) {
    btnCitas.addEventListener("click", () => {
      const citas = generarCitasAPADesdeReferencias();
      if (listaCitas) {
        if (!citas.length) {
          listaCitas.textContent = "No hay referencias disponibles";
        } else {
          listaCitas.innerHTML = `<pre>${escapeHTML(citas.join("\n"))}</pre>`;
        }
      }
      setEstado(citas.length ? "Citas APA generadas" : "No hay referencias disponibles", citas.length ? "estado-ok" : "estado-warn");
    });
  }

  const prevCitas = safeGetJSON("citas_apa", []);
  if (listaCitas && prevCitas.length) {
    listaCitas.innerHTML = `<pre>${escapeHTML(prevCitas.join("\n"))}</pre>`;
  }
}

function initReferencias() {
  renderReferencias();
}
