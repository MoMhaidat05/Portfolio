(async function () {
  const grid = document.getElementById("writeups-grid");
  const loading = document.getElementById("writeups-loading");
  const empty = document.getElementById("writeups-empty");

  const TAG_COLORS = ["bg-primary/15 border-primary/40 text-primary"];

  const LEVEL_STYLES = {
    easy: "bg-primary/20 border-primary/50 text-primary",
    medium: "bg-amber-400/20 border-amber-400/50 text-amber-400",
    hard: "bg-red-400/20 border-red-400/50 text-red-400",
  };

  function buildCard(w) {
    var tags = w.tags
      .map(function (tag, i) {
        return (
          '<span class="text-xs px-2 py-0.5 rounded-lg border secondary-font ' +
          TAG_COLORS[i % TAG_COLORS.length] +
          '">#' +
          tag +
          "</span>"
        );
      })
      .join("");

    var levelBadge = "";
    if (w.level && LEVEL_STYLES[w.level]) {
      levelBadge =
        '<span class="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-sm z-10 ' +
        LEVEL_STYLES[w.level] +
        '">' +
        w.level +
        "</span>";
    }

    return (
      '<a href="writeup.html?id=' +
      w.id +
      '" class="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(164,240,0,0.06)] transition-all duration-300">' +
      levelBadge +
      (w.image
        ? '<div class="w-full h-36 overflow-hidden bg-background"><img src="' +
          w.image +
          '" alt="" class="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500" /></div>'
        : "") +
      '<div class="flex flex-col gap-3 p-5 flex-1">' +
      '<h3 class="text-text-primary text-base font-semibold leading-snug group-hover:text-primary transition-colors duration-300">' +
      w.title +
      "</h3>" +
      '<p class="text-text-secondary text-sm leading-relaxed line-clamp-3">' +
      w.description +
      "</p>" +
      '<div class="flex flex-wrap gap-2 mt-auto pt-2">' +
      tags +
      "</div>" +
      '<div class="flex items-center justify-between mt-3 pt-3 border-t border-border/60">' +
      '<span class="text-xs text-text-muted secondary-font"><i class="fa-solid fa-calendar-days mr-1.5"></i>' +
      w.date +
      "</span>" +
      '<span class="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">Read <i class="fa-solid fa-arrow-right ml-1"></i></span>' +
      "</div>" +
      "</div>" +
      "</a>"
    );
  }

  try {
    var res = await fetch("writeups/manifest.json");
    if (!res.ok) throw new Error("Failed to fetch manifest");
    var writeups = await res.json();

    loading.classList.add("hidden");

    if (!writeups.length) {
      empty.classList.remove("hidden");
      empty.classList.add("flex");
      return;
    }

    writeups.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    grid.innerHTML = writeups.map(buildCard).join("");
  } catch (err) {
    console.error("Failed to load writeups:", err);
    loading.classList.add("hidden");
    empty.classList.remove("hidden");
    empty.classList.add("flex");
  }
})();
