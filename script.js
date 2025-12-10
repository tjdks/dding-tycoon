// ------------------------------
// 네비게이션 활성화 표시
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 현재 페이지 파일명
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href");
        if (linkPage === currentPage) {
            link.classList.add("active");  // 현재 페이지 버튼 강조
        }
    });
});

// ------------------------------
// 해양 페이지 전용 기능 (필요하면 더 확장 가능)
// ------------------------------
function oceanFeature() {
    console.log("해양 페이지 기능 실행됨!");
    // 여기에 나중에 계산기, 버튼 기능 등 넣을 수 있음
}
