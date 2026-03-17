function renderGaleriaFiguras(figuras, contenedor) {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (!figuras.length) {
    contenedor.innerHTML = "<p class=\"muted\">No hay figuras registradas.</p>";
    return;
  }

  figuras.forEach((fig, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${fig.titulo || "Figura"}</h3>
      <img src="${fig.imagen}" alt="${fig.titulo}" class="figura-preview" />
      <p class="muted">${fig.descripcion || ""}</p>
      <p class="muted">Fuente: ${fig.fuente || ""}</p>
      <div class="button-row">
        <button class="btn btn-peligro" data-index="${index}">Eliminar</button>
      </div>
    `;
    contenedor.appendChild(card);
  });

  contenedor.querySelectorAll("[data-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      eliminarFiguraPlataforma(idx);
    });
  });
}
