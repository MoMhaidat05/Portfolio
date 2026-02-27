(async function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(window.location.search);
  const writeupId = params.get("id");

  const elTitle = $("#writeup-title");
  const elInfo = $("#writeup-info");
  const elTags = $("#writeup-tags");
  const elContent = $("#writeup-content");
  const elLoading = $("#writeup-loading");
  const elError = $("#writeup-error");

  function showError() {
    elLoading.classList.add("hidden");
    elContent.classList.add("hidden");
    elError.classList.remove("hidden");
    elError.classList.add("flex");
    document.title = "Not Found — Mohammad AlMusa";
  }

  if (!writeupId) {
    showError();
    return;
  }

  try {
    const manifestRes = await fetch("writeups/manifest.json");
    if (!manifestRes.ok) throw new Error("Manifest not found");
    const manifest = await manifestRes.json();

    const meta = manifest.find((w) => w.id === writeupId);
    if (!meta) {
      showError();
      return;
    }

    const mdRes = await fetch(meta.file);
    if (!mdRes.ok) throw new Error("Markdown not found");
    const mdText = await mdRes.text();

    document.title = meta.title + " — Mohammad AlMusa";

    elTitle.textContent = meta.title;

    elInfo.innerHTML = [
      '<span><i class="fa-solid fa-calendar-days mr-1.5"></i>' +
        meta.date +
        "</span>",
      '<span><i class="fa-solid fa-user mr-1.5"></i>Mohammad AlMusa</span>',
    ].join("");

    const tagColors = [
      "bg-yellow-300/20 border-yellow-300/50 text-yellow-300",
      "bg-orange-300/20 border-orange-300/50 text-orange-300",
      "bg-teal-300/20 border-teal-300/50 text-teal-300",
      "bg-sky-300/20 border-sky-300/50 text-sky-300",
      "bg-purple-300/20 border-purple-300/50 text-purple-300",
      "bg-rose-300/20 border-rose-300/50 text-rose-300",
    ];

    elTags.innerHTML = meta.tags
      .map(
        (tag, i) =>
          '<span class="text-xs px-2.5 py-0.5 rounded-lg border ' +
          tagColors[i % tagColors.length] +
          '">#' +
          tag +
          "</span>",
      )
      .join("");

    marked.setOptions({
      breaks: true,
      gfm: true,
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    });

    elContent.innerHTML = marked.parse(mdText);

    elContent.querySelectorAll("pre code").forEach((block) => {
      if (!block.classList.contains("hljs")) {
        hljs.highlightElement(block);
      }
    });

    elLoading.classList.add("hidden");
    elContent.classList.remove("hidden");
  } catch (err) {
    console.error("Failed to load writeup:", err);
    showError();
  }
})();
