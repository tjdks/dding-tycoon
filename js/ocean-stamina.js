/*************************************************
 * 스태미나 계산기 - 개선 버전
 *************************************************/

import { ROD_DATA, EXPERT_SKILLS } from './ocean-config.js';
import { getInputNumber, getElement } from './ocean-utils.js';

const STAMINA_PER_GATHER = 15;

/**
 * 스태미나 시뮬레이션 실행
 */
export function runSimulation() {
    const stamina = getInputNumber("input-stamina");
    const item = getElement("stamina-item-select")?.value;

    if (!stamina) {
        alert("스태미나를 입력해주세요.");
        return;
    }

    // 전문가 값 가져오기
    const rodLV = getInputNumber("info-expert-rod", 1);
    const stormLV = getInputNumber("expert-storm");
    const starLV = getInputNumber("expert-star");
    const clamLV = getInputNumber("expert-clam-refill");

    const gatherCount = Math.floor(stamina / STAMINA_PER_GATHER);

    // 낚싯대 드롭 수와 조개 확률
    const rodInfo = ROD_DATA[rodLV] || { drop: 1, clamRate: 0 };
    let totalDrops = gatherCount * rodInfo.drop;

    // 폭풍의 물질꾼 (비 오는 날 가정)
    const isRain = true;
    if (stormLV > 0 && isRain) {
        totalDrops = Math.floor(totalDrops * (1 + (EXPERT_SKILLS.storm[stormLV] || 0)));
    }

    // 등급별 분배
    const { count1, count2, count3 } = distributeByRarity(totalDrops, starLV);

    // 조개 계산
    const clamRate = rodInfo.clamRate + (EXPERT_SKILLS.clamRefill[clamLV] || 0);
    const clamCount = Math.floor(gatherCount * clamRate);

    // 결과 출력
    displayResult(item, count1, count2, count3, clamCount);
}

/**
 * 등급별 분배 (정수 기반)
 * @param {number} totalDrops - 총 드롭 수
 * @param {number} starLV - 별별별 레벨
 * @returns {Object} {count1, count2, count3}
 */
function distributeByRarity(totalDrops, starLV) {
    const rate3 = 0.1 + 0.01 * starLV; // 3성
    const rate2 = 0.3;                  // 2성
    const rate1 = 1 - rate2 - rate3;    // 1성

    // 소수 기반 계산
    let raw1 = totalDrops * rate1;
    let raw2 = totalDrops * rate2;
    let raw3 = totalDrops * rate3;

    // 정수 변환
    let count1 = Math.floor(raw1);
    let count2 = Math.floor(raw2);
    let count3 = Math.floor(raw3);

    // 나머지 배분
    let remainder = totalDrops - (count1 + count2 + count3);
    const probOrder = [
        { key: 'count3', frac: raw3 - count3 },
        { key: 'count2', frac: raw2 - count2 },
        { key: 'count1', frac: raw1 - count1 }
    ].sort((a, b) => b.frac - a.frac);

    const counts = { count1, count2, count3 };
    for (let i = 0; i < remainder; i++) {
        counts[probOrder[i % 3].key]++;
    }

    return counts;
}

/**
 * 결과 표시
 */
function displayResult(item, count1, count2, count3, clamCount) {
    const html = `
        <div class="stamina-result-products">
            <div>${item}★ <span>${count1}</span></div>
            <div>${item}★★ <span>${count2}</span></div>
            <div>${item}★★★ <span>${count3}</span></div>
            <div>조개 <span>${clamCount}</span></div>
        </div>
    `;
    const resultElem = getElement("stamina-item-list");
    if (resultElem) resultElem.innerHTML = html;
}

/**
 * 전문가 요약 업데이트
 */
export function updateExpertSummary() {
    const rodLV = getInputNumber("info-expert-rod", 1);
    const stormLV = getInputNumber("expert-storm");
    const starLV = getInputNumber("expert-star");
    const clamLV = getInputNumber("expert-clam-refill");

    const summaryElem = getElement("stamina-expert-summary");
    if (summaryElem) {
        summaryElem.textContent = 
            `(폭풍 ${stormLV}LV, 별별별 ${starLV}LV, 조개 무한리필 ${clamLV}LV, 낚싯대 ${rodLV}강 적용)`;
    }
}

/**
 * 초기화
 */
export function init() {
    // 계산 버튼
    const calcBtn = getElement("stamina-calc-btn");
    if (calcBtn) {
        calcBtn.addEventListener("click", runSimulation);
    }

    // 전문가 입력 변경 시 요약 업데이트
    const expertInputIds = [
        "info-expert-rod",
        "expert-storm",
        "expert-star",
        "expert-clam-refill"
    ];

    expertInputIds.forEach(id => {
        const input = getElement(id);
        if (input) {
            input.addEventListener("input", updateExpertSummary);
        }
    });

    // 초기 요약 반영
    updateExpertSummary();
}

// 전역 함수로 노출
window.runStaminaSimulation = runSimulation;
window.updateStaminaExpertSummary = updateExpertSummary;
