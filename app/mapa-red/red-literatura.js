function cargarVisNetwork() {
  return new Promise((resolve, reject) => {
    if (window.vis && window.vis.Network) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/vis-network/standalone/umd/vis-network.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar vis-network"));
    document.head.appendChild(script);
  });
}

function normalizarRefRed(r, idx) {
  return {
    id: `paper-${idx}`,
    titulo: r.titulo || r.title || "Título no disponible",
    autores: r.autor || r.autores || r.authors || "Autor(es) no disponible",
    anio: r.anio || r.year || "s.f.",
    resumen: r.resumen || r.abstract || "",
    fuente: r.revista || r.fuente || r.source || ""
  };
}

function extraerKeywordsRed(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
}

function construirRedLiteratura(referencias) {
  const refs = (referencias || []).map(normalizarRefRed);
  const nodes = [];
  const edges = [];
  const autoresSet = new Set();
  const kwSet = new Set();

  refs.forEach((r) => {
    nodes.push({ id: r.id, label: r.titulo, group: "paper", data: r });
    const autores = String(r.autores).split(";").map((a) => a.trim()).filter(Boolean);
    autores.forEach((a) => {
      const aid = `autor-${a}`;
      if (!autoresSet.has(aid)) {
        autoresSet.add(aid);
        nodes.push({ id: aid, label: a, group: "author", data: { titulo: a } });
      }
      edges.push({ from: r.id, to: aid });
    });

    const kws = extraerKeywordsRed(`${r.titulo} ${r.resumen}`);
    kws.forEach((k) => {
      const kid = `kw-${k}`;
      if (!kwSet.has(kid)) {
        kwSet.add(kid);
        nodes.push({ id: kid, label: k, group: "keyword", data: { titulo: k } });
      }
      edges.push({ from: r.id, to: kid });
    });
  });

  return { nodes, edges };
}

async function renderRedLiteratura(container, onInfo) {
  await cargarVisNetwork();
  const refs = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
  const graph = construirRedLiteratura(refs);

  const data = {
    nodes: new window.vis.DataSet(graph.nodes),
    edges: new window.vis.DataSet(graph.edges)
  };

  const options = {
    physics: { enabled: true, stabilization: false },
    interaction: { hover: true },
    groups: {
      paper: { color: { background: "#FFD166", border: "#D4A01B" } },
      author: { color: { background: "#06D6A0", border: "#059669" } },
      keyword: { color: { background: "#118AB2", border: "#0B5D78" } }
    }
  };

  const network = new window.vis.Network(container, data, options);
  network.on("click", (params) => {
    if (!params.nodes || !params.nodes.length) return;
    const nodeId = params.nodes[0];
    const node = data.nodes.get(nodeId);
    if (onInfo) onInfo(node);
  });

  localStorage.setItem("red_literatura", JSON.stringify({
    nodes: graph.nodes,
    edges: graph.edges
  }));
}
