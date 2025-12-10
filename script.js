function openTab(tabName, clickedButton) {
    // 모든 section 숨김
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => tab.style.display = "none");

    // 클릭한 탭만 표시
    document.getElementById(tabName).style.display = "block";

    // 모든 nav a에서 active 제거
    const links = document.querySelectorAll("nav a");
    links.forEach(link => link.classList.remove("active"));

    // 클릭한 버튼에 active 추가
    clickedButton.classList.add("active");

    // 슬라이더 이동
    const slider = document.getElementById('slider');
    slider.style.width = clickedButton.offsetWidth + 'px';
    slider.style.left = clickedButton.offsetLeft + 'px';
    slider.style.height = clickedButton.offsetHeight + 'px'; // 버튼 높이 맞춤
    slider.style.top = clickedButton.offsetTop + clickedButton.offsetHeight/2 + 'px';
    slider.style.transform = 'translateY(-50%)';

    
}

// 처음 로드시 홈 탭 선택 및 슬라이더 위치 초기화
window.onload = function() {
    const homeBtn = document.getElementById('tab-home');
    openTab('home', homeBtn);
};