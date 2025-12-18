/*************************************************
 * 공통 유틸
 *************************************************/
function add(target, src, mul = 1) {
    for (let k in src) {
        target[k] = (target[k] || 0) + src[k] * mul;
    }
}

/*************************************************
 * 1️⃣ 1성 계산기
 *************************************************/
const GOLD_1STAR = { A: 3436, K: 3486, L: 3592 };
const CORE_TO_ESSENCE = {
    WG: { guard: 1, wave: 1 },
    WP: { wave: 1, chaos: 1 },
    OD: { chaos: 1, life: 1 },
    VD: { life: 1, decay: 1 },
    ED: { decay: 1, guard: 1 }
};
const ESSENCE_TO_BLOCK = {
    guard: { clay: 1 },
    wave: { sand: 3 },
    chaos: { dirt: 4 },
    life: { gravel: 2 },
    decay: { granite: 1 }
};
const CORE_TO_FISH = {
    WG: { shrimp: 1 },
    WP: { domi: 1 },
    OD: { herring: 1 },
    VD: { goldfish: 1 },
    ED: { bass: 1 }
};

function calculate1Star(input) {
    let best = { gold: -1, A: 0, K: 0, L: 0 };
    const maxA = input.guard + input.decay;
    const maxK = input.wave + input.chaos;
    const maxL = input.decay;

    for (let A = 0; A <= maxA; A++) {
        for (let K = 0; K <= maxK; K++) {
            for (let L = 0; L <= maxL; L++) {
                const ess = {
                    guard: CORE_TO_ESSENCE.WG.guard * (A + L) + CORE_TO_ESSENCE.ED.guard * L,
                    wave: CORE_TO_ESSENCE.WG.wave * (A + L) + CORE_TO_ESSENCE.WP.wave * (K + L),
                    chaos: CORE_TO_ESSENCE.WP.chaos * (K + L) + CORE_TO_ESSENCE.OD.chaos * (A + K),
                    life: CORE_TO_ESSENCE.OD.life * (A + K) + CORE_TO_ESSENCE.VD.life * (A + K),
                    decay: CORE_TO_ESSENCE.VD.decay * (A + K) + CORE_TO_ESSENCE.ED.decay * L
                };

                if (
                    ess.guard > input.guard ||
                    ess.wave > input.wave ||
                    ess.chaos > input.chaos ||
                    ess.life > input.life ||
                    ess.decay > input.decay
                ) continue;

                const gold = A * GOLD_1STAR.A + K * GOLD_1STAR.K + L * GOLD_1STAR.L;
                if (gold > best.gold) best = { gold, A, K, L };
            }
        }
    }

    if (best.gold < 0) return null;

    const coreNeed = {
        WG: best.A + best.L,
        WP: best.K + best.L,
        OD: best.A + best.K,
        VD: best.A + best.K,
        ED: best.L
    };
    const essNeed = {}, blockNeed = {}, fishNeed = {};
    for (let c in coreNeed) {
        add(essNeed, CORE_TO_ESSENCE[c], coreNeed[c]);
        add(fishNeed, CORE_TO_FISH[c], coreNeed[c]);
    }
    for (let e in essNeed) add(blockNeed, ESSENCE_TO_BLOCK[e], essNeed[e]);

    return { best, coreNeed, essNeed, blockNeed, fishNeed };
}

function run1StarOptimization() {
    const r = calculate1Star({
        guard: +document.getElementById("input-oyster-1").value,
        wave: +document.getElementById("input-shell-1").value,
        chaos: +document.getElementById("input-octopus-1").value,
        life: +document.getElementById("input-seaweed-1").value,
        decay: +document.getElementById("input-urchin-1").value
    });
    if (!r) return alert("재료 부족");

    const premiumLV = +document.getElementById("info-expert-premium-price").value;
    const PREMIUM_PRICE_RATE = { 1: 0.05, 2: 0.07, 3: 0.10, 4: 0.15, 5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50 };
    const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

    // 최종 골드 계산
    const finalGold = Math.floor(r.best.gold * (1 + rate));
    document.getElementById("result-gold-1").textContent = finalGold;

    // 프리미엄 보너스 퍼센트 표시
    const bonusText = premiumLV ? `+${Math.floor(rate * 100)}%` : '+0%';
    document.getElementById("result-premium-bonus-1").textContent = bonusText;

    // 재료 결과 표시
    document.getElementById("result-acutis-1").textContent = r.best.A;
    document.getElementById("result-frenzy-1").textContent = r.best.K;
    document.getElementById("result-feather-1").textContent = r.best.L;

    document.getElementById("result-essence-1").textContent =
        `수호 ${r.essNeed.guard}, 파동 ${r.essNeed.wave}, 혼란 ${r.essNeed.chaos}, 생명 ${r.essNeed.life}, 부식 ${r.essNeed.decay}`;
    document.getElementById("result-core-1").textContent =
        `물결 수호 ${r.coreNeed.WG}, 파동 오염 ${r.coreNeed.WP}, 질서 파괴 ${r.coreNeed.OD}, 활력 붕괴 ${r.coreNeed.VD}, 침식 방어 ${r.coreNeed.ED}`;
    document.getElementById("result-block-1").textContent =
        `점토 ${r.blockNeed.clay || 0}, 모래 ${r.blockNeed.sand || 0}, 흙 ${r.blockNeed.dirt || 0}, 자갈 ${r.blockNeed.gravel || 0}, 화강암 ${r.blockNeed.granite || 0}`;
    document.getElementById("result-fish-1").textContent =
        `새우 ${r.fishNeed.shrimp || 0}, 도미 ${r.fishNeed.domi || 0}, 청어 ${r.fishNeed.herring || 0}, 금붕어 ${r.fishNeed.goldfish || 0}, 농어 ${r.fishNeed.bass || 0}`;
}

/*************************************************
 * 2️⃣ 2성 계산기
 *************************************************/
const GOLD_2STAR = { CORE: 7413, POTION: 7487, WING: 7592 };

function calculate2Star(input) {
    let best = { gold: -1, CORE: 0, POTION: 0, WING: 0 };
    let limit = Math.max(10, input.guard + input.wave + input.chaos + input.life + input.decay);

    for (let CORE = 0; CORE <= limit; CORE++) {
        for (let POTION = 0; POTION <= limit; POTION++) {
            for (let WING = 0; WING <= limit; WING++) {
                let crystal = {
                    vital: CORE + WING,       // 해구의 파동 코어 + 청해룡의 날개
                    erosion: CORE + POTION,   // 해구의 파동 코어 + 침묵의 심해 비약
                    defense: WING,            // 청해룡의 날개
                    regen: CORE + POTION,     // 해구의 파동 코어 + 침묵의 심해 비약
                    poison: POTION + WING     // 침묵의 심해 비약 + 청해룡의 날개
                };

                let ess = {
                    guard: crystal.vital + crystal.defense,       // 수호 에센스
                    wave: crystal.erosion + crystal.regen,       // 파동 에센스
                    chaos: crystal.defense + crystal.poison,     // 혼란 에센스
                    life: crystal.vital + crystal.regen,         // 생명 에센스
                    decay: crystal.erosion + crystal.poison      // 부식 에센스
                };

                // 에센스 요구량을 초과하면 건너뜀
                if (ess.guard > input.guard || ess.wave > input.wave || ess.chaos > input.chaos || ess.life > input.life || ess.decay > input.decay)
                    continue;

                let gold = CORE * GOLD_2STAR.CORE + POTION * GOLD_2STAR.POTION + WING * GOLD_2STAR.WING;
                if (gold > best.gold) best = { gold, CORE, POTION, WING };
            }
        }
    }
    if (best.gold < 0) return null;

    // 크리스탈 및 에센스 계산
    let crystalNeed = {
        vital: best.CORE + best.WING,        // 해구의 파동 코어 + 청해룡의 날개
        erosion: best.CORE + best.POTION,    // 해구의 파동 코어 + 침묵의 심해 비약
        defense: best.WING,                  // 청해룡의 날개
        regen: best.CORE + best.POTION,      // 해구의 파동 코어 + 침묵의 심해 비약
        poison: best.POTION + best.WING      // 침묵의 심해 비약 + 청해룡의 날개
    };

    let essNeed = {
        guard: crystalNeed.vital + crystalNeed.defense,  // 수호 에센스
        wave: crystalNeed.erosion + crystalNeed.regen,   // 파동 에센스
        chaos: crystalNeed.defense + crystalNeed.poison, // 혼란 에센스
        life: crystalNeed.vital + crystalNeed.regen,     // 생명 에센스
        decay: crystalNeed.erosion + crystalNeed.poison   // 부식 에센스
    };

    // 각 에센스에 필요한 산호 블럭 계산
    let coralBlockNeed = {
        guard: essNeed.guard,  // 수호 에센스: 관 산호 블럭
        wave: essNeed.wave,    // 파동 에센스: 사방 산호 블럭
        chaos: essNeed.chaos,  // 혼란 에센스: 거품 산호 블럭
        life: essNeed.life,    // 생명 에센스: 불 산호 블럭
        decay: essNeed.decay   // 부식 에센스: 뇌 산호 블럭
    };

    // 필요한 재료 계산 (각 에센스마다 1개씩 산호 블럭 사용)
    let materialNeed = {
        seaweed: 2 * (essNeed.guard + essNeed.wave + essNeed.chaos + essNeed.life + essNeed.decay), // 해초의 수량 (각 영약마다 2개씩)
        ink: crystalNeed.vital + crystalNeed.erosion + crystalNeed.defense + crystalNeed.regen + crystalNeed.poison, // 먹물 수량
        coralBlock: coralBlockNeed.guard + coralBlockNeed.wave + coralBlockNeed.chaos + coralBlockNeed.life + coralBlockNeed.decay // 산호 블럭 수량 (각 에센스마다 1개씩)
    };

    // 필요한 광물 계산 (각 영약에 필요한 광물 수량)
    let mineralNeed = {
        lapis: crystalNeed.vital * 1,    // 청금석 블록 (활기 보존의 결정)
        redstone: crystalNeed.erosion * 1, // 레드스톤 블록 (파도 침식의 결정)
        iron: crystalNeed.defense * 1,    // 철 (방어 오염의 결정)
        gold: crystalNeed.regen * 1,      // 금 (격류 재생의 결정)
        diamond: crystalNeed.poison * 1   // 다이아몬드 (맹독 혼란의 결정)
    };

    return { best, essNeed, crystalNeed, materialNeed, mineralNeed };
}

function run2StarOptimization() {
    const r = calculate2Star({
        guard: +document.getElementById("input-guard-2").value,
        wave: +document.getElementById("input-wave-2").value,
        chaos: +document.getElementById("input-chaos-2").value,
        life: +document.getElementById("input-life-2").value,
        decay: +document.getElementById("input-decay-2").value
    });
    if (!r) return alert("재료 부족");

    const premiumLV = +document.getElementById("info-expert-premium-price").value;
    const PREMIUM_PRICE_RATE = { 1: 0.05, 2: 0.07, 3: 0.10, 4: 0.15, 5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50 };
    const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

    const finalGold = Math.floor(r.best.gold * (1 + rate));

    document.getElementById("result-gold-2").textContent = finalGold;
    
    // 프리미엄 보너스 퍼센트 표시
    const bonusText = premiumLV ? `+${Math.floor(rate * 100)}%` : '+0%';
    document.getElementById("result-premium-bonus-2").textContent = bonusText;

    document.getElementById("result-acutis-2").textContent = r.best.CORE;
    document.getElementById("result-frenzy-2").textContent = r.best.POTION;
    document.getElementById("result-feather-2").textContent = r.best.WING;

    // 에센스 수량 표시
    document.getElementById("result-essence-2").textContent =
        `수호 ${r.essNeed.guard}, 파동 ${r.essNeed.wave}, 혼란 ${r.essNeed.chaos}, 생명 ${r.essNeed.life}, 부식 ${r.essNeed.decay}`;
    
    // 결정 수량 표시
    document.getElementById("result-core-2").textContent =
        `활기 보존 ${r.crystalNeed.vital}, 파도 침식 ${r.crystalNeed.erosion}, 방어 오염 ${r.crystalNeed.defense}, 격류 재생 ${r.crystalNeed.regen}, 맹독 혼란 ${r.crystalNeed.poison}`;

    // 해초 및 먹물 수량 표시
    document.getElementById("result-material-2").textContent =
        `해초 ${r.materialNeed.seaweed}, 먹물 ${r.materialNeed.ink}`;

    // 산호 블럭 수량 수정: 각 에센스별로 1개씩 산호 블럭 사용
    // 각 에센스별로 산호 블럭 수를 따로 반영
    let coralNeed = {
        관: r.essNeed.guard,
        사방: r.essNeed.wave,
        거품: r.essNeed.chaos,
        불: r.essNeed.life,
        뇌: r.essNeed.decay
    };
    document.getElementById("result-coral-2").textContent =
        `관 ${coralNeed.관}, 사방 ${coralNeed.사방}, 거품 ${coralNeed.거품}, 불 ${coralNeed.불}, 뇌 ${coralNeed.뇌}`;

    // 광물 수량 표시
    document.getElementById("result-extra-2").textContent =
        `청금석 블록 ${r.mineralNeed.lapis}, 레드스톤 블록 ${r.mineralNeed.redstone}, 철 ${r.mineralNeed.iron}, 금 ${r.mineralNeed.gold}, 다이아 ${r.mineralNeed.diamond}`;
}

/*************************************************
 * 3️⃣ 3성 계산기
 *************************************************/
const GOLD_3STAR = { AQUA: 10699, NAUTILUS: 10824, SPINE: 10892 }; // 가격 업데이트
const ELIXER_MATERIALS = {
    "불멸 재생의 영약 ★★★": ["수호의 엘릭서 ★★★", "생명의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "수레국화"],
    "파동 장벽의 영약 ★★★": ["파동의 엘릭서 ★★★", "수호의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "민들레"],
    "타락 침식의 영약 ★★★": ["혼란의 엘릭서 ★★★", "부식의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "데이지"],
    "생명 광란의 영약 ★★★": ["생명의 엘릭서 ★★★", "혼란의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "양귀비"],
    "맹독 파동의 영약 ★★★": ["부식의 엘릭서 ★★★", "파동의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "선애기별꽃"]
};

function calculate3Star(input) {
    let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };
    let limit = Math.max(10, input.guard + input.wave + input.chaos + input.life + input.decay);

    for (let AQUA = 0; AQUA <= limit; AQUA++) {
        for (let NAUTILUS = 0; NAUTILUS <= limit; NAUTILUS++) {
            for (let SPINE = 0; SPINE <= limit; SPINE++) {
                // 영약 수량 계산 (각각의 영약별로 조합을 고려)
                let potion = {
                    immortal: AQUA + NAUTILUS,  // 불멸 재생의 영약
                    barrier: AQUA + NAUTILUS,   // 파동 장벽의 영약
                    poison: AQUA + SPINE,      // 타락 침식의 영약
                    frenzy: NAUTILUS + SPINE,   // 생명 광란의 영약
                    corrupt: SPINE             // 맹독 파동의 영약
                };

                let elixir = {
                    guard: potion.immortal + potion.barrier,   // 수호 엘릭서
                    wave: potion.barrier + potion.poison,     // 파동 엘릭서
                    chaos: potion.corrupt + potion.frenzy,    // 혼란 엘릭서
                    life: potion.immortal + potion.frenzy,    // 생명 엘릭서
                    decay: potion.corrupt + potion.poison     // 부식 엘릭서
                };

                // 에센스 요구량을 초과하면 건너뜀
                if (
                    elixir.guard > input.guard ||
                    elixir.wave > input.wave ||
                    elixir.chaos > input.chaos ||
                    elixir.life > input.life ||
                    elixir.decay > input.decay
                ) continue;

                // 최적화된 gold 계산
                let gold = AQUA * GOLD_3STAR.AQUA + NAUTILUS * GOLD_3STAR.NAUTILUS + SPINE * GOLD_3STAR.SPINE;
                if (gold > best.gold) best = { gold, AQUA, NAUTILUS, SPINE };
            }
        }
    }

    if (best.gold < 0) return null;

    // 최적의 영약 수량 계산
    let potionNeed = {
        immortal: best.AQUA + best.NAUTILUS,    // 불멸 재생의 영약
        barrier: best.AQUA + best.NAUTILUS,     // 파동 장벽의 영약
        poison: best.AQUA + best.SPINE,         // 타락 침식의 영약
        frenzy: best.NAUTILUS + best.SPINE,     // 생명 광란의 영약
        corrupt: best.SPINE                     // 맹독 파동의 영약
    };

    let elixirNeed = {
        guard: potionNeed.immortal + potionNeed.barrier, // 수호 엘릭서
        wave: potionNeed.barrier + potionNeed.poison,   // 파동 엘릭서
        chaos: potionNeed.corrupt + potionNeed.frenzy,  // 혼란 엘릭서
        life: potionNeed.immortal + potionNeed.frenzy,  // 생명 엘릭서
        decay: potionNeed.corrupt + potionNeed.poison   // 부식 엘릭서
    };

    // 각 재료 계산
    let materialNeed = {
        seaSquirt: potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt, // 불우렁쉥이
        bottle: 3 * (potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt), // 유리병
        glowInk: potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt, // 발광 먹물
        glowBerry: 2 * (potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt) // 발광 열매
    };

    let blockNeed = {
        netherrack: elixirNeed.guard * 16,
        magma: elixirNeed.wave * 8,
        soulSand: elixirNeed.chaos * 8,
        crimson: elixirNeed.life * 4,
        warped: elixirNeed.decay * 4
    };

    let flowerNeed = {
        cornflower: potionNeed.immortal * 1,
        dandelion: potionNeed.barrier * 1,
        daisy: potionNeed.corrupt * 1,
        poppy: potionNeed.frenzy * 1,
        azure: potionNeed.poison * 1
    };

    let elixirCombos = {
        "불멸 재생의 영약 ★★★": ELIXER_MATERIALS["불멸 재생의 영약 ★★★"],
        "파동 장벽의 영약 ★★★": ELIXER_MATERIALS["파동 장벽의 영약 ★★★"],
        "타락 침식의 영약 ★★★": ELIXER_MATERIALS["타락 침식의 영약 ★★★"],
        "생명 광란의 영약 ★★★": ELIXER_MATERIALS["생명 광란의 영약 ★★★"],
        "맹독 파동의 영약 ★★★": ELIXER_MATERIALS["맹독 파동의 영약 ★★★"]
    };

    return { best, elixirNeed, potionNeed, materialNeed, blockNeed, flowerNeed, elixirCombos };
}

function run3StarOptimization() {
    const r = calculate3Star({
        guard: +document.getElementById("input-oyster-3").value,
        wave: +document.getElementById("input-conch-3").value,
        chaos: +document.getElementById("input-octopus-3").value,
        life: +document.getElementById("input-seaweed-3").value,
        decay: +document.getElementById("input-urchin-3").value
    });
    if (!r) return alert("재료 부족");

    const premiumLV = +document.getElementById("info-expert-premium-price").value;
    const PREMIUM_PRICE_RATE = { 1: 0.05, 2: 0.07, 3: 0.10, 4: 0.15, 5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50 };
    const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

    const finalGold = Math.floor(r.best.gold * (1 + rate));

    // 골드와 프리미엄 보너스 출력
    document.getElementById("result-gold-3").textContent = finalGold;
    const bonusText = premiumLV ? `+${Math.floor(rate * 100)}%` : '+0%';
    document.getElementById("result-premium-bonus-3").textContent = bonusText;

    // 아쿠아 펄스, 나우틸러스의 손, 무저의 척추 출력
    document.getElementById("result-aqua-3").textContent = r.best.AQUA;
    document.getElementById("result-nautilus-3").textContent = r.best.NAUTILUS;
    document.getElementById("result-spine-3").textContent = r.best.SPINE;

    // 필요 엘릭서 출력
    document.getElementById("result-essence-3").textContent =
        `수호 ${r.elixirNeed.guard}, 파동 ${r.elixirNeed.wave}, 혼란 ${r.elixirNeed.chaos}, 생명 ${r.elixirNeed.life}, 부식 ${r.elixirNeed.decay}`;

    // 필요 영약 출력
    document.getElementById("result-core-3").textContent =
        `불멸 재생 ${r.potionNeed.immortal}, 파동 장벽 ${r.potionNeed.barrier}, 타락 침식 ${r.potionNeed.poison}, 생명 광란 ${r.potionNeed.frenzy}, 맹독 파동 ${r.potionNeed.corrupt}`;

    // 필요 재료 출력
    document.getElementById("result-material-3").textContent =
        `불우렁쉥이 ${r.materialNeed.seaSquirt}, 유리병 ${r.materialNeed.bottle}, 발광 먹물 ${r.materialNeed.glowInk}, 발광 열매 ${r.materialNeed.glowBerry}`;

    // 필요 블록 출력
    document.getElementById("result-block-3").textContent =
        `네더렉 ${r.blockNeed.netherrack}, 마그마 ${r.blockNeed.magma}, 영혼흙 ${r.blockNeed.soulSand}, 진흥빛자루 ${r.blockNeed.crimson}, 뒤틀린자루 ${r.blockNeed.warped}`;

    // 필요 꽃 출력
    document.getElementById("result-flower-3").textContent =
        `수레국화 ${r.flowerNeed.cornflower}, 민들레 ${r.flowerNeed.dandelion}, 데이지 ${r.flowerNeed.daisy}, 양귀비 ${r.flowerNeed.poppy}, 선애기별꽃 ${r.flowerNeed.azure}`;

    // 결과 카드 보이기
    document.getElementById("result-card-3").style.display = "block";
}

// ===== 프리미엄 입력값 자동 반영 =====
document.getElementById("info-expert-premium-price").addEventListener("input", () => {
    run1StarOptimization();
    run2StarOptimization();
    run3StarOptimization();
});

/*************************************************
 * 4️⃣ 스태미나 계산기 (정보탭 전문가 반영)
 *************************************************/

// 낚싯대 강화 단계별 드롭 수와 기본 조개 확률
const rodData = {
    1: { drop: 1, clamRate: 0 },
    2: { drop: 1, clamRate: 0.01 },
    3: { drop: 2, clamRate: 0.01 },
    4: { drop: 2, clamRate: 0.01 },
    5: { drop: 2, clamRate: 0.02 },
    6: { drop: 3, clamRate: 0.02 },
    7: { drop: 3, clamRate: 0.02 },
    8: { drop: 3, clamRate: 0.03 },
    9: { drop: 4, clamRate: 0.03 },
    10:{ drop: 4, clamRate: 0.03 },
    11:{ drop: 4, clamRate: 0.05 },
    12:{ drop: 5, clamRate: 0.05 },
    13:{ drop: 5, clamRate: 0.05 },
    14:{ drop: 5, clamRate: 0.05 },
    15:{ drop: 6, clamRate: 0.10 },
};

function runStaminaSimulation() {
    const stamina = +document.getElementById("input-stamina").value || 0;
    const item = document.getElementById("stamina-item-select").value;

    if (!stamina) return alert("스태미나를 입력해주세요.");

    // 정보탭 전문가 값 가져오기
    const rodLV = +document.getElementById("info-expert-rod")?.value || 1;
    const stormLV = +document.getElementById("expert-storm")?.value || 0;
    const starLV = +document.getElementById("expert-star")?.value || 0;
    const clamLV = +document.getElementById("expert-clam-refill")?.value || 0;

    const staminaPerGather = 15;
    const gatherCount = Math.floor(stamina / staminaPerGather);

    // 낚싯대 드롭 수와 조개 확률
    const rodInfo = rodData[rodLV] || { drop: 1, clamRate: 0 };
    let totalDrops = gatherCount * rodInfo.drop;

    // 폭풍의 물질꾼: 비 오는 날만 적용 (여기선 가정으로 true)
    const isRain = true;
    if (stormLV > 0 && isRain) {
        // 레벨에 따라 추가 % 적용: LV1=1%, LV2=3%, LV3=5%, LV4=7%, LV5=10%
        const stormBonus = [0, 0.01, 0.03, 0.05, 0.07, 0.10];
        totalDrops = Math.floor(totalDrops * (1 + (stormBonus[stormLV] || 0)));
    }

    // 등급 확률
    const rate3 = 0.1 + 0.01 * starLV; // 별별별! 적용
    const rate2 = 0.3;
    const rate1 = 1 - rate2 - rate3;

    // 등급별 수량
    const count1 = Math.floor(totalDrops * rate1);
    const count2 = Math.floor(totalDrops * rate2);
    const count3 = Math.floor(totalDrops * rate3);

    // 조개 등장 확률: 낚싯대 + 조개 무한리필
    const clamRatePerLV = [0, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.07];
    const clamRate = (rodInfo.clamRate || 0) + (clamRatePerLV[clamLV] || 0);
    const clamCount = Math.floor(gatherCount * clamRate);

    // 결과 출력
    const html = `
        <ul>
            <li>1성 ${item}: ${count1}</li>
            <li>2성 ${item}: ${count2}</li>
            <li>3성 ${item}: ${count3}</li>
            <li>조개: ${clamCount}</li>
        </ul>
    `;
    document.getElementById("stamina-item-list").innerHTML = html;

    // 전문가 요약 업데이트
    updateStaminaExpertSummary();
}

function updateStaminaExpertSummary() {
    const rodLV = +document.getElementById("info-expert-rod")?.value || 1;
    const stormLV = +document.getElementById("expert-storm")?.value || 0;
    const starLV = +document.getElementById("expert-star")?.value || 0;
    const clamLV = +document.getElementById("expert-clam-refill")?.value || 0;

    const summaryElem = document.getElementById("stamina-expert-summary");
    if (summaryElem) {
        summaryElem.textContent = `(폭풍 ${stormLV}LV, 별별별 ${starLV}LV, 조개 무한리필 ${clamLV}LV, 낚싯대 ${rodLV}강 적용)`;
    }
}

/*************************************************
 * 이벤트 등록
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
    // 스태미나 계산 버튼
    document.getElementById("stamina-calc-btn")?.addEventListener("click", runStaminaSimulation);

    // 전문가 입력 변경 시 요약 업데이트
    const expertInputs = [
        "info-expert-rod",
        "expert-storm",
        "expert-star",
        "expert-clam-refill"
    ];
    expertInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener("input", updateStaminaExpertSummary);
    });

    // 초기 요약 반영
    updateStaminaExpertSummary();
});

// i 버튼 클릭 설명 토글
function toggleDesc(id) {
    const elem = document.getElementById(id);
    if (!elem) return;
    elem.style.display = (elem.style.display === 'none' || elem.style.display === '') ? 'block' : 'none';
}


document.getElementById("toggle").addEventListener("change", function() {
  const inputs = document.querySelectorAll("input[type='text']");

  if (this.checked) {
    // 세트 수 입력 모드
    inputs.forEach(input => {
      const value = input.value.split(" / ");
      const sets = parseInt(value[0]) || 0;
      const remainder = parseInt(value[1]) || 0;
      // 세트 수와 낱개 수 입력을 표시
      input.value = `[ ${sets} / ${remainder} ]`;
      input.placeholder = "[세트 / 낱개]";
    });
  } else {
    // 일반 수 입력 모드 (낱개만 입력)
    inputs.forEach(input => {
      const value = input.value.split(" / ");
      const single = parseInt(value[1]) || 0;
      // 낱개 수만 입력하고 세트 수는 0으로 설정
      input.value = `[ 0 / ${single} ]`;
      input.placeholder = "수량 입력";
    });
  }
});