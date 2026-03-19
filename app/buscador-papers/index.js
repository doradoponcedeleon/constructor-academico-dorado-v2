function renderBuscadorPapers() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Buscador Papers</h2>
      <p>Búsqueda académica con datos de ejemplo.</p>
      <div class="bitacora-form">
        <input id="bpQuery" type="text" placeholder="Buscar papers" />
        <button id="btnBuscarPapers" class="btn">Buscar</button>
        <button id="btnLimpiarPapers" class="btn btn-peligro">Limpiar historial</button>
      </div>
      <div id="estadoBuscador" class="card"></div>
      <div id="listaPapers"></div>
    </div>
  `;

  const estado = cont.querySelector("#estadoBuscador");
  const listaEl = cont.querySelector("#listaPapers");

  const setEstado = (msg, type) => window.setEstado(estado, msg, type);

  const aplicarResultados = (resultados, meta = {}) => {
    if (!listaEl) return;
    if (!resultados.length) {
      listaEl.innerHTML = "<p class=\"muted\">Sin resultados.</p>";
      return;
    }

    listaEl.innerHTML = "";
    if (meta.fuente === "demo") {
      const aviso = document.createElement("div");
      aviso.className = "card";
      aviso.innerHTML = "<p class=\"muted\">Resultados demo (sin conexión).</p>";
      listaEl.appendChild(aviso);
    }
    resultados.forEach((r, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      const autores = r.autores || "Autor(es) no disponible";
      const anio = r.anio || "s.f.";
      const resumen = r.resumen || "Resumen no disponible.";
      card.innerHTML = `
        <strong>${escapeHTML(r.titulo || "Título no disponible")}</strong><br/>
        <span class="muted">${escapeHTML(autores)} (${escapeHTML(anio)})</span><br/>
        <span>${escapeHTML(r.fuente || "")}</span><br/>
        <span class="muted">${escapeHTML(r.doi || r.url || "")}</span>
        <p>${escapeHTML(resumen)}</p>
        <div class="button-row">
          <button class="btn" data-add="${idx}">Agregar a referencias</button>
          <button class="btn" data-apa="${idx}">Citar APA</button>
          <button class="btn" data-send="${idx}">Enviar al editor</button>
        </div>
      `;
      listaEl.appendChild(card);
    });

    listaEl.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setEstado("Generando...", "estado-warn");
        const idx = parseInt(btn.getAttribute("data-add"), 10);
        const r = resultados[idx];
        if (!r) return;
        const lista = typeof obtenerReferenciasPlataforma === "function"
          ? obtenerReferenciasPlataforma()
          : (safeGetJSON("referencias", []));
        lista.unshift(construirReferenciaDesdePaper(r));
        if (typeof guardarReferenciasPlataforma === "function") {
          guardarReferenciasPlataforma(lista);
        } else {
          safeSetJSON("referencias", lista);
        }
        console.log("REFERENCIAS KEY:", "referencias");
        console.log("REFERENCIAS FOUND:", lista.length);
        console.log("REFERENCIAS:", lista);
        setEstado("Referencia agregada correctamente", "estado-ok");
      });
    });

    listaEl.querySelectorAll("[data-apa]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        setEstado("Generando...", "estado-warn");
        const idx = parseInt(btn.getAttribute("data-apa"), 10);
        const r = resultados[idx];
        if (!r) return;
        const ref = construirReferenciaDesdePaper(r);
        const cita = generarCitaAPABreve(ref);
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(cita);
            setEstado("Guardado correctamente", "estado-ok");
          } catch (e) {
            setEstado(cita, "estado-warn");
          }
        } else {
          setEstado(cita, "estado-warn");
        }
      });
    });

    listaEl.querySelectorAll("[data-send]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setEstado("Generando...", "estado-warn");
        const idx = parseInt(btn.getAttribute("data-send"), 10);
        const r = resultados[idx];
        if (!r) return;
        const ref = construirReferenciaDesdePaper(r);
        const cita = generarCitaAPABreve(ref);
        const doc = `# ${ref.titulo || "Paper"}\n\n` +
          `${ref.autor ? `**Autores:** ${ref.autor}\n` : ""}` +
          `${ref.anio ? `**Año:** ${ref.anio}\n` : ""}` +
          `${ref.revista ? `**Fuente:** ${ref.revista}\n` : ""}` +
          `${ref.doi ? `**DOI/URL:** ${ref.doi}\n` : ""}` +
          `\n## Resumen\n${r.resumen || "Resumen no disponible."}\n\n` +
          `## Cita APA\n${cita}\n`;
        if (window.appendDocumentoEditor) {
          window.appendDocumentoEditor(doc);
        } else {
          localStorage.setItem("documento_editor", doc);
        }
        if (typeof window.sincronizarEditorConDocumentoBase === "function") {
          window.sincronizarEditorConDocumentoBase(doc);
          setEstado("Guardado correctamente", "estado-ok");
        } else if (typeof window.sincronizarEditorConPaper === "function") {
          window.sincronizarEditorConPaper(doc);
          setEstado("Guardado correctamente", "estado-ok");
        } else {
          setEstado("No se pudo sincronizar con el editor", "estado-error");
        }
      });
    });
  };

  cont.querySelector("#btnBuscarPapers").addEventListener("click", async () => {
    const query = (document.getElementById("bpQuery")?.value || "").trim();
    if (!query) {
      setEstado("Escribe un tema para buscar", "estado-warn");
      return;
    }

    setEstado("Generando...", "estado-warn");
    try {
      const res = buscarPapersDemo(query);
      const resultados = res.resultados || [];
      if (!window.CADState) window.CADState = {};
      window.CADState.buscadorPapers = { query, resultados, fuente: res.fuente };
      if (window.CADCore?.storage?.guardarEstadoLocal) {
        CADCore.storage.guardarEstadoLocal(window.CADState);
      }
      aplicarResultados(resultados, { fuente: res.fuente });
      setEstado("Guardado correctamente", "estado-ok");
    } catch (e) {
      if (listaEl) listaEl.innerHTML = "<p class=\"muted\">Sin resultados.</p>";
      setEstado("Error", "estado-error");
      if (window.logCAD) logCAD("buscador-papers error", e);
    }
  });

  cont.querySelector("#btnLimpiarPapers").addEventListener("click", () => {
    const ok = confirm("¿Deseas borrar el historial de papers?");
    if (!ok) return;
    if (window.CADState?.buscadorPapers) {
      delete window.CADState.buscadorPapers;
    }
    if (window.CADCore?.storage?.guardarEstadoLocal) {
      CADCore.storage.guardarEstadoLocal(window.CADState || {});
    }
    console.log("Historial de papers eliminado");
    if (listaEl) listaEl.innerHTML = "<p class=\"muted\">Sin resultados.</p>";
    setEstado("Historial de papers eliminado", "estado-ok");
  });

  if (window.CADState?.buscadorPapers?.resultados) {
    const qPrev = window.CADState.buscadorPapers.query || "";
    const input = cont.querySelector("#bpQuery");
    if (input && qPrev) input.value = qPrev;
    aplicarResultados(window.CADState.buscadorPapers.resultados, { fuente: window.CADState.buscadorPapers.fuente });
  }
}

function initBuscadorPapers() {
  renderBuscadorPapers();
}
