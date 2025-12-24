/*************************************************
 * 1성 계산기 - 최적화 버전
 *************************************************/

import { GOLD_PRICES, CORE_TO_ESSENCE_1STAR, ESSENCE_TO_BLOCK_1STAR, CORE_TO_FISH_1STAR } from './ocean-config.js';
import { 
    getPremiumRate, getPremiumText, getInputNumber, updateText, 
    isAdvancedMode, createMaterialCardsHTML, createMaterialTextHTML
} from './ocean-utils.js';
import { setupAdvancedToggle } from './ocean-ui.js';

// 전역 결과 저장
let lastResult = null;

/**
 * 1성 계산 메인 함수
 * @param {Object} input - 입력 데이터
 * @returns {Object|null} 계산 결과
 */
function calculate(input) {
    const isAdvanced = Number.isFinite(input.coreWG) && input.coreWG >= 0;

    // 총 가용 자원
    const totalFish = {
        guard: input.guard,
        wave: input.wave,
        chaos: input.chaos,
        life: input.life,
        decay: input.decay
    };

    const totalEss = {
        guard: (input.essGuard || 0),
        wave: (input.essWave || 0),
        chaos: (input.essChaos || 0),
        life: (input.essLife || 0),
        decay: (input.essDecay || 0)
    };

    const totalCore = isAdvanced ? {
        WG: input.coreWG || 0,
        WP: input.coreWP || 0,
        OD: input.coreOD || 0,
        VD: input.coreVD || 0,
        ED: input.coreED || 0
    } : { WG: 0, WP: 0, OD: 0, VD: 0, ED: 0 };

    // 최대 제작 가능 개수 계산
    const maxA_WG = totalCore.WG + Math.floor((totalFish.guard + totalEss.guard + totalFish.wave + totalEss.wave) / 2);
    const maxA_OD = totalCore.OD + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.life + totalEss.life) / 2);
    const maxA_VD = totalCore.VD + Math.floor((totalFish.life + totalEss.life + totalFish.decay + totalEss.decay) / 2);
    const maxA = Math.min(maxA_WG, maxA_OD, maxA_VD);

    const maxK_WP = totalCore.WP + Math.floor((totalFish.wave + totalEss.wave + totalFish.chaos + totalEss.chaos) / 2);
    const maxK_OD = totalCore.OD + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.life + totalEss.life) / 2);
    const maxK_VD = totalCore.VD + Math.floor((totalFish.life + totalEss.life + totalFish.decay + totalEss.decay) / 2);
    const maxK = Math.min(maxK_WP, maxK_OD, maxK_VD);

    const maxL_WG = totalCore.WG + Math.floor((totalFish.guard + totalEss.guard + totalFish.wave + totalEss.wave) / 2);
    const maxL_WP = totalCore.WP + Math.floor((totalFish.wave + totalEss.wave + totalFish.chaos + totalEss.chaos) / 2);
    const maxL_ED = totalCore.ED + Math.floor((totalFish.decay + totalEss.decay + totalFish.guard + totalEss.guard) / 2);
    const maxL = Math.min(maxL_WG, maxL_WP, maxL_ED);

    let best = { gold: -1, A: 0, K: 0, L: 0 };

    // 최적화된 루프
    for (let A = 0; A <= maxA; A++) {
        for (let K = 0; K <= maxK; K++) {
            for (let L = 0; L <= maxL; L++) {
                const needCore = {
                    WG: A + L,
                    WP: K + L,
                    OD: A + K,
                    VD: A + K,
                    ED: L
                };

                const makeCore = {
                    WG: Math.max(0, needCore.WG - totalCore.WG),
                    WP: Math.max(0, needCore.WP - totalCore.WP),
                    OD: Math.max(0, needCore.OD - totalCore.OD),
                    VD: Math.max(0, needCore.VD - totalCore.VD),
                    ED: Math.max(0, needCore.ED - totalCore.ED)
                };

                const needEss = {
                    guard: makeCore.WG + makeCore.ED,
                    wave: makeCore.WG + makeCore.WP,
                    chaos: makeCore.WP + makeCore.OD,
                    life: makeCore.OD + makeCore.VD,
                    decay: makeCore.VD + makeCore.ED
                };

                const makeFish = {
                    guard: Math.max(0, needEss.guard - totalEss.guard),
                    wave: Math.max(0, needEss.wave - totalEss.wave),
                    chaos: Math.max(0, needEss.chaos - totalEss.chaos),
                    life: Math.max(0, needEss.life - totalEss.life),
                    decay: Math.max(0, needEss.decay - totalEss.decay)
                };

                if (
                    makeFish.guard > totalFish.guard ||
                    makeFish.wave > totalFish.wave ||
                    makeFish.chaos > totalFish.chaos ||
                    makeFish.life > totalFish.life ||
                    makeFish.decay > totalFish.decay
                ) continue;

                const gold = A * GOLD_PRICES['1star'].A + K * GOLD_PRICES['1star'].K + L * GOLD_PRICES['1star'].L;
                if (gold > best.gold) {
                    best = { gold, A, K, L };
                }
            }
        }
    }

    if (best.gold < 0) return null;

    // 결과 계산
    return buildResult(best, totalCore, totalEss);
}

/**
 * 결과 객체 생성
 */
function buildResult(best, totalCore, totalEss) {
    const coreNeed = {
        WG: best.A + best.L,
        WP: best.K + best.L,
        OD: best.A + best.K,
        VD: best.A + best.K,
        ED: best.L
    };

    const coreToMake = {
        WG: Math.max(0, coreNeed.WG - totalCore.WG),
        WP: Math.max(0, coreNeed.WP - totalCore.WP),
        OD: Math.max(0, coreNeed.OD - totalCore.OD),
        VD: Math.max(0, coreNeed.VD - totalCore.VD),
        ED: Math.max(0, coreNeed.ED - totalCore.ED)
    };

    const essNeedForCore = {
        guard: coreToMake.WG + coreToMake.ED,
        wave: coreToMake.WG + coreToMake.WP,
        chaos: coreToMake.WP + coreToMake.OD,
        life: coreToMake.OD + coreToMake.VD,
        decay: coreToMake.VD + coreToMake.ED
    };

    const essToMake = {
        guard: Math.max(0, essNeedForCore.guard - totalEss.guard),
        wave: Math.max(0, essNeedForCore.wave - totalEss.wave),
        chaos: Math.max(0, essNeedForCore.chaos - totalEss.chaos),
        life: Math.max(0, essNeedForCore.life - totalEss.life),
        decay: Math.max(0, essNeedForCore.decay - totalEss.decay)
    };

    const blockNeed = {
        clay: essToMake.guard * 1,
        sand: essToMake.wave * 3,
        dirt: essToMake.chaos * 4,
        gravel: essToMake.life * 2,
        granite: essToMake.decay * 1
    };

    const fishNeed = {
        shrimp: coreToMake.WG,
        domi: coreToMake.WP,
        herring: coreToMake.OD,
        goldfish: coreToMake.VD,
        bass: coreToMake.ED
    };

    const essNeedTotal = {
        guard: coreNeed.WG + coreNeed.ED,
        wave: coreNeed.WG + coreNeed.WP,
        chaos: coreNeed.WP + coreNeed.OD,
        life: coreNeed.OD + coreNeed.VD,
        decay: coreNeed.VD + coreNeed.ED
    };

    const blockNeedTotal = {
        clay: essNeedTotal.guard * 1,
        sand: essNeedTotal.wave * 3,
        dirt: essNeedTotal.chaos * 4,
        gravel: essNeedTotal.life * 2,
        granite: essNeedTotal.decay * 1
    };

    const fishNeedTotal = {
        shrimp: coreNeed.WG,
        domi: coreNeed.WP,
        herring: coreNeed.OD,
        goldfish: coreNeed.VD,
        bass: coreNeed.ED
    };

    return { 
        best, 
        coreNeed, coreToMake,
        essNeedTotal, essToMake,
        blockNeed, blockNeedTotal,
        fishNeed, fishNeedTotal
    };
}

/**
 * 결과 업데이트
 */
function updateResult(result) {
    if (!result) return;

    const rate = getPremiumRate();
    updateText("result-gold-1", Math.floor(result.best.gold * (1 + rate)).toLocaleString());
    updateText("result-premium-bonus-1", getPremiumText(rate));
    updateText("result-acutis-1", result.best.A);
    updateText("result-frenzy-1", result.best.K);
    updateText("result-feather-1", result.best.L);

    const advanced = isAdvancedMode();
    const essData = advanced ? result.essToMake : result.essNeedTotal;
    const coreData = advanced ? result.coreToMake : result.coreNeed;
    const blockData = advanced ? result.blockNeed : result.blockNeedTotal;
    const fishData = advanced ? result.fishNeed : result.fishNeedTotal;

    // 정수
    document.getElementById("result-essence-1").innerHTML = createMaterialCardsHTML([
        { icon: 'essence_guard', name: '수호 정수', value: essData.guard || 0 },
        { icon: 'essence_wave', name: '파동 정수', value: essData.wave || 0 },
        { icon: 'essence_chaos', name: '혼란 정수', value: essData.chaos || 0 },
        { icon: 'essence_life', name: '생명 정수', value: essData.life || 0 },
        { icon: 'essence_decay', name: '부식 정수', value: essData.decay || 0 }
    ]);

    // 핵
    document.getElementById("result-core-1").innerHTML = createMaterialCardsHTML([
        { icon: 'core_wg', name: '물결 수호', value: coreData.WG || 0 },
        { icon: 'core_wp', name: '파동 오염', value: coreData.WP || 0 },
        { icon: 'core_od', name: '질서 파괴', value: coreData.OD || 0 },
        { icon: 'core_vd', name: '활력 붕괴', value: coreData.VD || 0 },
        { icon: 'core_ed', name: '침식 방어', value: coreData.ED || 0 }
    ]);

    // 블록
    document.getElementById("result-block-1").innerHTML = createMaterialTextHTML([
        { name: '점토', value: blockData.clay },
        { name: '모래', value: blockData.sand },
        { name: '흙', value: blockData.dirt },
        { name: '자갈', value: blockData.gravel },
        { name: '화강암', value: blockData.granite }
    ]);

    // 물고기
    document.getElementById("result-fish-1").innerHTML = createMaterialTextHTML([
        { name: '새우', value: fishData.shrimp },
        { name: '도미', value: fishData.domi },
        { name: '청어', value: fishData.herring },
        { name: '금붕어', value: fishData.goldfish },
        { name: '농어', value: fishData.bass }
    ]);

    lastResult = result;
}

/**
 * 실행 함수
 */
export function run() {
    const advanced = isAdvancedMode();

    const input = {
        guard: getInputNumber("input-oyster-1"),
        wave: getInputNumber("input-shell-1"),
        chaos: getInputNumber("input-octopus-1"),
        life: getInputNumber("input-seaweed-1"),
        decay: getInputNumber("input-urchin-1")
    };

    if (advanced) {
        input.essGuard = getInputNumber("input-essence-guard-1");
        input.essWave = getInputNumber("input-essence-wave-1");
        input.essChaos = getInputNumber("input-essence-chaos-1");
        input.essLife = getInputNumber("input-essence-life-1");
        input.essDecay = getInputNumber("input-essence-decay-1");

        input.coreWG = getInputNumber("input-core-wg-1");
        input.coreWP = getInputNumber("input-core-wp-1");
        input.coreOD = getInputNumber("input-core-od-1");
        input.coreVD = getInputNumber("input-core-vd-1");
        input.coreED = getInputNumber("input-core-ed-1");
    } else {
        input.essGuard = input.essWave = input.essChaos = input.essLife = input.essDecay = 0;
        input.coreWG = input.coreWP = input.coreOD = input.coreVD = input.coreED = 0;
    }

    const result = calculate(input);
    if (!result) {
        alert("재료 부족");
        return;
    }

    updateResult(result);
}

/**
 * 재업데이트 (세트 모드 변경 시)
 */
export function refresh() {
    if (lastResult) updateResult(lastResult);
}

/**
 * 초기화
 */
export function init() {
    setupAdvancedToggle(1);
}

// 전역 함수로 노출
window.run1StarOptimization = run;
