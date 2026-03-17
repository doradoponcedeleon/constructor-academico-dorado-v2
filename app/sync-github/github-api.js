window.CADSync = window.CADSync || {};

function githubGet(url, token) {
  const headers = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `token ${token}`;
  return fetch(url, { headers });
}

function githubPut(url, token, body) {
  const headers = { Accept: "application/vnd.github+json", "Content-Type": "application/json" };
  if (token) headers.Authorization = `token ${token}`;
  return fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body)
  });
}

CADSync.api = {
  owner: "",
  repo: "",
  token: ""
};
