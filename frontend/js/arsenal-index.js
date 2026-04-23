(async function () {
  var grid = document.getElementById("arsenal-grid");
  var loading = document.getElementById("arsenal-loading");
  var empty = document.getElementById("arsenal-empty");

  function buildCard(item, index) {
    var tags = item.tags
      .map(function (tag) {
        return '<span class="tag">#' + tag + "</span>";
      })
      .join("");

    var delayClass = "delay-" + ((Math.min(index + 1, 8)) * 100);

    return (
      '<a href="' + item.link + '" target="_blank" rel="noopener noreferrer" class="card relative flex flex-col p-6 md:p-8 group animate-fade-in-up ' + delayClass + '">' +
        '<div class="flex items-center justify-between mb-4">' +
          '<span class="text-xs text-text-muted secondary-font"><i class="fa-brands fa-github mr-1.5"></i>Repository</span>' +
          '<i class="fa-solid fa-arrow-up-right-from-square text-text-muted group-hover:text-primary transition-colors duration-300"></i>' +
        "</div>" +
        '<h3 class="text-text-primary text-lg font-bold leading-snug heading-font group-hover:text-primary transition-colors duration-300 mb-2">' + item.title + "</h3>" +
        '<p class="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-5">' + item.description + "</p>" +
        '<div class="flex flex-wrap gap-1.5 mt-auto">' + tags + "</div>" +
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
