(async function () {
  var grid = document.getElementById("arsenal-grid");
  var loading = document.getElementById("arsenal-loading");
  var empty = document.getElementById("arsenal-empty");

  var TAG_COLORS = ["bg-primary/15 border-primary/40 text-primary"];

  function buildCard(item) {
    var tags = item.tags
      .map(function (tag, i) {
        return (
          '<span class="text-xs px-2 py-0.5 rounded-lg border secondary-font ' +
          TAG_COLORS[i % TAG_COLORS.length] +
          '">' +
          tag +
          "</span>"
        );
      })
      .join("");

    return (
      '<a href="' +
      item.link +
      '" target="_blank" rel="noopener noreferrer" class="group flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(164,240,0,0.06)] transition-all duration-300">' +
      (item.image
        ? '<div class="w-full h-36 overflow-hidden bg-background"><img src="' +
          item.image +
          '" alt="" class="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500" /></div>'
        : "") +
      '<div class="flex flex-col gap-3 p-5 flex-1">' +
      '<h3 class="text-text-primary text-base font-semibold leading-snug group-hover:text-primary transition-colors duration-300">' +
      item.title +
      "</h3>" +
      '<p class="text-text-secondary text-sm leading-relaxed line-clamp-3">' +
      item.description +
      "</p>" +
      '<div class="flex flex-wrap gap-2 mt-auto pt-2">' +
      tags +
      "</div>" +
      '<div class="flex items-center justify-between mt-3 pt-3 border-t border-border/60">' +
      '<span class="text-xs text-text-muted secondary-font"><i class="fa-brands fa-github mr-1.5"></i>View Repo</span>' +
      '<span class="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>' +
      "</div>" +
      "</div>" +
      "</a>"
    );
  }

  try {
    var res = await fetch("arsenal/arsenal.json");
    if (!res.ok) throw new Error("Failed to fetch arsenal data");
    var items = await res.json();

    loading.classList.add("hidden");

    if (!items.length) {
      empty.classList.remove("hidden");
      empty.classList.add("flex");
      return;
    }

    grid.innerHTML = items.map(buildCard).join("");
  } catch (err) {
    console.error("Failed to load arsenal:", err);
    loading.classList.add("hidden");
    empty.classList.remove("hidden");
    empty.classList.add("flex");
  }
})();
