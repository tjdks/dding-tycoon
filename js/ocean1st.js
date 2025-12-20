/*************************************************
 * 1️⃣ 1성 계산기 (ocean1st.js) - 고급 입력 모드 추가
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    // ===== 상수 정의 =====
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

    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');
    const advancedSwitcher = document.getElementById('switcher-advanced');

    // ===== 고급 입력 모드 토글 =====
    advancedSwitcher?.addEventListener('change', function() {
        const advancedInputs = document.getElementById('advanced-inputs-1');
        if (advancedInputs) {
            if (this.checked) {
                advancedInputs.classList.add('active');
            } else {
                advancedInputs.classList.remove('active');
            }
        }
    });

    // ===== 유틸 함수 =====
    function add(target, src, mul = 1) {
        for (let k in src) {
            target[k] = (target[k] || 0) + src[k] * mul;
        }
    }

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        return `${sets} / ${remainder}`;
    }

    // ===== 계산 함수 (고급 입력 지원) =====
    window.calculate1Star = function(input) {
        // 고급 모드 여부 확인
        const isAdvanced = Number.isFinite(input.coreWG) && input.coreWG >= 0;

        let best = { gold: -1, A: 0, K: 0, L: 0 };
        
        // 보유 핵을 정수로 환산
        let essFromCore = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        if (isAdvanced) {
            essFromCore.guard = input.coreWG * CORE_TO_ESSENCE.WG.guard + input.coreED * CORE_TO_ESSENCE.ED.guard;
            essFromCore.wave = input.coreWG * CORE_TO_ESSENCE.WG.wave + input.coreWP * CORE_TO_ESSENCE.WP.wave;
            essFromCore.chaos = input.coreWP * CORE_TO_ESSENCE.WP.chaos + input.coreOD * CORE_TO_ESSENCE.OD.chaos;
            essFromCore.life = input.coreOD * CORE_TO_ESSENCE.OD.life + input.coreVD * CORE_TO_ESSENCE.VD.life;
            essFromCore.decay = input.coreVD * CORE_TO_ESSENCE.VD.decay + input.coreED * CORE_TO_ESSENCE.ED.decay;
        }

        // 총 보유 정수 = 어패류 + 보유 정수 + 핵에서 나온 정수
        const totalEss = {
            guard: input.guard + (input.essGuard || 0) + essFromCore.guard,
            wave: input.wave + (input.essWave || 0) + essFromCore.wave,
            chaos: input.chaos + (input.essChaos || 0) + essFromCore.chaos,
            life: input.life + (input.essLife || 0) + essFromCore.life,
            decay: input.decay + (input.essDecay || 0) + essFromCore.decay
        };

        const maxA = totalEss.guard + totalEss.decay;
        const maxK = totalEss.wave + totalEss.chaos;
        const maxL = totalEss.decay;

        for (let A = 0; A <= maxA; A++) {
            for (let K = 0; K <= maxK; K++) {
                for (let L = 0; L <= maxL; L++) {
                    const coreUsed = {
                        WG: A + L,
                        WP: K + L,
                        OD: A + K,
                        VD: A + K,
                        ED: L
                    };

                    const ess = {
                        guard: CORE_TO_ESSENCE.WG.guard * coreUsed.WG + CORE_TO_ESSENCE.ED.guard * coreUsed.ED,
                        wave: CORE_TO_ESSENCE.WG.wave * coreUsed.WG + CORE_TO_ESSENCE.WP.wave * coreUsed.WP,
                        chaos: CORE_TO_ESSENCE.WP.chaos * coreUsed.WP + CORE_TO_ESSENCE.OD.chaos * coreUsed.OD,
                        life: CORE_TO_ESSENCE.OD.life * coreUsed.OD + CORE_TO_ESSENCE.VD.life * coreUsed.VD,
                        decay: CORE_TO_ESSENCE.VD.decay * coreUsed.VD + CORE_TO_ESSENCE.ED.decay * coreUsed.ED
                    };

                    // 총 보유 정수와 비교
                    if (
                        ess.guard > totalEss.guard ||
                        ess.wave > totalEss.wave ||
                        ess.chaos > totalEss.chaos ||
                        ess.life > totalEss.life ||
                        ess.decay > totalEss.decay
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

        // 고급 모드일 경우 보유량 차감
        let coreToMake = { WG: 0, WP: 0, OD: 0, VD: 0, ED: 0 };
        let essToMake = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        let finalEssNeed = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };

        if (isAdvanced) {
            // 제작해야 할 핵 (총 필요량 - 보유량)
            coreToMake = {
                WG: Math.max(0, coreNeed.WG - input.coreWG),
                WP: Math.max(0, coreNeed.WP - input.coreWP),
                OD: Math.max(0, coreNeed.OD - input.coreOD),
                VD: Math.max(0, coreNeed.VD - input.coreVD),
                ED: Math.max(0, coreNeed.ED - input.coreED)
            };

            // 제작할 핵에 필요한 정수
            for (let c in coreToMake) {
                add(essToMake, CORE_TO_ESSENCE[c], coreToMake[c]);
            }

            // 제작해야 할 정수 (핵 제작용 정수 - 보유 정수)
            finalEssNeed = {
                guard: Math.max(0, (essToMake.guard || 0) - input.essGuard),
                wave: Math.max(0, (essToMake.wave || 0) - input.essWave),
                chaos: Math.max(0, (essToMake.chaos || 0) - input.essChaos),
                life: Math.max(0, (essToMake.life || 0) - input.essLife),
                decay: Math.max(0, (essToMake.decay || 0) - input.essDecay)
            };
        }

        return { 
            best, 
            coreNeed,
            coreToMake,
            essNeed,
            essToMake,
            finalEssNeed,
            blockNeed, 
            fishNeed 
        };
    };

    // ===== 결과 업데이트 함수 =====
    window.update1StarResult = function(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value || 0;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-1").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();
        document.getElementById("result-premium-bonus-1").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        document.getElementById("result-acutis-1").textContent = setSwitcher.checked ? formatSet(r.best.A) : r.best.A;
        document.getElementById("result-frenzy-1").textContent = setSwitcher.checked ? formatSet(r.best.K) : r.best.K;
        document.getElementById("result-feather-1").textContent = setSwitcher.checked ? formatSet(r.best.L) : r.best.L;

        // 고급 모드일 경우 "제작할" 정수/핵 표시
        const isAdvanced = advancedSwitcher?.checked;
        const essData = isAdvanced ? r.finalEssNeed : r.essNeed;
        const coreData = isAdvanced ? r.coreToMake : r.coreNeed;

        document.getElementById("result-essence-1").textContent =
            `수호 ${setSwitcher.checked ? formatSet(essData.guard || 0) : (essData.guard || 0)}, ` +
            `파동 ${setSwitcher.checked ? formatSet(essData.wave || 0) : (essData.wave || 0)}, ` +
            `혼란 ${setSwitcher.checked ? formatSet(essData.chaos || 0) : (essData.chaos || 0)}, ` +
            `생명 ${setSwitcher.checked ? formatSet(essData.life || 0) : (essData.life || 0)}, ` +
            `부식 ${setSwitcher.checked ? formatSet(essData.decay || 0) : (essData.decay || 0)}`;

        document.getElementById("result-core-1").textContent =
            `물결 수호 ${setSwitcher.checked ? formatSet(coreData.WG || 0) : (coreData.WG || 0)}, ` +
            `파동 오염 ${setSwitcher.checked ? formatSet(coreData.WP || 0) : (coreData.WP || 0)}, ` +
            `질서 파괴 ${setSwitcher.checked ? formatSet(coreData.OD || 0) : (coreData.OD || 0)}, ` +
            `활력 붕괴 ${setSwitcher.checked ? formatSet(coreData.VD || 0) : (coreData.VD || 0)}, ` +
            `침식 방어 ${setSwitcher.checked ? formatSet(coreData.ED || 0) : (coreData.ED || 0)}`;

        document.getElementById("result-block-1").textContent =
            `점토 ${setSwitcher.checked ? formatSet(r.blockNeed.clay || 0) : (r.blockNeed.clay || 0)}, ` +
            `모래 ${setSwitcher.checked ? formatSet(r.blockNeed.sand || 0) : (r.blockNeed.sand || 0)}, ` +
            `흙 ${setSwitcher.checked ? formatSet(r.blockNeed.dirt || 0) : (r.blockNeed.dirt || 0)}, ` +
            `자갈 ${setSwitcher.checked ? formatSet(r.blockNeed.gravel || 0) : (r.blockNeed.gravel || 0)}, ` +
            `화강암 ${setSwitcher.checked ? formatSet(r.blockNeed.granite || 0) : (r.blockNeed.granite || 0)}`;

        document.getElementById("result-fish-1").textContent =
            `새우 ${setSwitcher.checked ? formatSet(r.fishNeed.shrimp || 0) : (r.fishNeed.shrimp || 0)}, ` +
            `도미 ${setSwitcher.checked ? formatSet(r.fishNeed.domi || 0) : (r.fishNeed.domi || 0)}, ` +
            `청어 ${setSwitcher.checked ? formatSet(r.fishNeed.herring || 0) : (r.fishNeed.herring || 0)}, ` +
            `금붕어 ${setSwitcher.checked ? formatSet(r.fishNeed.goldfish || 0) : (r.fishNeed.goldfish || 0)}, ` +
            `농어 ${setSwitcher.checked ? formatSet(r.fishNeed.bass || 0) : (r.fishNeed.bass || 0)}`;

        window.last1StarResult = r;
    };

    // ===== 버튼 클릭 함수 =====
    window.run1StarOptimization = function() {
        const isAdvanced = advancedSwitcher?.checked;

        // 기본 어패류 입력
        const input = {
            guard: +document.getElementById("input-oyster-1").value || 0,
            wave: +document.getElementById("input-shell-1").value || 0,
            chaos: +document.getElementById("input-octopus-1").value || 0,
            life: +document.getElementById("input-seaweed-1").value || 0,
            decay: +document.getElementById("input-urchin-1").value || 0
        };

        // 고급 모드일 경우 정수/핵 추가
        if (isAdvanced) {
            input.essGuard = +document.getElementById("input-essence-guard-1")?.value || 0;
            input.essWave = +document.getElementById("input-essence-wave-1")?.value || 0;
            input.essChaos = +document.getElementById("input-essence-chaos-1")?.value || 0;
            input.essLife = +document.getElementById("input-essence-life-1")?.value || 0;
            input.essDecay = +document.getElementById("input-essence-decay-1")?.value || 0;

            input.coreWG = +document.getElementById("input-core-wg-1")?.value || 0;
            input.coreWP = +document.getElementById("input-core-wp-1")?.value || 0;
            input.coreOD = +document.getElementById("input-core-od-1")?.value || 0;
            input.coreVD = +document.getElementById("input-core-vd-1")?.value || 0;
            input.coreED = +document.getElementById("input-core-ed-1")?.value || 0;
        } else {
            input.essGuard = 0;
            input.essWave = 0;
            input.essChaos = 0;
            input.essLife = 0;
            input.essDecay = 0;

            input.coreWG = 0;
            input.coreWP = 0;
            input.coreOD = 0;
            input.coreVD = 0;
            input.coreED = 0;
        }

        const r = calculate1Star(input);
        if (!r) return alert("재료 부족");

        update1StarResult(r);
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    setSwitcher?.addEventListener('change', () => {
        if (window.last1StarResult) update1StarResult(window.last1StarResult);
    });

    advancedSwitcher?.addEventListener('change', () => {
        if (window.last1StarResult) update1StarResult(window.last1StarResult);
    });
});