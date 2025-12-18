/*************************************************
 * 공통 유틸
 *************************************************/
function add(target, src, mul = 1) {
    for (let k in src) {
        target[k] = (target[k] || 0) + src[k] * mul;
    }
}





// 세트 모드 체크
const setSwitcher = document.getElementById('switcher-set');

// 모든 입력칸 선택
const inputs = document.querySelectorAll('.input-grid input');

// 세트 당 개수
const SET_COUNT = 64;

// 입력값이 바뀔 때 세트/나머지 표시 업데이트
inputs.forEach(input => {
    // span 표시용 element 생성
    const span = document.createElement('span');
    span.className = 'set-display';
    input.parentNode.appendChild(span);

    input.addEventListener('input', () => updateSetDisplay(input, span));
});

// 스위치 토글 이벤트
setSwitcher.addEventListener('change', () => {
    inputs.forEach(input => {
        const span = input.parentNode.querySelector('.set-display');
        updateSetDisplay(input, span);
    });
});

// 세트/나머지 표시 함수
function updateSetDisplay(input, span) {
    const value = parseInt(input.value) || 0;
    if (setSwitcher.checked) {
        const sets = Math.floor(value / SET_COUNT);
        const remainder = value % SET_COUNT;
        span.textContent = ` ${sets} / ${remainder}`;
    } else {
        span.textContent = '';
    }
}