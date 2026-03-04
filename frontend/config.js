// API base URL for backend. On Render: set data-api-base on <html> or set window.API_BASE before this script.
// Example: <html data-api-base="https://cms-api.onrender.com/api">
(function () {
  var el = document.documentElement;
  var fromHtml = el && el.getAttribute("data-api-base");
  if (fromHtml) {
    window.API_BASE = fromHtml.replace(/\/$/, "") + (fromHtml.indexOf("/api") !== -1 ? "" : "/api");
    return;
  }
  var origin = window.location.origin;
  var isLocal = /localhost|127\.0\.0\.1|^file:\/\//i.test(origin);
  window.API_BASE = window.API_BASE || (isLocal ? "http://localhost:5000/api" : origin + "/api");
})();
