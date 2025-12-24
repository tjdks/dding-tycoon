/*************************************************
 * 해양 계산기 - 공통 유틸리티 함수
 *************************************************/

import { SET_COUNT, PREMIUM_PRICE_RATE } from './ocean-config.js';

/**
 * 숫자를 세트/나머지 형식으로 변환
 * @param {number} num - 변환할 숫자
 * @returns {string} "세트 / 나머지" 형식 문자열
 */
export function formatSet(num) {
    const sets = Math.floor(num / SET_COUNT);
    const remainder = num % SET_COUNT;
    return `${sets} / ${remainder}`;
}

/**
 * 프리미엄 비율 가져오기
 * @returns {number} 프리미엄 비율 (0~0.5)
 */
export function getPremiumRate() {
    const lv = +(document.getElementById("info-expert-premium-price")?.value) || 0;
    return PREMIUM_PRICE_RATE[lv] || 0;
}

/**
 * 프리미엄 텍스트 가져오기
 * @param {number} rate - 프리미엄 비율
 * @returns {string} "+X%" 형식 문자열
 */
export function getPremiumText(rate) {
    return rate ? `+${Math.floor(rate * 100)}%` : '+0%';
}

/**
 * 요소 가져오기 (null 체크 포함)
 * @param {string} id - 요소 ID
 * @returns {HTMLElement|null}
 */
export function getElement(id) {
    return document.getElementById(id);
}

/**
 * 요소 텍스트 업데이트
 * @param {string} id - 요소 ID
 * @param {string|number} text - 설정할 텍스트
 */
export function updateText(id, text) {
    const elem = getElement(id);
    if (elem) elem.textContent = text;
}

/**
 * 입력값 가져오기 (숫자)
 * @param {string} id - 입력 요소 ID
 * @param {number} defaultValue - 기본값
 * @returns {number}
 */
export function getInputNumber(id, defaultValue = 0) {
    const value = +(getElement(id)?.value);
    return isNaN(value) ? defaultValue : value;
}

/**
 * 설명 토글
 * @param {string} id - 토글할 요소 ID
 */
export function toggleDesc(id) {
    const elem = getElement(id);
    if (!elem) return;
    elem.style.display = (elem.style.display === 'none' || elem.style.display === '') ? 'block' : 'none';
}

/**
 * 세트 모드 여부 확인
 * @returns {boolean}
 */
export function isSetMode() {
    const setSwitcher = getElement('switcher-set');
    return setSwitcher && setSwitcher.checked;
}

/**
 * 고급 모드 여부 확인
 * @returns {boolean}
 */
export function isAdvancedMode() {
    const advancedSwitcher = getElement('switcher-advanced');
    return advancedSwitcher && advancedSwitcher.checked;
}

/**
 * 값 포맷팅 (세트 모드에 따라)
 * @param {number} num - 포맷팅할 숫자
 * @returns {string|number}
 */
export function formatValue(num) {
    return isSetMode() ? formatSet(num) : num;
}

/**
 * 재료 카드 HTML 생성
 * @param {Array} materials - [{icon, name, value}] 형식 배열
 * @returns {string} HTML 문자열
 */
export function createMaterialCardsHTML(materials) {
    return `
        <div class="result-materials-grid">
            ${materials.map(m => `
                <div class="material-card">
                    <div class="icon"><img src="img/${m.icon}.png" alt="${m.name}"></div>
                    <div class="name">${m.name}</div>
                    <div class="value">${formatValue(m.value)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 간단한 재료 텍스트 HTML 생성
 * @param {Array} materials - [{name, value}] 형식 배열
 * @returns {string} HTML 문자열
 */
export function createMaterialTextHTML(materials) {
    return `
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            ${materials.map(m => `
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>${m.name}</strong> ${formatValue(m.value)}
                </span>
            `).join('')}
        </div>
    `;
}

// 전역 함수로 노출 (HTML onclick에서 사용)
window.toggleDesc = toggleDesc;
