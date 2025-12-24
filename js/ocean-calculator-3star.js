/*************************************************
 * 3성 계산기 - 최적화 버전
 *************************************************/

import { GOLD_PRICES, POTION_TO_ELIXIR_3STAR } from './ocean-config.js';
import { 
    getPremiumRate, getPremiumText, getInputNumber, updateText, 
    isAdvancedMode, getElement, createMaterialCardsHTML, createMaterialTextHTML
} from './ocean-utils.js';
import { setupAdvancedToggle } from './ocean-ui.js';

let lastResult = null;

/**
 * 3성 계산 메인 함수
 */
function calculate(input) {
    const isAdvanced = Number.isFinite(input.potionImmortal) && input.potionImmortal >= 0;

    const totalFish = {
        guard: input.guard || 0,
        wave: input.wave || 0,
        chaos: input.chaos || 0,
        life: input.life || 0,
        decay: input.decay || 0
    };

    const totalElix = {
        guard: (input.elixGuard || 0),
        wave: (input.elixWave || 0),
        chaos: (input.elixChaos || 0),
        life: (input.elixLife || 0),
        decay: (input.elixDecay || 0)
    };

    const totalPotion = isAdvanced ? {
        immortal: input.potionImmortal || 0,
        barrier: input.potionBarrier || 0,
        corrupt: input.potionCorrupt || 0,
        frenzy: input.potionFrenzy || 0,
        venom: input.potionVenom || 0
    } : { immortal: 0, barrier: 0, corrupt: 0, frenzy: 0, venom: 0 };

    // 최대 제작 가능 개수 계산
    const maxImmortal = totalPotion.immortal + Math.floor((totalFish.guard + totalElix.guard + totalFish.life + totalElix.life) / 2);
    const maxBarrier = totalPotion.barrier + Math.floor((totalFish.guard + totalElix.guard + totalFish.wave + totalElix.wave) / 2);
    const maxCorrupt = totalPotion.corrupt + Math.floor((totalFish.chaos + totalElix.chaos + totalFish.decay + totalElix.decay) / 2);
    const maxFrenzy = totalPotion.frenzy + Math.floor((totalFish.chaos + totalElix.chaos + totalFish.life + totalElix.life) / 2);
    const maxVenom = totalPotion.venom + Math.floor((totalFish.wave + totalElix.wave + totalFish.decay + totalElix.decay) / 2);

    const maxAqua = Math.min(maxImmortal, maxBarrier, maxVenom);
    const maxNautilus = Math.min(maxImmortal, maxBarrier, maxFrenzy);
    const maxSpine = Math.min(maxCorrupt, maxFrenzy, maxVenom);

    let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };

    for (let AQUA = 0; AQUA <= maxAqua; AQUA++) {
        for (let NAUTILUS = 0; NAUTILUS <= maxNautilus; NAUTILUS++) {
            for (let SPINE = 0; SPINE <= maxSpine; SPINE++) {
                
                const needPotion = {
                    immortal: AQUA + NAUTILUS,
                    barrier: AQUA + NAUTILUS,
                    corrupt: SPINE,
                    frenzy: NAUTILUS + SPINE,
                    venom: AQUA + SPINE
                };
                
                const makePotion = {
                    immortal: Math.max(0, needPotion.immortal - totalPotion.immortal),
                    barrier: Math.max(0, needPotion.barrier - totalPotion.barrier),
                    corrupt: Math.max(0, needPotion.corrupt - totalPotion.corrupt),
                    frenzy: Math.max(0, needPotion.frenzy - totalPotion.frenzy),
                    venom: Math.max(0, needPotion.venom - totalPotion.venom)
                };

                const needElix = {
                    guard: makePotion.immortal + makePotion.barrier,
                    wave: makePotion.barrier + makePotion.venom,
                    chaos: makePotion.corrupt + makePotion.frenzy,
                    life: makePotion.immortal + makePotion.frenzy,
                    decay: makePotion.corrupt + makePotion.venom
                };

                const makeFish = {
                    guard: Math.max(0, needElix.guard - totalElix.guard),
                    wave: Math.max(0, needElix.wave - totalElix.wave),
                    chaos: Math.max(0, needElix.chaos - totalElix.chaos),
                    life: Math.max(0, needElix.life - totalElix.life),
                    decay: Math.max(0, needElix.decay - totalElix.decay)
                };

                if (
                    makeFish.guard > totalFish.guard ||
                    makeFish.wave > totalFish.wave ||
                    makeFish.chaos > totalFish.chaos ||
                    makeFish.life > totalFish.life ||
                    makeFish.decay > totalFish.decay
                ) continue;

                const gold = AQUA * GOLD_PRICES['3star'].AQUA + NAUTILUS * GOLD_PRICES['3star'].NAUTILUS + SPINE * GOLD_PRICES['3star'].SPINE;
                if (gold > best.gold) {
                    best = { gold, AQUA, NAUTILUS, SPINE };
                }
            }
        }
    }

    if (best.gold < 0) return null;

    return buildResult(best, totalPotion, totalElix, isAdvanced);
}

/**
 * 결과 객체 생성
 */
function buildResult(best, totalPotion, totalElix, isAdvanced) {
    const potionNeed = {
        immortal: best.AQUA + best.NAUTILUS,
        barrier: best.AQUA + best.NAUTILUS,
        corrupt: best.SPINE,
        frenzy: best.NAUTILUS + best.SPINE,
        venom: best.AQUA + best.SPINE
    };

    const potionToMake = {
        immortal: Math.max(0, potionNeed.immortal - totalPotion.immortal),
        barrier: Math.max(0, potionNeed.barrier - totalPotion.barrier),
        corrupt: Math.max(0, potionNeed.corrupt - totalPotion.corrupt),
        frenzy: Math.max(0, potionNeed.frenzy - totalPotion.frenzy),
        venom: Math.max(0, potionNeed.venom - totalPotion.venom)
    };

    const elixNeedForPotion = {
        guard: potionToMake.immortal + potionToMake.barrier,
        wave: potionToMake.barrier + potionToMake.venom,
        chaos: potionToMake.corrupt + potionToMake.frenzy,
        life: potionToMake.immortal + potionToMake.frenzy,
        decay: potionToMake.corrupt + potionToMake.venom
    };

    const elixToMake = {
        guard: Math.max(0, elixNeedForPotion.guard - totalElix.guard),
        wave: Math.max(0, elixNeedForPotion.wave - totalElix.wave),
        chaos: Math.max(0, elixNeedForPotion.chaos - totalElix.chaos),
        life: Math.max(0, elixNeedForPotion.life - totalElix.life),
        decay: Math.max(0, elixNeedForPotion.decay - totalElix.decay)
    };

    const materialNeed = {
        seaSquirt: elixToMake.guard + elixToMake.wave + elixToMake.chaos + elixToMake.life + elixToMake.decay,
        glassBottle: 3 * (elixToMake.guard + elixToMake.wave + elixToMake.chaos + elixToMake.life + elixToMake.decay),
        glowInkSac: potionToMake.immortal + potionToMake.barrier + potionToMake.corrupt + potionToMake.frenzy + potionToMake.venom,
        glowBerry: 2 * (potionToMake.immortal + potionToMake.barrier + potionToMake.corrupt + potionToMake.frenzy + potionToMake.venom)
    };

    const netherNeed = {
        netherrack: 16 * elixToMake.guard,
        magmaBlock: 8 * elixToMake.wave,
        soulSoil: 8 * elixToMake.chaos,
        crimsonStem: 4 * elixToMake.life,
        warpedStem: 4 * elixToMake.decay
    };

    const flowerNeed = {
        cornflower: potionToMake.immortal,
        dandelion: potionToMake.barrier,
        daisy: potionToMake.corrupt,
        poppy: potionToMake.frenzy,
        blueOrchid: potionToMake.venom
    };

    const elixNeedTotal = {
        guard: potionNeed.immortal + potionNeed.barrier,
        wave: potionNeed.barrier + potionNeed.venom,
        chaos: potionNeed.corrupt + potionNeed.frenzy,
        life: potionNeed.immortal + potionNeed.frenzy,
        decay: potionNeed.corrupt + potionNeed.venom
    };

    const materialNeedTotal = {
        seaSquirt: elixNeedTotal.guard + elixNeedTotal.wave + elixNeedTotal.chaos + elixNeedTotal.life + elixNeedTotal.decay,
        glassBottle: 3 * (elixNeedTotal.guard + elixNeedTotal.wave + elixNeedTotal.chaos + elixNeedTotal.life + elixNeedTotal.decay),
        glowInkSac: potionNeed.immortal + potionNeed.barrier + potionNeed.corrupt + potionNeed.frenzy + potionNeed.venom,
        glowBerry: 2 * (potionNeed.immortal + potionNeed.barrier + potionNeed.corrupt + potionNeed.frenzy + potionNeed.venom)
    };

    const netherNeedTotal = {
        netherrack: 16 * elixNeedTotal.guard,
        magmaBlock: 8 * elixNeedTotal.wave,
        soulSoil: 8 * elixNeedTotal.chaos,
        crimsonStem: 4 * elixNeedTotal.life,
        warpedStem: 4 * elixNeedTotal.decay
    };

    const flowerNeedTotal = {
        cornflower: potionNeed.immortal,
        dandelion: potionNeed.barrier,
        daisy: potionNeed.corrupt,
        poppy: potionNeed.frenzy,
        blueOrchid: potionNeed.venom
    };

    return { 
        best,
        potionNeed, potionToMake,
        elixNeedTotal, elixToMake,
        materialNeed, materialNeedTotal,
        netherNeed, netherNeedTotal,
        flowerNeed, flowerNeedTotal,
        isAdvancedMode: isAdvanced
    };
}

/**
 * 결과 업데이트
 */
function updateResult(result) {
    if (!result) return;

    const rate = getPremiumRate();
    updateText("result-gold-3", Math.floor(result.best.gold * (1 + rate)).toLocaleString());
    updateText("result-premium-bonus-3", getPremiumText(rate));
    updateText("result-aqua-3", result.best.AQUA);
    updateText("result-nautilus-3", result.best.NAUTILUS);
    updateText("result-spine-3", result.best.SPINE);

    const advanced = result.isAdvancedMode;
    const elixData = advanced ? result.elixToMake : result.elixNeedTotal;
    const potionData = advanced ? result.potionToMake : result.potionNeed;
    const materialData = advanced ? result.materialNeed : result.materialNeedTotal;
    const netherData = advanced ? result.netherNeed : result.netherNeedTotal;
    const flowerData = advanced ? result.flowerNeed : result.flowerNeedTotal;

    // 엘릭서
    document.getElementById("result-essence-3").innerHTML = createMaterialCardsHTML([
        { icon: 'elixir-guard', name: '수호 엘릭서', value: elixData.guard || 0 },
        { icon: 'elixir-wave', name: '파동 엘릭서', value: elixData.wave || 0 },
        { icon: 'elixir-chaos', name: '혼란 엘릭서', value: elixData.chaos || 0 },
        { icon: 'elixir-life', name: '생명 엘릭서', value: elixData.life || 0 },
        { icon: 'elixir-decay', name: '부식 엘릭서', value: elixData.decay || 0 }
    ]);

    // 의약
    document.getElementById("result-core-3").innerHTML = createMaterialCardsHTML([
        { icon: 'potion-immortal', name: '불멸 재생', value: potionData.immortal || 0 },
        { icon: 'potion-barrier', name: '파동 장벽', value: potionData.barrier || 0 },
        { icon: 'potion-corrupt', name: '타락 침식', value: potionData.corrupt || 0 },
        { icon: 'potion-frenzy', name: '생명 광란', value: potionData.frenzy || 0 },
        { icon: 'potion-venom', name: '맹독 파동', value: potionData.venom || 0 }
    ]);

    // 재료
    document.getElementById("result-material-3").innerHTML = createMaterialTextHTML([
        { name: '불우렁쉥이', value: materialData.seaSquirt },
        { name: '유리병', value: materialData.glassBottle },
        { name: '발광 먹물', value: materialData.glowInkSac },
        { name: '발광 열매', value: materialData.glowBerry }
    ]);

    // 블록
    document.getElementById("result-block-3").innerHTML = createMaterialTextHTML([
        { name: '네더렉', value: netherData.netherrack },
        { name: '마그마', value: netherData.magmaBlock },
        { name: '영혼흙', value: netherData.soulSoil },
        { name: '진홍빛자루', value: netherData.crimsonStem },
        { name: '뒤틀린자루', value: netherData.warpedStem }
    ]);

    // 꽃
    document.getElementById("result-flower-3").innerHTML = createMaterialTextHTML([
        { name: '수레국화', value: flowerData.cornflower },
        { name: '민들레', value: flowerData.dandelion },
        { name: '데이지', value: flowerData.daisy },
        { name: '양귀비', value: flowerData.poppy },
        { name: '선애기별꽃', value: flowerData.blueOrchid }
    ]);

    const resultCard = getElement("result-card-3");
    if (resultCard) resultCard.style.display = "block";

    lastResult = result;
}

/**
 * 실행 함수
 */
export function run() {
    const advanced = isAdvancedMode();

    const input = {
        guard: getInputNumber("input-oyster-3"),
        wave: getInputNumber("input-conch-3"),
        chaos: getInputNumber("input-octopus-3"),
        life: getInputNumber("input-seaweed-3"),
        decay: getInputNumber("input-urchin-3")
    };

    if (advanced) {
        input.elixGuard = getInputNumber("input-elixir-guard-3");
        input.elixWave = getInputNumber("input-elixir-wave-3");
        input.elixChaos = getInputNumber("input-elixir-chaos-3");
        input.elixLife = getInputNumber("input-elixir-life-3");
        input.elixDecay = getInputNumber("input-elixir-decay-3");

        input.potionImmortal = getInputNumber("input-potion-immortal-3");
        input.potionBarrier = getInputNumber("input-potion-barrier-3");
        input.potionCorrupt = getInputNumber("input-potion-corrupt-3");
        input.potionFrenzy = getInputNumber("input-potion-frenzy-3");
        input.potionVenom = getInputNumber("input-potion-venom-3");
    } else {
        input.elixGuard = input.elixWave = input.elixChaos = input.elixLife = input.elixDecay = 0;
        input.potionImmortal = input.potionBarrier = input.potionCorrupt = input.potionFrenzy = input.potionVenom = 0;
    }

    const result = calculate(input);
    if (!result) {
        alert("재료 부족");
        return;
    }

    updateResult(result);
}

/**
 * 재업데이트
 */
export function refresh() {
    if (lastResult) updateResult(lastResult);
}

/**
 * 초기화
 */
export function init() {
    setupAdvancedToggle(3);
}

// 전역 함수로 노출
window.run3StarOptimization = run;
