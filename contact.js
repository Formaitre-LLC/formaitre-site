// Email links open a small card instead of the mail app.
// Each link keeps its mailto: href, so it still works if this script can't load.
(() => {
  const kinds = {
    access: {
      title: "Request access",
      text: "We're opening Formaitre to a small group of restaurants. Send us your name, your restaurant and your role, and we'll be in touch.",
      email: "hello@formaitre.com",
      subject: "Formaitre access request",
    },
    contact: {
      title: "Get in touch",
      text: "Questions, partnerships or press. We usually reply within a day or two.",
      email: "hello@formaitre.com",
      subject: "Hello Formaitre",
    },
    support: {
      title: "Need help?",
      text: "Tell us which app you're using and what happened, and we'll get back to you.",
      email: "support@formaitre.com",
      subject: "Formaitre support",
    },
  };

  if (typeof HTMLDialogElement !== "function") return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const dialog = el("dialog", "contact-dialog");
  dialog.setAttribute("aria-labelledby", "contact-title");
  dialog.setAttribute("aria-describedby", "contact-text");
  const card = el("div", "contact-card");
  // Focus the card itself on open (Tab then reaches the X), so no ring shows after a tap.
  card.tabIndex = -1;
  card.autofocus = true;
  const close = el("button", "contact-close");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";
  const title = el("h2", "contact-title");
  title.id = "contact-title";
  const text = el("p", "contact-text");
  text.id = "contact-text";
  const row = el("div", "contact-row");
  const address = el("span", "contact-email");
  const copy = el("button", "contact-copy", "Copy");
  copy.type = "button";
  const status = el("span", "contact-status");
  status.setAttribute("role", "status");
  const send = el("a", "gbtn contact-send", "Send email");
  row.append(address, copy);
  card.append(close, title, text, row, status, send);
  dialog.append(card);
  (document.querySelector(".palette") || document.body).append(dialog);

  let opener = null;
  let copiedTimer = 0;

  const open = (kind, link) => {
    const k = kinds[kind];
    title.textContent = k.title;
    text.textContent = k.text;
    address.textContent = k.email;
    send.href = `mailto:${k.email}?subject=${encodeURIComponent(k.subject)}`;
    copy.textContent = "Copy";
    status.textContent = "";
    opener = link;
    dialog.showModal();
  };

  const selectAddress = () => {
    const range = document.createRange();
    range.selectNodeContents(address);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const showCopied = () => {
    copy.textContent = "Copied";
    status.textContent = "Email address copied.";
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => { copy.textContent = "Copy"; status.textContent = ""; }, 1800);
  };

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address.textContent);
      showCopied();
    } catch {
      // Older browsers, or clipboard access refused: copy the selected text instead.
      selectAddress();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      if (copied) {
        window.getSelection().removeAllRanges();
        showCopied();
      } else {
        status.textContent = "The address is selected. Copy it from here.";
      }
    }
  });

  close.addEventListener("click", () => dialog.close());
  // A click on the dimmed area lands on the dialog itself, not the card.
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-contact]");
    if (!link || !kinds[link.dataset.contact]) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link.dataset.contact, link);
  });
})();
