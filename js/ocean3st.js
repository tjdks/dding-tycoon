/*************************************************
 * 3️⃣ 3성 계산기 (ocean3st.js) - 성능 최적화 버전
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    // ===== 상수 정의 =====
    const GOLD_3STAR = { AQUA: 10699, NAUTILUS: 10824, SPINE: 10892 };
    
    const POTION_TO_ELIXIR = {
        immortal: { guard: 1, life: 1 },
        barrier: { guard: 1, wave: 1 },
        corrupt: { chaos: 1, decay: 1 },
        frenzy: { chaos: 1, life: 1 },
        venom: { wave: 1, decay: 1 }
    };

    const ITEM_TO_POTION = {
        AQUA: { immortal: 1, barrier: 1, venom: 1 },
        NAUTILUS: { immortal: 1, barrier: 1, frenzy: 1 },
        SPINE: { corrupt: 1, frenzy: 1, venom: 1 }
    };

    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');
    const advancedSwitcher = document.getElementById('switcher-advanced');

    const inputs = [
        document.getElementById("input-oyster-3"),
        document.getElementById("input-conch-3"),
        document.getElementById("input-octopus-3"),
        document.getElementById("input-seaweed-3"),
        document.getElementById("input-urchin-3")
    ];

    // ===== 고급 입력 모드 토글 =====
    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', function() {
            const advancedInputs = document.getElementById('advanced-inputs-3');
            if (advancedInputs) {
                if (this.checked) {
                    advancedInputs.classList.add('active');
                } else {
                    advancedInputs.classList.remove('active');
                }
            }
            if (window.last3StarResult) update3StarResult(window.last3StarResult);
        });
    }

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        return `${sets} / ${remainder}`;
    }

    // ===== 계산 함수 (최적화 버전) =====
    window.calculate3Star = function(input) {
        const isAdvancedMode = Number.isFinite(input.potionImmortal) && input.potionImmortal >= 0;

        // 1️⃣ 총 가용 자원
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

        const totalPotion = isAdvancedMode ? {
            immortal: input.potionImmortal || 0,
            barrier: input.potionBarrier || 0,
            corrupt: input.potionCorrupt || 0,
            frenzy: input.potionFrenzy || 0,
            venom: input.potionVenom || 0
        } : { immortal: 0, barrier: 0, corrupt: 0, frenzy: 0, venom: 0 };

        // 2️⃣ 최대 제작 가능 개수 계산 (성능 최적화)
        
        // immortal: guard + life
        const maxImmortal = totalPotion.immortal + Math.floor((totalFish.guard + totalElix.guard + totalFish.life + totalElix.life) / 2);
        
        // barrier: guard + wave
        const maxBarrier = totalPotion.barrier + Math.floor((totalFish.guard + totalElix.guard + totalFish.wave + totalElix.wave) / 2);
        
        // corrupt: chaos + decay
        const maxCorrupt = totalPotion.corrupt + Math.floor((totalFish.chaos + totalElix.chaos + totalFish.decay + totalElix.decay) / 2);
        
        // frenzy: chaos + life
        const maxFrenzy = totalPotion.frenzy + Math.floor((totalFish.chaos + totalElix.chaos + totalFish.life + totalElix.life) / 2);
        
        // venom: wave + decay
        const maxVenom = totalPotion.venom + Math.floor((totalFish.wave + totalElix.wave + totalFish.decay + totalElix.decay) / 2);

        // AQUA: immortal + barrier + venom
        const maxAqua = Math.min(maxImmortal, maxBarrier, maxVenom);

        // NAUTILUS: immortal + barrier + frenzy
        const maxNautilus = Math.min(maxImmortal, maxBarrier, maxFrenzy);

        // SPINE: corrupt + frenzy + venom
        const maxSpine = Math.min(maxCorrupt, maxFrenzy, maxVenom);

        let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };

        // 3️⃣ 최적화된 루프 (실제 가능 범위만 탐색)
        for (let AQUA = 0; AQUA <= maxAqua; AQUA++) {
            for (let NAUTILUS = 0; NAUTILUS <= maxNautilus; NAUTILUS++) {
                for (let SPINE = 0; SPINE <= maxSpine; SPINE++) {
                    
                    // 필요한 영약
                    const needPotion = {
                        immortal: AQUA + NAUTILUS,
                        barrier: AQUA + NAUTILUS,
                        corrupt: SPINE,
                        frenzy: NAUTILUS + SPINE,
                        venom: AQUA + SPINE
                    };
                    
                    // 제작할 영약
                    const makePotion = {
                        immortal: Math.max(0, needPotion.immortal - totalPotion.immortal),
                        barrier: Math.max(0, needPotion.barrier - totalPotion.barrier),
                        corrupt: Math.max(0, needPotion.corrupt - totalPotion.corrupt),
                        frenzy: Math.max(0, needPotion.frenzy - totalPotion.frenzy),
                        venom: Math.max(0, needPotion.venom - totalPotion.venom)
                    };

                    // 제작할 영약에 필요한 엘릭서
                    const needElix = {
                        guard: makePotion.immortal + makePotion.barrier,
                        wave: makePotion.barrier + makePotion.venom,
                        chaos: makePotion.corrupt + makePotion.frenzy,
                        life: makePotion.immortal + makePotion.frenzy,
                        decay: makePotion.corrupt + makePotion.venom
                    };

                    // 제작할 엘릭서 (보유 엘릭서 차감)
                    const makeFish = {
                        guard: Math.max(0, needElix.guard - totalElix.guard),
                        wave: Math.max(0, needElix.wave - totalElix.wave),
                        chaos: Math.max(0, needElix.chaos - totalElix.chaos),
                        life: Math.max(0, needElix.life - totalElix.life),
                        decay: Math.max(0, needElix.decay - totalElix.decay)
                    };

                    // 3성 어패류 부족 체크
                    if (
                        makeFish.guard > totalFish.guard ||
                        makeFish.wave > totalFish.wave ||
                        makeFish.chaos > totalFish.chaos ||
                        makeFish.life > totalFish.life ||
                        makeFish.decay > totalFish.decay
                    ) continue;

                    const gold = AQUA * GOLD_3STAR.AQUA + NAUTILUS * GOLD_3STAR.NAUTILUS + SPINE * GOLD_3STAR.SPINE;
                    if (gold > best.gold) {
                        best = { gold, AQUA, NAUTILUS, SPINE };
                    }
                }
            }
        }

        if (best.gold < 0) return null;

        // 4️⃣ 결과 계산
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

        // 일반 모드 표시용 (전체 필요량)
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
            potionNeed,
            potionToMake,
            elixNeedTotal,
            elixToMake,
            materialNeed,
            materialNeedTotal,
            netherNeed,
            netherNeedTotal,
            flowerNeed,
            flowerNeedTotal,
            isAdvancedMode
        };
    };

    // ===== 결과 업데이트 =====
    window.update3StarResult = function(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value || 0;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-3").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();
        document.getElementById("result-premium-bonus-3").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        const isSetMode = setSwitcher && setSwitcher.checked;
        const format = (num) => isSetMode ? formatSet(num) : num;

        document.getElementById("result-aqua-3").textContent = format(r.best.AQUA);
        document.getElementById("result-nautilus-3").textContent = format(r.best.NAUTILUS);
        document.getElementById("result-spine-3").textContent = format(r.best.SPINE);

        const isAdvancedMode = r.isAdvancedMode;
        const elixData = isAdvancedMode ? r.elixToMake : r.elixNeedTotal;
        const potionData = isAdvancedMode ? r.potionToMake : r.potionNeed;
        const materialData = isAdvancedMode ? r.materialNeed : r.materialNeedTotal;
        const netherData = isAdvancedMode ? r.netherNeed : r.netherNeedTotal;
        const flowerData = isAdvancedMode ? r.flowerNeed : r.flowerNeedTotal;

        // 엘릭서 - 이미지와 함께 표시 (1성, 2성과 동일한 스타일)
        const elixHTML = `
            <span class="essence-item"><img src="img/elixir-guard.png" alt="수호">수호 ${format(elixData.guard || 0)}</span>
            <span class="essence-item"><img src="img/elixir-wave.png" alt="파동">파동 ${format(elixData.wave || 0)}</span>
            <span class="essence-item"><img src="img/elixir-chaos.png" alt="혼란">혼란 ${format(elixData.chaos || 0)}</span>
            <span class="essence-item"><img src="img/elixir-life.png" alt="생명">생명 ${format(elixData.life || 0)}</span>
            <span class="essence-item"><img src="img/elixir-decay.png" alt="부식">부식 ${format(elixData.decay || 0)}</span>
        `;
        document.getElementById("result-essence-3").innerHTML = elixHTML;

        // 영약 - 이미지와 함께 표시
        const potionHTML = `
            <span class="core-item"><img src="img/potion-immortal.png" alt="불멸재생">불멸 재생 ${format(potionData.immortal || 0)}</span>
            <span class="core-item"><img src="img/potion-barrier.png" alt="파동장벽">파동 장벽 ${format(potionData.barrier || 0)}</span>
            <span class="core-item"><img src="img/potion-corrupt.png" alt="타락침식">타락 침식 ${format(potionData.corrupt || 0)}</span>
            <span class="core-item"><img src="img/potion-frenzy.png" alt="생명광란">생명 광란 ${format(potionData.frenzy || 0)}</span>
            <span class="core-item"><img src="img/potion-venom.png" alt="맹독파동">맹독 파동 ${format(potionData.venom || 0)}</span>
        `;
        document.getElementById("result-core-3").innerHTML = potionHTML;

        // 필요 재료
        document.getElementById("result-material-3").textContent =
            `불우렁쉥이 ${format(materialData.seaSquirt)}, ` +
            `유리병 ${format(materialData.glassBottle)}, ` +
            `발광 먹물 ${format(materialData.glowInkSac)}, ` +
            `발광 열매 ${format(materialData.glowBerry)}`;

        // 필요 블록
        document.getElementById("result-block-3").textContent =
            `네더렉 ${format(netherData.netherrack)}, ` +
            `마그마 ${format(netherData.magmaBlock)}, ` +
            `영혼흙 ${format(netherData.soulSoil)}, ` +
            `진홍빛자루 ${format(netherData.crimsonStem)}, ` +
            `뒤틀린자루 ${format(netherData.warpedStem)}`;

        // 필요 꽃
        document.getElementById("result-flower-3").textContent =
            `수레국화 ${format(flowerData.cornflower)}, ` +
            `민들레 ${format(flowerData.dandelion)}, ` +
            `데이지 ${format(flowerData.daisy)}, ` +
            `양귀비 ${format(flowerData.poppy)}, ` +
            `선애기별꽃 ${format(flowerData.blueOrchid)}`;

        window.last3StarResult = r;
    };

    // ===== 버튼 클릭 함수 =====
    window.run3StarOptimization = function() {
        const isAdvancedMode = advancedSwitcher && advancedSwitcher.checked;

        const input = {
            guard: +document.getElementById("input-oyster-3").value || 0,
            wave: +document.getElementById("input-conch-3").value || 0,
            chaos: +document.getElementById("input-octopus-3").value || 0,
            life: +document.getElementById("input-seaweed-3").value || 0,
            decay: +document.getElementById("input-urchin-3").value || 0
        };

        if (isAdvancedMode) {
            input.elixGuard = +document.getElementById("input-elixir-guard-3")?.value || 0;
            input.elixWave = +document.getElementById("input-elixir-wave-3")?.value || 0;
            input.elixChaos = +document.getElementById("input-elixir-chaos-3")?.value || 0;
            input.elixLife = +document.getElementById("input-elixir-life-3")?.value || 0;
            input.elixDecay = +document.getElementById("input-elixir-decay-3")?.value || 0;

            input.potionImmortal = +document.getElementById("input-potion-immortal-3")?.value || 0;
            input.potionBarrier = +document.getElementById("input-potion-barrier-3")?.value || 0;
            input.potionCorrupt = +document.getElementById("input-potion-corrupt-3")?.value || 0;
            input.potionFrenzy = +document.getElementById("input-potion-frenzy-3")?.value || 0;
            input.potionVenom = +document.getElementById("input-potion-venom-3")?.value || 0;
        } else {
            input.elixGuard = input.elixWave = input.elixChaos = input.elixLife = input.elixDecay = 0;
            input.potionImmortal = input.potionBarrier = input.potionCorrupt = input.potionFrenzy = input.potionVenom = 0;
        }

        const r = calculate3Star(input);
        if (!r) return alert("재료 부족");

        update3StarResult(r);
        document.getElementById("result-card-3").style.display = "block";
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    if (setSwitcher) {
        setSwitcher.addEventListener('change', () => {
            if (window.last3StarResult) update3StarResult(window.last3StarResult);
        });
    }

    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', () => {
            if (window.last3StarResult) update3StarResult(window.last3StarResult);
        });
    }

    // ===== 입력칸 세트 표시 =====
    inputs.forEach(input => {
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

    console.log("✅ 3성 계산기 초기화 완료 (최적화 버전)");
});