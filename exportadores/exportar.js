window.exportarTXT = function() {
  const contenido = localStorage.getItem("documento_final") || "";

  const blob = new Blob([contenido], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "documento.txt";
  a.click();
};
