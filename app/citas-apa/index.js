function generarCitaAPARapida(ref) {
  if (typeof generarReferenciaAPA === "function") return generarReferenciaAPA(ref);
  const autorRaw = (ref.autor || ref.authors || "").trim();
  const anioRaw = (ref.anio || ref.year || "").trim();
  const tituloRaw = (ref.titulo || ref.title || "").trim();
  const fuenteRaw = (ref.revista || ref.source || ref.fuente || "").trim();
  const editorialRaw = (ref.editorial || "").trim();
  const urlRaw = (ref.doi || ref.url || "").trim();
  const autor = autorRaw || "Autor";
  const anio = anioRaw || "s.f.";
  const titulo = tituloRaw || "Título";
  const fuente = [fuenteRaw, editorialRaw].filter(Boolean).join(". ");
  const finalFuente = [fuente, urlRaw].filter(Boolean).join(". ");
  return `${autor} (${anio}). ${titulo}. ${finalFuente}`.trim();
}

function guardarCitaEnReferencias(ref) {
  if (!ref.autor || !ref.anio || !ref.titulo) {
    alert("Faltan datos en la referencia");
    return;
  }
  const lista = JSON.parse(localStorage.getItem("referencias") || "[]");
  lista.push(ref);
  localStorage.setItem("referencias", JSON.stringify(lista));
  console.log("Referencia guardada:", ref);
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
      <div id="debugCitas" class="card"></div>
      <div id="estadoCitas" class="card"></div>
      <div id="previewCita" class="card"></div>
    </div>
  `;

  const preview = cont.querySelector("#previewCita");
  const estado = cont.querySelector("#estadoCitas");
  const debugBox = cont.querySelector("#debugCitas");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const construirRef = () => {
    const selectors = {
      autor: "#citaAutor",
      anio: "#citaAnio",
      titulo: "#citaTitulo",
      fuente: "#citaFuente",
      editorial: "#citaEditorial",
      url: "#citaDoi"
    };
    console.log("APA SELECTORS:", selectors);
    const logInputs = (root, label) => {
      const inputs = root.querySelectorAll("input, textarea");
      console.log(`APA INPUTS SCAN (${label}):`);
      inputs.forEach((el) => {
        console.log(el.placeholder, el.id, el.name, el.value);
      });
      return inputs;
    };

    const scopedInputs = logInputs(cont, "scoped");
    let autor = (cont.querySelector(selectors.autor)?.value || "").trim();
    let anio = (cont.querySelector(selectors.anio)?.value || "").trim();
    let titulo = (cont.querySelector(selectors.titulo)?.value || "").trim();
    let revista = (cont.querySelector(selectors.fuente)?.value || "").trim();
    let editorial = (cont.querySelector(selectors.editorial)?.value || "").trim();
    let doi = (cont.querySelector(selectors.url)?.value || "").trim();

    if (!autor || !anio || !titulo) {
      const allInputs = logInputs(document, "global");
      allInputs.forEach((el) => {
        const ph = (el.placeholder || "").toLowerCase();
        const name = (el.name || "").toLowerCase();
        const id = (el.id || "").toLowerCase();
        const value = (el.value || "").trim();
        if (!value) return;
        if (!autor && (ph.includes("autor") || name.includes("autor") || id.includes("autor"))) autor = value;
        if (!anio && (ph.includes("año") || ph.includes("anio") || name.includes("anio") || id.includes("anio"))) anio = value;
        if (!titulo && (ph.includes("título") || ph.includes("titulo") || name.includes("titulo") || id.includes("titulo"))) titulo = value;
        if (!revista && (ph.includes("revista") || ph.includes("libro") || ph.includes("sitio") || name.includes("fuente") || id.includes("fuente"))) revista = value;
        if (!editorial && (ph.includes("editorial") || name.includes("editorial") || id.includes("editorial"))) editorial = value;
        if (!doi && (ph.includes("doi") || ph.includes("url") || name.includes("doi") || id.includes("doi"))) doi = value;
      });
    }

    return { autor, anio, titulo, revista, editorial, doi };
  };

  cont.querySelector("#btnGenerarCita").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    const ref = construirRef();
    console.log("APA BUTTON CLICKED");
    console.log("APA INPUT VALUES:", {
      autor: ref.autor,
      anio: ref.anio,
      titulo: ref.titulo,
      fuente: ref.revista,
      editorial: ref.editorial,
      url: ref.doi
    });
    const cita = generarCitaAPARapida(ref);
    console.log("APA OUTPUT:", cita);
    const safe = cita.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (preview) preview.innerHTML = `<pre>${safe}</pre>`;
    setEstado("Guardado correctamente", "estado-ok");
  });

  cont.querySelector("#btnGuardarCita").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    const ref = construirRef();
    guardarCitaEnReferencias(ref);
    if (preview) preview.innerHTML = "<p class=\"muted\">Cita guardada en referencias.</p>";
    setEstado("Guardado correctamente", "estado-ok");
  });

  cont.querySelector("#btnGenerarCitasRef").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    try {
      const refs = safeGetJSON("referencias", []);
      console.log("REFERENCIAS KEY:", "referencias");
      console.log("REFERENCIAS FOUND:", refs.length);
      console.log("REFERENCIAS:", refs);
      if (debugBox) {
        debugBox.textContent = `Referencias cargadas: ${refs.length}. Generación: ejecutada.`;
      }
      if (!refs.length) {
        if (preview) preview.innerHTML = "<p class=\"muted\">No hay referencias disponibles</p>";
        setEstado("No hay referencias disponibles", "estado-warn");
        return;
      }
      const citas = refs.map((ref) => generarCitaAPARapida(ref));
      localStorage.setItem("citas_apa", JSON.stringify(citas));
      console.log("APA GENERATED:", citas.length);
      console.log("APA GENERADAS:", citas);
      const safe = citas.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (preview) preview.innerHTML = `<pre>${safe}</pre>`;
      setEstado("Citas APA generadas correctamente", "estado-ok");
    } catch (e) {
      setEstado("Error", "estado-error");
    }
  });
}

function initCitasAPA() {
  renderCitasAPA();
}
