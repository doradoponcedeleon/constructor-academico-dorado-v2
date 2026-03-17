function renderTablaEditable(tabla, contenedor, onChange) {
  if (!contenedor) return;

  const table = document.createElement("table");
  table.className = "tabla-html";

  tabla.datos.forEach((fila, i) => {
    const tr = document.createElement("tr");
    fila.forEach((celda, j) => {
      const td = document.createElement("td");
      td.contentEditable = "true";
      td.textContent = celda;
      td.addEventListener("input", () => {
        tabla.datos[i][j] = td.textContent;
        if (typeof onChange === "function") onChange(tabla);
      });
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  contenedor.innerHTML = "";
  contenedor.appendChild(table);
}
