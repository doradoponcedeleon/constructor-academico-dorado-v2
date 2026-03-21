(function () {
  const DEFAULT_CONFIG = {
    clientId: "REPLACE_WITH_GOOGLE_CLIENT_ID",
    scope: "https://www.googleapis.com/auth/drive.file",
    tokenKey: "cad_drive_token",
    tokenExpiryKey: "cad_drive_token_expiry"
  };

  function getConfig() {
    const redirectUri = window.location.origin + window.location.pathname;
    return { ...DEFAULT_CONFIG, redirectUri };
  }

  function parseTokenFromHash() {
    if (!window.location.hash) return false;
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    const expiresIn = parseInt(params.get("expires_in"), 10);
    if (token) {
      const expiry = Date.now() + (isNaN(expiresIn) ? 3600 : expiresIn) * 1000;
      localStorage.setItem(DEFAULT_CONFIG.tokenKey, token);
      localStorage.setItem(DEFAULT_CONFIG.tokenExpiryKey, String(expiry));
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return true;
    }
    return false;
  }

  function getToken() {
    const token = localStorage.getItem(DEFAULT_CONFIG.tokenKey);
    const expiry = parseInt(localStorage.getItem(DEFAULT_CONFIG.tokenExpiryKey) || "0", 10);
    if (!token || Date.now() > expiry) return null;
    return token;
  }

  function startOAuth() {
    const cfg = getConfig();
    if (!cfg.clientId || cfg.clientId.includes("REPLACE")) {
      throw new Error("Config Google Drive incompleta: falta clientId");
    }
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", cfg.clientId);
    authUrl.searchParams.set("redirect_uri", cfg.redirectUri);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("scope", cfg.scope);
    authUrl.searchParams.set("include_granted_scopes", "true");
    authUrl.searchParams.set("prompt", "consent");
    window.location.assign(authUrl.toString());
  }

  function getDocumentoActual() {
    if (typeof window.obtenerDocumentoFinalPlataforma === "function") {
      return window.obtenerDocumentoFinalPlataforma();
    }
    return localStorage.getItem("documento_final")
      || localStorage.getItem("documento_editor")
      || localStorage.getItem("documento_base")
      || "";
  }

  function buildMultipartBody(metadata, content, boundary) {
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;
    return [
      delimiter,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${metadata.mimeType || "text/plain"}`,
      "",
      content,
      closeDelimiter,
      ""
    ].join("\r\n");
  }

  async function uploadToDrive(token, filename, content, mimeType) {
    const boundary = "cad_boundary_" + Date.now();
    const metadata = { name: filename, mimeType };
    const body = buildMultipartBody(metadata, content, boundary);

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Error subiendo a Drive");
    }
    return await res.json();
  }

  window.exportarGoogleDrivePlataforma = async function (formato = "txt", onStatus) {
    try {
      parseTokenFromHash();
      let token = getToken();
      if (!token) {
        if (onStatus) onStatus("Conectando con Google Drive...");
        startOAuth();
        return;
      }

      if (onStatus) onStatus("Subiendo archivo...");
      const contenido = getDocumentoActual();
      const ext = formato === "md" ? "md" : (formato === "html" ? "html" : "txt");
      const mime = formato === "md" ? "text/markdown" : (formato === "html" ? "text/html" : "text/plain");
      const nombre = `documento-${Date.now()}.${ext}`;
      const file = await uploadToDrive(token, nombre, contenido, mime);
      if (onStatus) onStatus("Archivo subido correctamente");
      return file;
    } catch (err) {
      if (onStatus && String(err?.message || "").includes("clientId")) {
        onStatus("Config Google Drive incompleta: falta clientId");
      } else if (onStatus) {
        onStatus("Error al exportar");
      }
      throw err;
    }
  };
})();
