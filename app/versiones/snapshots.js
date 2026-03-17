function capturarSnapshotPlataforma() {
  const state = window.CADState;
  return {
    fecha: new Date().toISOString(),
    descripcion: "",
    estado: CADCore?.utils?.clonarObjeto ? CADCore.utils.clonarObjeto(state) : JSON.parse(JSON.stringify(state))
  };
}
