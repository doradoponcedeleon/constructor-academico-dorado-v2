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
  const data = Array.isArray(lista) ? lista : [];
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
  const autor = normalizarAutoresAPA(ref.autor || "");
  const anio = ref.anio || "s.f.";
  const titulo = ref.titulo || "Título";
  const revista = ref.revista || "";
  const editorial = ref.editorial || "";
  const doi = ref.doi || "";

  const fuente = [revista, editorial, doi].filter(Boolean).join(", ");
  return `${autor} (${anio}). ${titulo}. ${fuente}`.trim();
}

function agregarReferenciaPlataforma() {
  const autor = document.getElementById("refAutor")?.value.trim() || "";
  const anio = document.getElementById("refAnio")?.value.trim() || "";
  const titulo = document.getElementById("refTitulo")?.value.trim() || "";
  const revista = document.getElementById("refRevista")?.value.trim() || "";
  const editorial = document.getElementById("refEditorial")?.value.trim() || "";
  const doi = document.getElementById("refDoi")?.value.trim() || "";

  if (!autor && !titulo) return;

  const lista = obtenerReferenciasPlataforma();
  lista.unshift({ autor, anio, titulo, revista, editorial, doi });
  guardarReferenciasPlataforma(lista);
  renderReferencias();

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
      </div>
      <div id="listaReferencias"></div>
    </div>
  `;

  const listEl = cont.querySelector("#listaReferencias");
  if (!lista.length) {
    listEl.innerHTML = "<p class=\"muted\">No hay referencias registradas.</p>";
  } else {
    lista.forEach((ref, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <input class="input" data-index="${index}" data-field="autor" value="${ref.autor || ""}" placeholder="Autor(es)" />
        <input class="input" data-index="${index}" data-field="anio" value="${ref.anio || ""}" placeholder="Año" />
        <input class="input" data-index="${index}" data-field="titulo" value="${ref.titulo || ""}" placeholder="Título" />
        <input class="input" data-index="${index}" data-field="revista" value="${ref.revista || ""}" placeholder="Revista / Libro" />
        <input class="input" data-index="${index}" data-field="editorial" value="${ref.editorial || ""}" placeholder="Editorial" />
        <input class="input" data-index="${index}" data-field="doi" value="${ref.doi || ""}" placeholder="DOI / URL" />
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

  cont.querySelector("#btnAgregarReferencia").addEventListener("click", agregarReferenciaPlataforma);
  cont.querySelector("#btnInsertarReferencias").addEventListener("click", insertarReferenciasEnDocumento);
}

function initReferencias() {
  renderReferencias();
}
