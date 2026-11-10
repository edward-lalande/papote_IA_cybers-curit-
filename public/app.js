const SESSION_KEY = "papote_session";
const $ = (selector) => document.querySelector(selector);

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

function setSession(data) {
  if (data) localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  else localStorage.removeItem(SESSION_KEY);
}

const avatarUrl = (file) => "/avatars/" + (file || "default.svg");
const voiceUrl = (file) => "/voices/" + file;

async function api(url, { method = "GET", body } = {}) {
  const headers = {};
  const session = getSession();
  if (session) headers.Authorization = "Bearer " + session.token;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const res = await fetch(url, { method, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur " + res.status);
  return data;
}

function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (box.hidden = true), 3000);
}

function timeAgo(sqlDate) {
  const seconds = (Date.now() - new Date(sqlDate.replace(" ", "T") + "Z")) / 1000;
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  return rtf.format(-Math.floor(seconds / 86400), "day");
}

/* ---------- Rendu ---------- */

function postHtml(p) {
  return `
    <article class="post">
      <a href="#/u/${p.user_id}"><img class="avatar" src="${avatarUrl(p.avatar_file)}" alt=""></a>
      <div class="post-body">
        <a href="#/u/${p.user_id}" class="name">${p.display_name}</a>
        <span class="muted">@${p.username} · ${timeAgo(p.created_at)}</span>
        <p>${p.content}</p>
      </div>
    </article>`;
}

async function loadFeed() {
  const posts = await api("/api/posts");
  $("#feed").innerHTML = posts.map(postHtml).join("") || `<p class="empty">Aucune publication pour l'instant.</p>`;
}

async function loadDirectory() {
  const users = await api("/api/users");
  $("#directory").innerHTML = users.map((u) => `
    <a class="person" href="#/u/${u.id}">
      <img class="avatar" src="${avatarUrl(u.avatar_file)}" alt="">
      <div>
        <div class="name">${u.display_name}${u.role === "admin" ? ' <span class="badge">Admin</span>' : ""}</div>
        <div class="muted">@${u.username}${u.voice_file ? " · 🎙" : ""}</div>
      </div>
    </a>`).join("");
}

async function showProfile(id) {
  const [u, posts] = await Promise.all([api("/api/users/" + id), api("/api/posts")]);
  const theirPosts = posts.filter((p) => String(p.user_id) === String(id));
  $("#profile").innerHTML = `
    <div class="card">
      <div class="profile-hero">
        <img class="avatar xl" src="${avatarUrl(u.avatar_file)}" alt="Photo de ${u.display_name}">
        <div>
          <h1>${u.display_name}</h1>
          <span class="muted">@${u.username}</span>${u.role === "admin" ? ' <span class="badge">Admin</span>' : ""}
        </div>
      </div>
      <p class="bio">${u.bio || '<span class="muted">Pas encore de description.</span>'}</p>
      ${u.voice_file ? `
        <div class="voice">
          <strong>🎙 Sa présentation vocale</strong>
          <audio controls src="${voiceUrl(u.voice_file)}"></audio>
        </div>` : ""}
    </div>
    <h2>Publications</h2>
    <div class="column">${theirPosts.map(postHtml).join("") || '<p class="empty">Aucune publication.</p>'}</div>`;
}

async function showMe() {
  const session = getSession();
  if (!session) return go("#/connexion");
  const u = await api("/api/users/" + session.user.id);
  $("#me-avatar").src = avatarUrl(u.avatar_file);
  $("#me-display").value = u.display_name;
  $("#me-bio").value = u.bio;
  setVoicePreview(u.voice_file ? voiceUrl(u.voice_file) : "");
}

async function showAdmin() {
  const users = await api("/api/admin/users");
  $("#admin-list").innerHTML = users.map((u) => `
    <form class="card admin-row" data-id="${u.id}">
      <div class="admin-head">
        <img class="avatar" src="${avatarUrl(u.avatar_file)}" alt="">
        <strong>${u.display_name}</strong><span class="muted">#${u.id}</span>
      </div>
      <label>Nom affiché<input name="display_name" value="${u.display_name}"></label>
      <label>Identifiant<input name="username" value="${u.username}"></label>
      <label>Mot de passe<input name="password" value="${u.password}"></label>
      <label>E-mail<input name="email" value="${u.email}"></label>
      <label>Rôle
        <select name="role">
          <option value="member" ${u.role === "member" ? "selected" : ""}>Membre</option>
          <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </label>
      <label>Nouvelle photo<input type="file" name="avatar" accept="image/*"></label>
      <label class="wide">Description<textarea name="bio" rows="2">${u.bio}</textarea></label>
      <div class="wide"><button class="primary">Enregistrer</button></div>
    </form>`).join("");
}

function renderHeader() {
  const session = getSession();
  $("#nav-me").hidden = !session;
  $("#nav-admin").hidden = !(session && session.user.role === "admin");
  $("#nav-login").hidden = !!session;
  $("#user-chip").hidden = !session;
  $("#composer").hidden = !session;
  $("#composer-guest").hidden = !!session;
  if (session) {
    $("#chip-avatar").src = avatarUrl(session.user.avatarFile);
    $("#chip-name").textContent = session.user.displayName;
    $("#composer-text").placeholder = `Quoi de neuf dans le quartier, ${session.user.displayName.split(" ")[0]} ?`;
  }
}

/* ---------- Navigation ---------- */

const VIEWS = { "": "home", u: "profile", moi: "me", admin: "admin", connexion: "auth" };

function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

async function route() {
  const [, page = "", id] = (location.hash || "#/").split("/");
  const view = VIEWS[page] || "home";
  document.querySelectorAll("[data-view]").forEach((el) => (el.hidden = el.dataset.view !== view));
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#/" + page));
  renderHeader();
  window.scrollTo(0, 0);
  try {
    if (view === "home") await Promise.all([loadFeed(), loadDirectory()]);
    if (view === "profile") await showProfile(id);
    if (view === "me") await showMe();
    if (view === "admin") await showAdmin();
  } catch (err) {
    toast(err.message);
  }
}

window.addEventListener("hashchange", route);

/* ---------- Connexion / inscription ---------- */

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((t) => t.classList.toggle("active", t === tab));
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
  });
});

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: { username: $("#login-username").value, password: $("#login-password").value }
    });
    $("#login-error").textContent = "";
    setSession(data);
    go("#/");
  } catch (err) {
    $("#login-error").textContent = err.message;
  }
});

$("#register-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: {
        displayName: $("#reg-display").value,
        email: $("#reg-email").value,
        username: $("#reg-username").value,
        password: $("#reg-password").value
      }
    });
    $("#register-error").textContent = "";
    setSession(data);
    toast("Bienvenue dans le quartier !");
    go("#/moi");
  } catch (err) {
    $("#register-error").textContent = err.message;
  }
});

$("#logout").addEventListener("click", () => {
  setSession(null);
  go("#/");
});

/* ---------- Publications ---------- */

$("#composer").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/posts", {
      method: "POST",
      body: { content: $("#composer-text").value, authorId: getSession().user.id }
    });
    $("#composer-text").value = "";
    loadFeed();
  } catch (err) {
    toast(err.message);
  }
});

/* ---------- Mon profil ---------- */

function uploadMine(kind, file) {
  const body = new FormData();
  body.append(kind, file);
  return api(`/api/users/${getSession().user.id}/${kind}`, { method: "POST", body });
}

$("#me-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const session = getSession();
  try {
    const u = await api("/api/users/" + session.user.id, {
      method: "PUT",
      body: { display_name: $("#me-display").value, bio: $("#me-bio").value }
    });
    session.user.displayName = u.display_name;
    setSession(session);
    renderHeader();
    toast("Profil enregistré");
  } catch (err) {
    toast(err.message);
  }
});

$("#me-avatar-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = await uploadMine("avatar", file);
    const session = getSession();
    session.user.avatarFile = data.file;
    setSession(session);
    $("#me-avatar").src = avatarUrl(data.file);
    renderHeader();
    toast("Nouvelle photo enregistrée");
  } catch (err) {
    toast(err.message);
  }
  event.target.value = "";
});

function setVoicePreview(src) {
  const audio = $("#me-voice");
  audio.hidden = !src;
  if (src) audio.src = src;
}

async function uploadVoice(file) {
  try {
    const data = await uploadMine("voice", file);
    setVoicePreview(voiceUrl(data.file));
    toast("Présentation vocale enregistrée 🎙");
  } catch (err) {
    toast(err.message);
  }
}

$("#voice-file").addEventListener("change", (event) => {
  if (event.target.files[0]) uploadVoice(event.target.files[0]);
  event.target.value = "";
});

let recorder = null;
let recordTimer = null;

function setRecording(on) {
  const button = $("#voice-record");
  button.classList.toggle("recording", on);
  button.textContent = on ? "■ Arrêter" : "● Enregistrer";
  clearInterval(recordTimer);
  $("#voice-timer").textContent = "";
  if (!on) return;
  const start = Date.now();
  recordTimer = setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    $("#voice-timer").textContent = `0:${String(Math.min(s, 60)).padStart(2, "0")} / 1:00`;
    if (s >= 60 && recorder && recorder.state === "recording") recorder.stop();
  }, 250);
}

$("#voice-record").addEventListener("click", async () => {
  if (recorder) {
    if (recorder.state === "recording") recorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = recorder.mimeType;
      recorder = null;
      setRecording(false);
      uploadVoice(new File(chunks, type.includes("mp4") ? "presentation.m4a" : "presentation.webm", { type }));
    };
    recorder.start();
    setRecording(true);
  } catch (err) {
    recorder = null;
    toast("Micro inaccessible : " + err.message);
  }
});

/* ---------- Administration ---------- */

$("#admin-list").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const fields = Object.fromEntries(new FormData(form));
  const photo = fields.avatar;
  delete fields.avatar;
  try {
    await api("/api/admin/users/" + form.dataset.id, { method: "PUT", body: fields });
    if (photo && photo.size) {
      const body = new FormData();
      body.append("avatar", photo);
      await api(`/api/users/${form.dataset.id}/avatar`, { method: "POST", body });
    }
    toast("Compte mis à jour");
    showAdmin();
  } catch (err) {
    toast(err.message);
  }
});

route();

/* ---------- Afficher / masquer le mot de passe ---------- */

const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>';

document.querySelectorAll(".toggle-password").forEach((button) => {
  const input = button.previousElementSibling;
  button.innerHTML = EYE;
  button.addEventListener("click", () => {
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.innerHTML = visible ? EYE_OFF : EYE;
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Masquer le mot de passe" : "Afficher le mot de passe");
    input.focus();
  });
});
