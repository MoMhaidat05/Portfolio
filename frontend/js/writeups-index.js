(async function () {
  var grid = document.getElementById("writeups-grid");
  var loading = document.getElementById("writeups-loading");
  var empty = document.getElementById("writeups-empty");

  function buildCard(w, index) {
    var tags = w.tags
      .map(function (tag) {
        return '<span class="tag">#' + tag + "</span>";
      })
      .join("");

    var levelBadge = "";
    if (w.level) {
      levelBadge =
        '<span class="difficulty-badge ' + w.level.toLowerCase() + '">' +
        w.level +
        "</span>";
    }

    var platformAvatar = "";
    if (w.image) {
      platformAvatar =
        '<img src="' + w.image + '" alt="" class="w-6 h-6 rounded object-contain border border-border bg-background p-0.5" />';
    }

    var delayClass = "delay-" + ((Math.min(index + 1, 8)) * 100);

    return (
      '<a href="writeup.html?id=' + w.id + '" class="card relative flex flex-col p-6 md:p-8 group animate-fade-in-up ' + delayClass + '">' +
        levelBadge +
        '<div class="flex items-center justify-between mb-4">' +
          '<span class="text-xs text-text-muted secondary-font"><i class="fa-solid fa-calendar-days mr-1.5"></i>' + w.date + "</span>" +
          platformAvatar +
        "</div>" +
        '<h3 class="text-text-primary text-lg font-bold leading-snug heading-font group-hover:text-primary transition-colors duration-300 mb-2">' + w.title + "</h3>" +
        '<p class="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-5">' + w.description + "</p>" +
        '<div class="flex flex-wrap gap-1.5 mt-auto">' + tags + "</div>" +
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
