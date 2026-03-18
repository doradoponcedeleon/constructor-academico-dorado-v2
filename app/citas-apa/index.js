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

function generarCitaDesdeInputs(ref) {
  const autor = (ref.autor || "").trim() || "Autor";
  const anio = (ref.anio || "").trim() || "s.f.";
  const titulo = (ref.titulo || "").trim() || "Título";
  const fuente = (ref.revista || "").trim();
  const editorial = (ref.editorial || "").trim();
  const url = (ref.doi || "").trim();

  let cita = `${autor}. (${anio}). ${titulo}.`;
  if (fuente) cita += ` ${fuente}.`;
  if (editorial) cita += ` ${editorial}.`;
  if (url) cita += ` ${url}`;
  return cita.trim();
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
      <div id="debug-apa-valores" class="card"></div>
    </div>
  `;

  const preview = cont.querySelector("#resultado-apa");
  const estado = cont.querySelector("#estado-apa");
  const debugBox = cont.querySelector("#debug-apa");
  const debugValores = cont.querySelector("#debug-apa-valores");
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

    const inputs = document.querySelectorAll("input, textarea, [contenteditable=\"true\"]");
    console.log("APA INPUTS SCAN (global):");
    inputs.forEach((el) => {
      const value = (el.value || el.textContent || "").trim();
      console.log(el.placeholder, el.id, el.name, value);
    });

    const matches = {
      autor: [],
      anio: [],
      titulo: []
    };
    inputs.forEach((el) => {
      const value = (el.value || el.textContent || "").trim();
      if (!value) return;
      if (value.includes("Perez")) matches.autor.push({ id: el.id, name: el.name, placeholder: el.placeholder, value });
      if (value.includes("2020")) matches.anio.push({ id: el.id, name: el.name, placeholder: el.placeholder, value });
      if (value.includes("IA")) matches.titulo.push({ id: el.id, name: el.name, placeholder: el.placeholder, value });
    });
    console.log("APA MATCHES:", matches);

    const getValue = (sel) => {
      const el = cont.querySelector(sel) || document.querySelector(sel);
      if (!el) return "";
      return (el.value || el.textContent || "").trim();
    };

    let autor = getValue(selectors.autor);
    let anio = getValue(selectors.anio);
    let titulo = getValue(selectors.titulo);
    let revista = getValue(selectors.fuente);
    let editorial = getValue(selectors.editorial);
    let doi = getValue(selectors.url);

    const usedFrom = { autor: null, anio: null, titulo: null, revista: null, editorial: null, doi: null };

    const nonEmptyInputs = Array.from(inputs)
      .map((el) => ({
        el,
        value: (el.value || el.textContent || "").trim(),
        placeholder: (el.placeholder || "").toLowerCase(),
        id: (el.id || "").toLowerCase(),
        name: (el.name || "").toLowerCase(),
        label: (el.getAttribute("aria-label") || "").toLowerCase()
      }))
      .filter((it) => it.value);

    if (!autor) {
      const pick = nonEmptyInputs.find((it) => it.placeholder.includes("autor") || it.id.includes("autor") || it.name.includes("autor") || it.label.includes("autor"));
      if (pick) {
        autor = pick.value;
        usedFrom.autor = pick;
      }
    }
    if (!anio) {
      const pick = nonEmptyInputs.find((it) => it.placeholder.includes("año") || it.placeholder.includes("anio") || it.id.includes("anio") || it.name.includes("anio") || it.label.includes("anio") || /^\d{4}$/.test(it.value));
      if (pick) {
        anio = pick.value;
        usedFrom.anio = pick;
      }
    }
    if (!titulo) {
      const pick = nonEmptyInputs.find((it) => it.placeholder.includes("título") || it.placeholder.includes("titulo") || it.id.includes("titulo") || it.name.includes("titulo") || it.label.includes("titulo"));
      if (pick) {
        titulo = pick.value;
        usedFrom.titulo = pick;
      }
    }
    if (!revista) {
      const pick = nonEmptyInputs.find((it) => it.placeholder.includes("revista") || it.placeholder.includes("libro") || it.placeholder.includes("sitio") || it.id.includes("fuente") || it.name.includes("fuente"));
      if (pick) {
        revista = pick.value;
        usedFrom.revista = pick;
      }
    }
    if (!editorial) {
      const pick = nonEmptyInputs.find((it) => it.placeholder.includes("editorial") || it.id.includes("editorial") || it.name.includes("editorial"));
      if (pick) {
        editorial = pick.value;
        usedFrom.editorial = pick;
      }
    }
    if (!doi) {
      const pick = nonEmptyInputs.find((it) => it.placeholder.includes("doi") || it.placeholder.includes("url") || it.id.includes("doi") || it.name.includes("doi"));
      if (pick) {
        doi = pick.value;
        usedFrom.doi = pick;
      }
    }

    console.log("APA USED FROM:", usedFrom);

    return { autor, anio, titulo, revista, editorial, doi };
  };

  cont.querySelector("#btn-generar-apa").addEventListener("click", () => {
    setEstado("Generando...", "estado-warn");
    console.log("APA BUTTON CLICKED");
    const read = (sel) => ((cont.querySelector(sel) || document.querySelector(sel))?.value || "").trim();
    const autor = read("#apa-autor");
    const anio = read("#apa-anio");
    const titulo = read("#apa-titulo");
    const fuente = read("#apa-fuente");
    const editorial = read("#apa-editorial");
    const url = read("#apa-url");
    console.log("APA FORM VALUES:", { autor, anio, titulo, fuente, editorial, url });
    if (debugValores) {
      debugValores.innerHTML = `
        <p>autor leído: ${autor || ""}</p>
        <p>anio leído: ${anio || ""}</p>
        <p>titulo leído: ${titulo || ""}</p>
        <p>fuente leída: ${fuente || ""}</p>
        <p>url leída: ${url || ""}</p>
      `;
    }
    const cita = `${autor || "Autor"}. (${anio || "s.f."}). ${titulo || "Título"}.` +
      (fuente ? ` ${fuente}.` : "") +
      (editorial ? ` ${editorial}.` : "") +
      (url ? ` ${url}` : "");
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
