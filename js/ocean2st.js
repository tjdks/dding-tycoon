/*************************************************
 * 2️⃣ 2성 계산기 (ocean2st.js) - 최대 골드 최적화
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    // ===== 상수 정의 =====
    const GOLD_2STAR = { CORE: 7413, POTION: 7487, WING: 7592 };
    
    // 결정 → 에센스 레시피
    const CRYSTAL_TO_ESSENCE = {
        vital:   { guard: 1, life: 1 },      // 활기 보존
        erosion: { wave: 1, decay: 1 },       // 파도 침식
        defense: { guard: 1, chaos: 1 },      // 방어 오염
        regen:   { wave: 1, life: 1 },        // 격류 재생
        poison:  { chaos: 1, decay: 1 }       // 맹독 혼란
    };
    
    // 에센스 → 재료 레시피
    const ESSENCE_TO_MATERIAL = {
        guard: { seaweed: 2, coral_guard: 1 },
        wave: { seaweed: 2, coral_wave: 1 },
        chaos: { seaweed: 2, coral_chaos: 1 },
        life: { seaweed: 2, coral_life: 1 },
        decay: { seaweed: 2, coral_decay: 1 }
    };
    
    // 결정 → 추가 재료 레시피
    const CRYSTAL_TO_MATERIAL = {
        vital: { ink: 1, mineral_lapis: 1 },
        erosion: { ink: 1, mineral_redstone: 1 },
        defense: { ink: 1, mineral_iron: 1 },
        regen: { ink: 1, mineral_gold: 1 },
        poison: { ink: 1, mineral_diamond: 1 }
    };

    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');
    const advancedSwitcher = document.getElementById('switcher-advanced');
    const resultCard = document.getElementById("result-card-2");

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

    // ===== 고급 입력 모드 토글 =====
    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', function() {
            const advancedInputs = document.getElementById('advanced-inputs-2');
            if (advancedInputs) {
                if (this.checked) {
                    advancedInputs.classList.add('active');
                } else {
                    advancedInputs.classList.remove('active');
                }
            }
            if (window.last2StarResult) update2StarResult(window.last2StarResult);
        });
    }

    // ===== 계산 함수 =====
    window.calculate2Star = function(input) {
        console.log("calculate2Star 호출, 입력:", input);
        
        const isAdvancedMode = Number.isFinite(input.crystalVital) && input.crystalVital >= 0;

        // 1️⃣ 2성 어패류를 에센스로 환산
        let essFrom2Star = {
            guard: input.guard2 || 0,
            wave: input.wave2 || 0,
            chaos: input.chaos2 || 0,
            life: input.life2 || 0,
            decay: input.decay2 || 0
        };

        // 2️⃣ 보유 결정을 에센스로 환산 (고급 모드)
        let essFromCrystal = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        if (isAdvancedMode) {
            add(essFromCrystal, CRYSTAL_TO_ESSENCE.vital, input.crystalVital || 0);
            add(essFromCrystal, CRYSTAL_TO_ESSENCE.erosion, input.crystalErosion || 0);
            add(essFromCrystal, CRYSTAL_TO_ESSENCE.defense, input.crystalDefense || 0);
            add(essFromCrystal, CRYSTAL_TO_ESSENCE.regen, input.crystalRegen || 0);
            add(essFromCrystal, CRYSTAL_TO_ESSENCE.poison, input.crystalPoison || 0);
        }

        // 3️⃣ 총 보유 에센스 = 2성 어패류 + 보유 에센스 + 결정 환산
        const totalEss = {
            guard: essFrom2Star.guard + (input.essGuard || 0) + essFromCrystal.guard,
            wave: essFrom2Star.wave + (input.essWave || 0) + essFromCrystal.wave,
            chaos: essFrom2Star.chaos + (input.essChaos || 0) + essFromCrystal.chaos,
            life: essFrom2Star.life + (input.essLife || 0) + essFromCrystal.life,
            decay: essFrom2Star.decay + (input.essDecay || 0) + essFromCrystal.decay
        };

        console.log("총 보유 에센스:", totalEss);

        // 4️⃣ 최적화 - 각 아이템별 최대 제작 가능 수량 계산
        // CORE (해구의 파동 코어): 수호1, 파동2, 생명2, 부식1
        // POTION (침묵의 심해 비약): 파동2, 생명1, 부식2, 혼란1
        // WING (청해룡의 날개): 수호2, 혼란2, 부식1, 생명1
        
        const maxCore = Math.floor(Math.min(
            totalEss.guard / 1,
            totalEss.wave / 2,
            totalEss.life / 2,
            totalEss.decay / 1
        ));
        
        const maxPotion = Math.floor(Math.min(
            totalEss.wave / 2,
            totalEss.life / 1,
            totalEss.chaos / 1,
            totalEss.decay / 2
        ));
        
        const maxWing = Math.floor(Math.min(
            totalEss.guard / 2,
            totalEss.chaos / 2,
            totalEss.life / 1,
            totalEss.decay / 1
        ));

        console.log("개별 최대 제작 가능:", { maxCore, maxPotion, maxWing });

        let best = { gold: -1, CORE: 0, POTION: 0, WING: 0 };

        // 5️⃣ 전체 조합 탐색
        for (let CORE = 0; CORE <= maxCore; CORE++) {
            for (let POTION = 0; POTION <= maxPotion; POTION++) {
                for (let WING = 0; WING <= maxWing; WING++) {
                    
                    // 필요한 에센스 계산
                    const essNeed = {
                        guard: CORE * 1 + POTION * 0 + WING * 2,
                        wave: CORE * 2 + POTION * 2 + WING * 0,
                        chaos: CORE * 0 + POTION * 1 + WING * 2,
                        life: CORE * 2 + POTION * 1 + WING * 1,
                        decay: CORE * 1 + POTION * 2 + WING * 1
                    };

                    // 재료 부족 확인
                    if (essNeed.guard > totalEss.guard || 
                        essNeed.wave > totalEss.wave || 
                        essNeed.chaos > totalEss.chaos ||
                        essNeed.life > totalEss.life || 
                        essNeed.decay > totalEss.decay) {
                        continue;
                    }

                    // 골드 계산
                    const gold = CORE * GOLD_2STAR.CORE + 
                                POTION * GOLD_2STAR.POTION + 
                                WING * GOLD_2STAR.WING;
                    
                    if (gold > best.gold) {
                        best = { gold, CORE, POTION, WING };
                    }
                }
            }
        }

        if (best.gold < 0) {
            console.log("최적 해를 찾지 못함");
            return null;
        }

        console.log("최적 해:", best);

        // 6️⃣ 최적 조합에 필요한 결정
        const crystalNeed = {
            vital: best.CORE + best.WING,
            erosion: best.CORE + best.POTION,
            defense: best.WING,
            regen: best.CORE + best.POTION,
            poison: best.POTION + best.WING
        };

        // 7️⃣ 필요한 에센스 (총량)
        let essNeed = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        add(essNeed, CRYSTAL_TO_ESSENCE.vital, crystalNeed.vital);
        add(essNeed, CRYSTAL_TO_ESSENCE.erosion, crystalNeed.erosion);
        add(essNeed, CRYSTAL_TO_ESSENCE.defense, crystalNeed.defense);
        add(essNeed, CRYSTAL_TO_ESSENCE.regen, crystalNeed.regen);
        add(essNeed, CRYSTAL_TO_ESSENCE.poison, crystalNeed.poison);

        // 8️⃣ 필요한 재료 (총량)
        let materialNeed = { 
            seaweed: 0, ink: 0,
            coral_guard: 0, coral_wave: 0, coral_chaos: 0, coral_life: 0, coral_decay: 0,
            mineral_lapis: 0, mineral_redstone: 0, mineral_iron: 0, mineral_gold: 0, mineral_diamond: 0
        };
        for (let e in essNeed) add(materialNeed, ESSENCE_TO_MATERIAL[e], essNeed[e]);
        for (let c in crystalNeed) add(materialNeed, CRYSTAL_TO_MATERIAL[c], crystalNeed[c]);

        // 9️⃣ 고급 모드: 보유량 차감 후 실제 필요량
        let crystalToMake = { vital: 0, erosion: 0, defense: 0, regen: 0, poison: 0 };
        let essToMake = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        let finalEssNeed = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        let finalMaterialNeed = { 
            seaweed: 0, ink: 0,
            coral_guard: 0, coral_wave: 0, coral_chaos: 0, coral_life: 0, coral_decay: 0,
            mineral_lapis: 0, mineral_redstone: 0, mineral_iron: 0, mineral_gold: 0, mineral_diamond: 0
        };

        if (isAdvancedMode) {
            // 제작해야 할 결정
            crystalToMake = {
                vital: Math.max(0, crystalNeed.vital - (input.crystalVital || 0)),
                erosion: Math.max(0, crystalNeed.erosion - (input.crystalErosion || 0)),
                defense: Math.max(0, crystalNeed.defense - (input.crystalDefense || 0)),
                regen: Math.max(0, crystalNeed.regen - (input.crystalRegen || 0)),
                poison: Math.max(0, crystalNeed.poison - (input.crystalPoison || 0))
            };

            // 제작할 결정에 필요한 에센스
            for (let c in crystalToMake) {
                add(essToMake, CRYSTAL_TO_ESSENCE[c], crystalToMake[c]);
            }

            // 최종 제작해야 할 에센스
            finalEssNeed = {
                guard: Math.max(0, essToMake.guard - ((input.essGuard || 0) + essFromCrystal.guard)),
                wave: Math.max(0, essToMake.wave - ((input.essWave || 0) + essFromCrystal.wave)),
                chaos: Math.max(0, essToMake.chaos - ((input.essChaos || 0) + essFromCrystal.chaos)),
                life: Math.max(0, essToMake.life - ((input.essLife || 0) + essFromCrystal.life)),
                decay: Math.max(0, essToMake.decay - ((input.essDecay || 0) + essFromCrystal.decay))
            };

            // 최종 필요 재료
            for (let e in finalEssNeed) add(finalMaterialNeed, ESSENCE_TO_MATERIAL[e], finalEssNeed[e]);
            for (let c in crystalToMake) add(finalMaterialNeed, CRYSTAL_TO_MATERIAL[c], crystalToMake[c]);
        }

        return { 
            best, 
            crystalNeed,
            crystalToMake,
            essNeed,
            essToMake,
            finalEssNeed,
            materialNeed,
            finalMaterialNeed
        };
    };

    // ===== 결과 업데이트 함수 =====
    window.update2StarResult = function(r) {
        const getElem = (id) => document.getElementById(id);
        const updateText = (id, text) => {
            const elem = getElem(id);
            if (elem) elem.textContent = text;
        };

        // 프리미엄 레벨
        const premiumLVElem = getElem("info-expert-premium-price");
        const premiumLV = premiumLVElem ? (+premiumLVElem.value || 0) : 0;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        // 골드
        updateText("result-gold-2", Math.floor(r.best.gold * (1 + rate)).toLocaleString());
        updateText("result-premium-bonus-2", premiumLV ? `+${Math.floor(rate*100)}%` : '+0%');

        // 아이템
        const isSetMode = setSwitcher && setSwitcher.checked;
        const format = (num) => isSetMode ? formatSet(num) : num;

        updateText("result-acutis-2", format(r.best.CORE));
        updateText("result-frenzy-2", format(r.best.POTION));
        updateText("result-feather-2", format(r.best.WING));

        // 고급 모드 선택
        const isAdvancedMode = advancedSwitcher && advancedSwitcher.checked;
        const essData = isAdvancedMode ? r.finalEssNeed : r.essNeed;
        const crystalData = isAdvancedMode ? r.crystalToMake : r.crystalNeed;
        const materialData = isAdvancedMode ? r.finalMaterialNeed : r.materialNeed;

        // 에센스
        updateText("result-essence-2",
            `수호 ${format(essData.guard || 0)}, ` +
            `파동 ${format(essData.wave || 0)}, ` +
            `혼란 ${format(essData.chaos || 0)}, ` +
            `생명 ${format(essData.life || 0)}, ` +
            `부식 ${format(essData.decay || 0)}`
        );

        // 결정
        updateText("result-core-2",
            `활기 보존 ${format(crystalData.vital || 0)}, ` +
            `파도 침식 ${format(crystalData.erosion || 0)}, ` +
            `방어 오염 ${format(crystalData.defense || 0)}, ` +
            `격류 재생 ${format(crystalData.regen || 0)}, ` +
            `맹독 혼란 ${format(crystalData.poison || 0)}`
        );

        // 재료
        updateText("result-material-2",
            `해초 ${format(materialData.seaweed || 0)}, ` +
            `먹물 ${format(materialData.ink || 0)}`
        );

        // 산호
        updateText("result-coral-2",
            `관 ${format(materialData.coral_guard || 0)}, ` +
            `사방 ${format(materialData.coral_wave || 0)}, ` +
            `거품 ${format(materialData.coral_chaos || 0)}, ` +
            `불 ${format(materialData.coral_life || 0)}, ` +
            `뇌 ${format(materialData.coral_decay || 0)}`
        );

        // 광물
        updateText("result-extra-2",
            `청금석 블록 ${format(materialData.mineral_lapis || 0)}, ` +
            `레드스톤 블록 ${format(materialData.mineral_redstone || 0)}, ` +
            `철 ${format(materialData.mineral_iron || 0)}, ` +
            `금 ${format(materialData.mineral_gold || 0)}, ` +
            `다이아 ${format(materialData.mineral_diamond || 0)}`
        );

        if (resultCard) resultCard.style.display = 'block';
        window.last2StarResult = r;
    };

    // ===== 버튼 클릭 =====
    window.run2StarOptimization = function() {
        const isAdvancedMode = advancedSwitcher && advancedSwitcher.checked;

        // HTML ID에 맞게 수정
        const input = {
            guard2: +document.getElementById("input-guard-2")?.value || 0,
            wave2: +document.getElementById("input-wave-2")?.value || 0,
            chaos2: +document.getElementById("input-chaos-2")?.value || 0,
            life2: +document.getElementById("input-life-2")?.value || 0,
            decay2: +document.getElementById("input-decay-2")?.value || 0
        };

        if (isAdvancedMode) {
            input.essGuard = +document.getElementById("input-essence-guard-2")?.value || 0;
            input.essWave = +document.getElementById("input-essence-wave-2")?.value || 0;
            input.essChaos = +document.getElementById("input-essence-chaos-2")?.value || 0;
            input.essLife = +document.getElementById("input-essence-life-2")?.value || 0;
            input.essDecay = +document.getElementById("input-essence-decay-2")?.value || 0;

            input.crystalVital = +document.getElementById("input-crystal-vital-2")?.value || 0;
            input.crystalErosion = +document.getElementById("input-crystal-erosion-2")?.value || 0;
            input.crystalDefense = +document.getElementById("input-crystal-defense-2")?.value || 0;
            input.crystalRegen = +document.getElementById("input-crystal-regen-2")?.value || 0;
            input.crystalPoison = +document.getElementById("input-crystal-poison-2")?.value || 0;
        }

        const r = calculate2Star(input);
        
        if (!r) {
            alert("재료가 부족합니다");
            return;
        }

        update2StarResult(r);
    };

    // ===== 스위치 이벤트 =====
    if (setSwitcher) {
        setSwitcher.addEventListener('change', () => {
            if (window.last2StarResult) update2StarResult(window.last2StarResult);
        });
    }

    // ===== 세트 표시 =====
    const inputIds = [
        "input-guard-2", "input-wave-2", "input-chaos-2", 
        "input-life-2", "input-decay-2"
    ];
    
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        
        const span = document.createElement('span');
        span.className = 'set-display';
        input.parentNode.appendChild(span);

        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 0;
            if (setSwitcher && setSwitcher.checked) {
                span.textContent = ` ${formatSet(value)}`;
            } else {
                span.textContent = '';
            }
        });
    });

    console.log("2성 계산기 초기화 완료");
});