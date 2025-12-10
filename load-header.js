// load-header.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("header.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("afterbegin", html);
        })
        .catch(err => console.error("header 로딩 오류:", err));
});
