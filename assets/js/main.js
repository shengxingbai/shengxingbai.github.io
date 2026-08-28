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

// 文章目录（TOC）：根据正文 h2/h3 生成左侧锚点导航，并高亮当前章节
(function () {
  var tocList = document.getElementById("toc-list");
  if (!tocList) return;
  var content = document.querySelector(".post-content");
  if (!content) return;

  var headers = content.querySelectorAll("h2, h3");
  if (headers.length === 0) {
    var sidebar = document.querySelector(".toc-sidebar");
    if (sidebar) sidebar.style.display = "none";
    return;
  }

  // 1) 为标题补齐 id，并构建目录
  var links = [];
  var root = document.createElement("ul");
  root.className = "toc-list";
  var currentH2 = null;
  Array.prototype.forEach.call(headers, function (h, i) {
    if (!h.id) h.id = "section-" + (i + 1);
    var a = document.createElement("a");
    a.className = "toc-link";
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    a.setAttribute("data-target", h.id);
    var li = document.createElement("li");
    li.appendChild(a);
    links.push(a);
    if (h.tagName === "H2") {
      currentH2 = li;
      var sub = document.createElement("ul");
      sub.className = "toc-sublist";
      li.appendChild(sub);
      root.appendChild(li);
    } else {
      if (currentH2) {
        currentH2.querySelector(".toc-sublist").appendChild(li);
      } else {
        root.appendChild(li);
      }
    }
  });
  tocList.appendChild(root);

  // 2) 滚动时高亮当前所在章节
  var HEADER_OFFSET = 90; // sticky 头部高度 + 余量
  var ticking = false;
  function updateActive() {
    ticking = false;
    var currentId = null;
    for (var i = 0; i < headers.length; i++) {
      var top = headers[i].getBoundingClientRect().top;
      if (top - HEADER_OFFSET <= 0) {
        currentId = headers[i].id;
      } else {
        break;
      }
    }
    // 滚到页面底部时高亮最后一节
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 4 && headers.length) {
      currentId = headers[headers.length - 1].id;
    }
    if (!currentId && headers.length) currentId = headers[0].id;
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-target") === currentId);
    });
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateActive();
})();
