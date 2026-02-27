(async function () {
  var list = document.getElementById("achievements-list");
  var loading = document.getElementById("achievements-loading");
  var empty = document.getElementById("achievements-empty");

  var CATEGORY_STYLES = {
    "Bug Bounty": "text-red-400 border-red-400/50 bg-red-400/15",
    Research: "text-sky-400 border-sky-400/50 bg-sky-400/15",
    CTF: "text-yellow-300 border-yellow-300/50 bg-yellow-300/15",
    Leadership: "text-purple-400 border-purple-400/50 bg-purple-400/15",
    Certification: "text-green-400 border-green-400/50 bg-green-400/15",
  };

  var DOT_COLORS = {
    "Bug Bounty": "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    Research: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]",
    CTF: "bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.5)]",
    Leadership: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]",
    Certification: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]",
  };

  function fallbackStyle() {
    return "text-teal-300 border-teal-300/50 bg-teal-300/15";
  }

  function fallbackDot() {
    return "bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.5)]";
  }

  function buildEntry(item) {
    var catClass = CATEGORY_STYLES[item.category] || fallbackStyle();
    var dotClass = DOT_COLORS[item.category] || fallbackDot();

    var linkHtml = "";
    if (item.url) {
      linkHtml =
        '<a href="' +
        item.url +
        '" class="inline-flex items-center gap-1.5 text-xs text-primary hover:text-secondary transition-colors duration-300 mt-2">' +
        '<i class="fa-solid fa-arrow-up-right-from-square"></i>View details</a>';
    }

    return (
      '<div class="relative pl-10 group">' +
      '<div class="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full ' +
      dotClass +
      '"></div>' +
      '<div class="pb-10">' +
      '<div class="flex flex-wrap items-center gap-3 mb-2">' +
      '<span class="text-xs secondary-font tracking-wider text-text-muted">' +
      item.dateLabel +
      "</span>" +
      '<span class="text-xs px-2 py-0.5 rounded-lg border secondary-font ' +
      catClass +
      '">' +
      item.category +
      "</span>" +
      "</div>" +
      '<h3 class="text-text-primary text-base font-semibold leading-snug">' +
      item.title +
      "</h3>" +
      '<p class="text-text-secondary text-sm leading-relaxed mt-1.5 max-w-lg">' +
      item.description +
      "</p>" +
      linkHtml +
      "</div>" +
      "</div>"
    );
  }

  try {
    var res = await fetch("achievements/achievements.json");
    if (!res.ok) throw new Error("Failed to fetch achievements");
    var items = await res.json();

    loading.classList.add("hidden");

    if (!items.length) {
      empty.classList.remove("hidden");
      empty.classList.add("flex");
      return;
    }

    items.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    list.innerHTML = items.map(buildEntry).join("");
  } catch (err) {
    console.error("Failed to load achievements:", err);
    loading.classList.add("hidden");
    empty.classList.remove("hidden");
    empty.classList.add("flex");
  }
})();
