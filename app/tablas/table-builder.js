function crearMatrizTabla(filas, columnas) {
  const data = [];
  for (let i = 0; i < filas; i++) {
    const row = [];
    for (let j = 0; j < columnas; j++) {
      row.push("");
    }
    data.push(row);
  }
  return data;
}
