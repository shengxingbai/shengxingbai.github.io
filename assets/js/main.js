// 移动端导航开合
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // 点击菜单项后自动收起
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 博客分类筛选
  var filterBtns = document.querySelectorAll(".filter-btn");
  var items = document.querySelectorAll(".post-item");
  if (filterBtns.length && items.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-category");
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        items.forEach(function (item) {
          var cats = (item.getAttribute("data-category") || "").split(" ").filter(Boolean);
          var show = cat === "all" || cats.indexOf(cat) !== -1;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }
});
