(async function () {
  var list = document.getElementById("achievements-list");
  var loading = document.getElementById("achievements-loading");
  var empty = document.getElementById("achievements-empty");

  function buildEntry(item, index) {
    var dotClass = index === 0 ? "timeline-dot-solid" : "timeline-dot-solid muted";
    var dateColorClass = index === 0 ? "text-primary" : "text-text-muted";
    var delayClass = "delay-" + ((Math.min(index + 1, 8)) * 100);

    var linkHtml = "";
    if (item.url) {
      linkHtml =
        '<a href="' +
        item.url +
        '" class="inline-flex items-center gap-1.5 text-xs text-primary hover:text-secondary transition-colors duration-300 mt-3">' +
        '<i class="fa-solid fa-arrow-up-right-from-square"></i>View details</a>';
    }

    return (
      '<div class="timeline-entry animate-fade-in-up ' + delayClass + '">' +
        '<div class="' + dotClass + '"></div>' +
        '<div class="card p-6">' +
          '<div class="flex flex-wrap items-center gap-3 mb-2">' +
            '<span class="text-xs secondary-font tracking-wider ' + dateColorClass + '">' + item.dateLabel + '</span>' +
            '<span class="tag">' + item.category + '</span>' +
          '</div>' +
          '<h3 class="text-text-primary text-base font-semibold heading-font leading-snug">' + item.title + '</h3>' +
          '<p class="text-text-secondary text-sm leading-relaxed mt-1.5 max-w-xl">' + item.description + '</p>' +
          linkHtml +
        '</div>' +
      '</div>'
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
