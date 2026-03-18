function generarCitaAPARapida(ref) {
  if (typeof generarReferenciaAPA === "function") return generarReferenciaAPA(ref);
  const autor = ref.autor || "Autor";
  const anio = ref.anio || "s.f.";
  const titulo = ref.titulo || "Título";
  const fuente = ref.fuente || "";
  return `${autor} (${anio}). ${titulo}. ${fuente}`.trim();
}

function guardarCitaEnReferencias(ref) {
  const lista = typeof obtenerReferenciasPlataforma === "function"
    ? obtenerReferenciasPlataforma()
    : (JSON.parse(localStorage.getItem("referencias") || "[]"));
  lista.unshift(ref);
  if (typeof guardarReferenciasPlataforma === "function") {
    guardarReferenciasPlataforma(lista);
  } else {
    localStorage.setItem("referencias", JSON.stringify(lista));
  }
}

function renderCitasAPA() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Citas APA</h2>
      <p>Generador rápido de citas APA.</p>
      <div class="bitacora-form">
        <select id="citaTipo" class="input">
          <option value="articulo">Artículo</option>
          <option value="libro">Libro</option>
          <option value="web">Web</option>
        </select>
        <input id="citaAutor" type="text" placeholder="Autor(es)" />
        <input id="citaAnio" type="text" placeholder="Año" />
        <input id="citaTitulo" type="text" placeholder="Título" />
        <input id="citaFuente" type="text" placeholder="Revista / Libro / Sitio" />
        <input id="citaEditorial" type="text" placeholder="Editorial" />
        <input id="citaDoi" type="text" placeholder="DOI / URL" />
        <button id="btnGenerarCita" class="btn">Generar cita APA</button>
        <button id="btnGuardarCita" class="btn">Guardar en referencias</button>
        <button id="btnGenerarCitasRef" class="btn">Generar citas desde referencias</button>
      </div>
      <div id="estadoCitas" class="card"></div>
      <div id="previewCita" class="card"></div>
    </div>
  `;

  const preview = cont.querySelector("#previewCita");
  const estado = cont.querySelector("#estadoCitas");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const construirRef = () => ({
    autor: (document.getElementById("citaAutor")?.value || "").trim(),
    anio: (document.getElementById("citaAnio")?.value || "").trim(),
    titulo: (document.getElementById("citaTitulo")?.value || "").trim(),
    revista: (document.getElementById("citaFuente")?.value || "").trim(),
    editorial: (document.getElementById("citaEditorial")?.value || "").trim(),
    doi: (document.getElementById("citaDoi")?.value || "").trim()
  });

  cont.querySelector("#btnGenerarCita").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    const ref = construirRef();
    const cita = generarCitaAPARapida(ref);
    const safe = cita.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (preview) preview.innerHTML = `<pre>${safe}</pre>`;
    setEstado("Guardado correctamente", "estado-ok");
  });

  cont.querySelector("#btnGuardarCita").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    const ref = construirRef();
    try {
      guardarCitaEnReferencias(ref);
      if (preview) preview.innerHTML = "<p class=\"muted\">Cita guardada en referencias.</p>";
      setEstado("Guardado correctamente", "estado-ok");
    } catch (e) {
      setEstado("Error", "estado-error");
    }
  });

  cont.querySelector("#btnGenerarCitasRef").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    try {
      const refs = safeGetJSON("referencias", []);
      const citas = refs.map((ref) => generarCitaAPARapida(ref));
      localStorage.setItem("citas_apa", JSON.stringify(citas));
      const safe = citas.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (preview) preview.innerHTML = `<pre>${safe}</pre>`;
      setEstado("Guardado correctamente", "estado-ok");
    } catch (e) {
      setEstado("Error", "estado-error");
    }
  });
}

function initCitasAPA() {
  renderCitasAPA();
}
