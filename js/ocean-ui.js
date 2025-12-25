/*************************************************
 * 해양 계산기 - UI 관리
 *************************************************/

import { formatSet, isSetMode } from './ocean-utils.js';

/**
 * 탭 전환 설정
 */
export function setupTabs() {
    document.querySelectorAll(".sub-header-inner a").forEach(tab => {
        tab.addEventListener("click", e => {
            e.preventDefault();

            // 탭 active 처리
            document.querySelectorAll(".sub-header-inner a")
                .forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // 콘텐츠 전환
            const targetId = tab.dataset.target;
            if (!targetId) return;

            document.querySelectorAll(".tab-content")
                .forEach(c => c.style.display = "none");

            const target = document.getElementById(targetId);
            if (target) target.style.display = "block";
        });
    });
}

/**
 * 성급 전환
 * @param {string} level - 성급 (1, 2, 3)
 */
export function switchStarLevel(level) {
    document.querySelectorAll('.star-level').forEach(card => card.style.display = 'none');
    const current = document.getElementById('star-' + level);
    if (current) {
        current.style.display = 'block';
        setupInputSetDisplay(current);
    }
}

/**
 * 입력칸 세트 표시 설정
 * @param {HTMLElement} container - 컨테이너 요소
 */
export function setupInputSetDisplay(container) {
    const inputs = container.querySelectorAll('.input-grid input[type="number"]');
    
    inputs.forEach(input => {
        // span 한 번만 생성
        let span = input.parentNode.querySelector('.set-display');
        if (!span) {
            span = document.createElement('span');
            span.className = 'set-display';
            input.parentNode.appendChild(span);
        }

        // 이벤트 한 번만 등록
        if (!input.dataset.setListenerAdded) {
            input.addEventListener('input', () => updateInputSpan(input, span));
            input.dataset.setListenerAdded = 'true';
        }

        // 초기값 반영
        updateInputSpan(input, span);
    });
}

/**
 * 입력칸 span 업데이트
 * @param {HTMLInputElement} input - 입력 요소
 * @param {HTMLElement} span - span 요소
 */
function updateInputSpan(input, span) {
    const value = parseInt(input.value) || 0;
    span.textContent = isSetMode() ? ` ${formatSet(value)}` : '';
}

/**
 * 고급 입력 모드 토글 설정
 * @param {number} starLevel - 성급 (1, 2, 3)
 */
export function setupAdvancedToggle(starLevel) {
    const advancedSwitcher = document.getElementById('switcher-advanced');
    if (!advancedSwitcher) return;

    advancedSwitcher.addEventListener('change', function() {
        const advancedInputs = document.getElementById(`advanced-inputs-${starLevel}`);
        if (advancedInputs) {
            if (this.checked) {
                advancedInputs.classList.add('active');
            } else {
                advancedInputs.classList.remove('active');
            }
        }
    });
}

/**
 * 세트 스위처 이벤트 설정
 * @param {Function} updateCallback - 업데이트 콜백 함수들
 */
export function setupSetSwitcher(updateCallback) {
    const setSwitcher = document.getElementById('switcher-set');
    if (!setSwitcher) return;

    setSwitcher.addEventListener('change', () => {
        // 현재 보이는 성급의 입력칸 업데이트
        const currentStar = document.querySelector('.star-level:not([style*="display: none"])');
        if (currentStar) setupInputSetDisplay(currentStar);

        // 결과 재표시
        if (updateCallback) updateCallback();
    });
}

// 전역 함수로 노출
window.switchStarLevel = switchStarLevel;