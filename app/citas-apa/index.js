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
        <input id="apa-autor" type="text" placeholder="Autor(es)" />
        <input id="apa-anio" type="text" placeholder="Año" />
        <input id="apa-titulo" type="text" placeholder="Título" />
        <input id="apa-fuente" type="text" placeholder="Revista / Libro / Sitio" />
        <input id="apa-editorial" type="text" placeholder="Editorial" />
        <input id="apa-url" type="text" placeholder="DOI / URL" />
        <button id="btn-generar-apa" class="btn">Generar cita APA</button>
        <button id="btn-guardar-apa" class="btn">Guardar en referencias</button>
        <button id="btn-generar-apa-refs" class="btn">Generar citas desde referencias</button>
      </div>
      <div id="debug-apa" class="card"></div>
      <div id="estado-apa" class="card"></div>
      <div id="resultado-apa" class="card"></div>
    </div>
  `;

  const preview = cont.querySelector("#resultado-apa");
  const estado = cont.querySelector("#estado-apa");
  const debugBox = cont.querySelector("#debug-apa");
  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const construirRef = () => {
    const selectors = {
      autor: "#apa-autor",
      anio: "#apa-anio",
      titulo: "#apa-titulo",
      fuente: "#apa-fuente",
      editorial: "#apa-editorial",
      url: "#apa-url"
    };
    console.log("APA SELECTORS:", selectors);

    const inputs = document.querySelectorAll("input, textarea");
    console.log("APA INPUTS SCAN (global):");
    inputs.forEach((el) => {
      console.log(el.placeholder, el.id, el.name, el.value);
    });

    const matches = {
      autor: [],
      anio: [],
      titulo: []
    };
    inputs.forEach((el) => {
      const value = (el.value || "").trim();
      if (!value) return;
      if (value.includes("Perez")) matches.autor.push({ id: el.id, name: el.name, placeholder: el.placeholder, value });
      if (value.includes("2020")) matches.anio.push({ id: el.id, name: el.name, placeholder: el.placeholder, value });
      if (value.includes("IA")) matches.titulo.push({ id: el.id, name: el.name, placeholder: el.placeholder, value });
    });
    console.log("APA MATCHES:", matches);

    const autor = (cont.querySelector(selectors.autor) || document.getElementById("apa-autor"))?.value?.trim() || "";
    const anio = (cont.querySelector(selectors.anio) || document.getElementById("apa-anio"))?.value?.trim() || "";
    const titulo = (cont.querySelector(selectors.titulo) || document.getElementById("apa-titulo"))?.value?.trim() || "";
    const revista = (cont.querySelector(selectors.fuente) || document.getElementById("apa-fuente"))?.value?.trim() || "";
    const editorial = (cont.querySelector(selectors.editorial) || document.getElementById("apa-editorial"))?.value?.trim() || "";
    const doi = (cont.querySelector(selectors.url) || document.getElementById("apa-url"))?.value?.trim() || "";

    return { autor, anio, titulo, revista, editorial, doi };
  };

  cont.querySelector("#btn-generar-apa").addEventListener("click", () => {
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

  cont.querySelector("#btn-guardar-apa").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    const ref = construirRef();
    guardarCitaEnReferencias(ref);
    if (preview) preview.innerHTML = "<p class=\"muted\">Cita guardada en referencias.</p>";
    setEstado("Guardado correctamente", "estado-ok");
  });

  cont.querySelector("#btn-generar-apa-refs").addEventListener("click", () => {
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
