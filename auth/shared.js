// Shared by the email pages (/auth/confirm and /auth/reset).
window.FormaitreAuth = {
  // Reads the one-time token from the link, then removes it from the address bar.
  readLink() {
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "";
    const scheme = (next.match(/^(formaitre-(?:flow|loom|canon|star)):\/\//) || [])[1];
    const link = {
      tokenHash: params.get("token_hash"),
      type: params.get("type"),
      app: scheme ? { scheme, name: window.FORMAITRE.apps[scheme] } : null
    };
    history.replaceState(null, "", location.pathname);
    return link;
  },

  // Session lives only in this page: nothing is stored in the browser.
  client() {
    return window.supabase.createClient(window.FORMAITRE.supabaseUrl, window.FORMAITRE.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  },

  // "Open Flow" button on phones; on a computer the text alone says to return to the app.
  offerApp(button, app) {
    const onPhone = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
                    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (!app || !onPhone) return;
    button.href = app.scheme + "://auth/confirmed";
    button.textContent = "Open " + app.name;
    button.classList.remove("hidden");
  }
};
