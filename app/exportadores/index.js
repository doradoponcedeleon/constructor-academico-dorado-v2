function initExportadores() {
  renderExportadores();
}

function renderExportadores() {
  const cont = document.getElementById("panelContenido");
  if (!cont) return;

  cont.innerHTML = `
    <div class="modulo-card">
      <h2>Exportadores</h2>
      <p>Exporta el contenido actual de la plataforma.</p>
      <div class="button-row">
        <button id="btnExpPDF" class="btn">Exportar PDF</button>
        <button id="btnExpDOCX" class="btn">Exportar DOCX</button>
        <button id="btnExpHTML" class="btn">Exportar HTML</button>
        <button id="btnExpTXT" class="btn">Exportar TXT</button>
        <button id="btnExpJSON" class="btn">Exportar JSON</button>
      </div>
      <div class="button-row">
        <select id="driveFormato" class="input">
          <option value="txt">TXT</option>
          <option value="md">Markdown</option>
          <option value="html">HTML</option>
        </select>
        <button id="btnExpDrive" class="btn">Exportar a Google Drive</button>
      </div>
      <div id="driveStatus" class="card"></div>
    </div>
  `;

  cont.querySelector("#btnExpPDF").addEventListener("click", exportarPDFPlataforma);
  cont.querySelector("#btnExpDOCX").addEventListener("click", exportarDOCXPlataforma);
  cont.querySelector("#btnExpHTML").addEventListener("click", exportarHTMLPlataforma);
  cont.querySelector("#btnExpTXT").addEventListener("click", exportarTXTPlataforma);
  cont.querySelector("#btnExpJSON").addEventListener("click", exportarJSONPlataforma);

  const status = cont.querySelector("#driveStatus");
  const setStatus = (msg) => { if (status) status.textContent = msg || ""; };
  cont.querySelector("#btnExpDrive").addEventListener("click", async () => {
    const fmt = cont.querySelector("#driveFormato")?.value || "txt";
    try {
      await exportarGoogleDrivePlataforma(fmt, (m) => setStatus(m));
    } catch (e) {
      setStatus("Error al exportar");
      if (window.logCAD) logCAD("drive export error", e);
    }
  });
}
