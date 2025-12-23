/*************************************************
 * 1️⃣ 1성 계산기 (ocean1st.js) - 카드형 출력 버전
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
    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', function() {
            const advancedInputs = document.getElementById('advanced-inputs-1');
            if (advancedInputs) {
                if (this.checked) {
                    advancedInputs.classList.add('active');
                } else {
                    advancedInputs.classList.remove('active');
                }
            }
        });
    }

    // ===== 유틸 함수 =====
    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        return `${sets} / ${remainder}`;
    }

    // ===== 계산 함수 (최적화 버전) =====
    window.calculate1Star = function(input) {
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

        // ===== 최대 제작 가능 개수 계산 (성능 최적화) =====
        
        // 영생의 아쿠티스(A): WG(guard+wave) + OD(chaos+life) + VD(life+decay)
        const maxA_WG = totalCore.WG + Math.floor((totalFish.guard + totalEss.guard + totalFish.wave + totalEss.wave) / 2);
        const maxA_OD = totalCore.OD + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.life + totalEss.life) / 2);
        const maxA_VD = totalCore.VD + Math.floor((totalFish.life + totalEss.life + totalFish.decay + totalEss.decay) / 2);
        const maxA = Math.min(maxA_WG, maxA_OD, maxA_VD);

        // 크라켄 광란체(K): WP(wave+chaos) + OD(chaos+life) + VD(life+decay)
        const maxK_WP = totalCore.WP + Math.floor((totalFish.wave + totalEss.wave + totalFish.chaos + totalEss.chaos) / 2);
        const maxK_OD = totalCore.OD + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.life + totalEss.life) / 2);
        const maxK_VD = totalCore.VD + Math.floor((totalFish.life + totalEss.life + totalFish.decay + totalEss.decay) / 2);
        const maxK = Math.min(maxK_WP, maxK_OD, maxK_VD);

        // 리바이던 깃털(L): WG(guard+wave) + WP(wave+chaos) + ED(decay+guard)
        const maxL_WG = totalCore.WG + Math.floor((totalFish.guard + totalEss.guard + totalFish.wave + totalEss.wave) / 2);
        const maxL_WP = totalCore.WP + Math.floor((totalFish.wave + totalEss.wave + totalFish.chaos + totalEss.chaos) / 2);
        const maxL_ED = totalCore.ED + Math.floor((totalFish.decay + totalEss.decay + totalFish.guard + totalEss.guard) / 2);
        const maxL = Math.min(maxL_WG, maxL_WP, maxL_ED);

        let best = { gold: -1, A: 0, K: 0, L: 0 };

        // ===== 최적화된 루프 (실제 가능 범위만 탐색) =====
        for (let A = 0; A <= maxA; A++) {
            for (let K = 0; K <= maxK; K++) {
                for (let L = 0; L <= maxL; L++) {
                    // 필요 핵
                    const needCore = {
                        WG: A + L,
                        WP: K + L,
                        OD: A + K,
                        VD: A + K,
                        ED: L
                    };

                    // 제작할 핵
                    const makeCore = {
                        WG: Math.max(0, needCore.WG - totalCore.WG),
                        WP: Math.max(0, needCore.WP - totalCore.WP),
                        OD: Math.max(0, needCore.OD - totalCore.OD),
                        VD: Math.max(0, needCore.VD - totalCore.VD),
                        ED: Math.max(0, needCore.ED - totalCore.ED)
                    };

                    // 제작할 핵에 필요한 정수
                    const needEss = {
                        guard: makeCore.WG + makeCore.ED,
                        wave: makeCore.WG + makeCore.WP,
                        chaos: makeCore.WP + makeCore.OD,
                        life: makeCore.OD + makeCore.VD,
                        decay: makeCore.VD + makeCore.ED
                    };

                    // 제작할 정수 (보유 정수 차감)
                    const makeFish = {
                        guard: Math.max(0, needEss.guard - totalEss.guard),
                        wave: Math.max(0, needEss.wave - totalEss.wave),
                        chaos: Math.max(0, needEss.chaos - totalEss.chaos),
                        life: Math.max(0, needEss.life - totalEss.life),
                        decay: Math.max(0, needEss.decay - totalEss.decay)
                    };

                    // 어패류 부족 체크
                    if (
                        makeFish.guard > totalFish.guard ||
                        makeFish.wave > totalFish.wave ||
                        makeFish.chaos > totalFish.chaos ||
                        makeFish.life > totalFish.life ||
                        makeFish.decay > totalFish.decay
                    ) continue;

                    const gold = A * GOLD_1STAR.A + K * GOLD_1STAR.K + L * GOLD_1STAR.L;
                    if (gold > best.gold) {
                        best = { gold, A, K, L };
                    }
                }
            }
        }

        if (best.gold < 0) return null;

        // ===== 결과 계산 =====
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

        // 일반 모드 표시용 (전체 필요량)
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
            coreNeed,
            coreToMake,
            essNeedTotal,
            essToMake,
            blockNeed,
            blockNeedTotal,
            fishNeed,
            fishNeedTotal
        };
    };

    // ===== 결과 업데이트 함수 (카드형 출력) =====
    window.update1StarResult = function(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value || 0;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-1").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();
        document.getElementById("result-premium-bonus-1").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        document.getElementById("result-acutis-1").textContent = setSwitcher.checked ? formatSet(r.best.A) : r.best.A;
        document.getElementById("result-frenzy-1").textContent = setSwitcher.checked ? formatSet(r.best.K) : r.best.K;
        document.getElementById("result-feather-1").textContent = setSwitcher.checked ? formatSet(r.best.L) : r.best.L;

        const isAdvanced = advancedSwitcher && advancedSwitcher.checked;
        const essData = isAdvanced ? r.essToMake : r.essNeedTotal;
        const coreData = isAdvanced ? r.coreToMake : r.coreNeed;
        const blockData = isAdvanced ? r.blockNeed : r.blockNeedTotal;
        const fishData = isAdvanced ? r.fishNeed : r.fishNeedTotal;

        // 정수 - 카드형 그리드
        const essenceHTML = `
            <div class="result-materials-grid">
                <div class="material-card">
                    <div class="icon"><img src="img/essence_guard.png" alt="수호"></div>
                    <div class="name">수호 정수</div>
                    <div class="value">${setSwitcher.checked ? formatSet(essData.guard || 0) : (essData.guard || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/essence_wave.png" alt="파동"></div>
                    <div class="name">파동 정수</div>
                    <div class="value">${setSwitcher.checked ? formatSet(essData.wave || 0) : (essData.wave || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/essence_chaos.png" alt="혼란"></div>
                    <div class="name">혼란 정수</div>
                    <div class="value">${setSwitcher.checked ? formatSet(essData.chaos || 0) : (essData.chaos || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/essence_life.png" alt="생명"></div>
                    <div class="name">생명 정수</div>
                    <div class="value">${setSwitcher.checked ? formatSet(essData.life || 0) : (essData.life || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/essence_decay.png" alt="부식"></div>
                    <div class="name">부식 정수</div>
                    <div class="value">${setSwitcher.checked ? formatSet(essData.decay || 0) : (essData.decay || 0)}</div>
                </div>
            </div>
        `;
        document.getElementById("result-essence-1").innerHTML = essenceHTML;

        // 핵 - 카드형 그리드
        const coreHTML = `
            <div class="result-materials-grid">
                <div class="material-card">
                    <div class="icon"><img src="img/core_wg.png" alt="물결수호"></div>
                    <div class="name">물결 수호</div>
                    <div class="value">${setSwitcher.checked ? formatSet(coreData.WG || 0) : (coreData.WG || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/core_wp.png" alt="파동오염"></div>
                    <div class="name">파동 오염</div>
                    <div class="value">${setSwitcher.checked ? formatSet(coreData.WP || 0) : (coreData.WP || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/core_od.png" alt="질서파괴"></div>
                    <div class="name">질서 파괴</div>
                    <div class="value">${setSwitcher.checked ? formatSet(coreData.OD || 0) : (coreData.OD || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/core_vd.png" alt="활력붕괴"></div>
                    <div class="name">활력 붕괴</div>
                    <div class="value">${setSwitcher.checked ? formatSet(coreData.VD || 0) : (coreData.VD || 0)}</div>
                </div>
                <div class="material-card">
                    <div class="icon"><img src="img/core_ed.png" alt="침식방어"></div>
                    <div class="name">침식 방어</div>
                    <div class="value">${setSwitcher.checked ? formatSet(coreData.ED || 0) : (coreData.ED || 0)}</div>
                </div>
            </div>
        `;
        document.getElementById("result-core-1").innerHTML = coreHTML;

        // 블록 - 텍스트만 표시 (왼쪽 정렬)
        const blockHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>점토</strong> ${setSwitcher.checked ? formatSet(blockData.clay) : blockData.clay}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>모래</strong> ${setSwitcher.checked ? formatSet(blockData.sand) : blockData.sand}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>흙</strong> ${setSwitcher.checked ? formatSet(blockData.dirt) : blockData.dirt}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>자갈</strong> ${setSwitcher.checked ? formatSet(blockData.gravel) : blockData.gravel}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>화강암</strong> ${setSwitcher.checked ? formatSet(blockData.granite) : blockData.granite}
                </span>
            </div>
        `;
        document.getElementById("result-block-1").innerHTML = blockHTML;

        // 물고기 - 텍스트만 표시 (왼쪽 정렬)
        const fishHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>새우</strong> ${setSwitcher.checked ? formatSet(fishData.shrimp) : fishData.shrimp}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>도미</strong> ${setSwitcher.checked ? formatSet(fishData.domi) : fishData.domi}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>청어</strong> ${setSwitcher.checked ? formatSet(fishData.herring) : fishData.herring}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>금붕어</strong> ${setSwitcher.checked ? formatSet(fishData.goldfish) : fishData.goldfish}
                </span>
                <span style="padding: 8px 12px; background: #f8f9fb; border-radius: 8px; font-size: 0.9rem;">
                    <strong>농어</strong> ${setSwitcher.checked ? formatSet(fishData.bass) : fishData.bass}
                </span>
            </div>
        `;
        document.getElementById("result-fish-1").innerHTML = fishHTML;

        window.last1StarResult = r;
    };

    // ===== 버튼 클릭 함수 =====
    window.run1StarOptimization = function() {
        const isAdvanced = advancedSwitcher && advancedSwitcher.checked;

        const input = {
            guard: +document.getElementById("input-oyster-1").value || 0,
            wave: +document.getElementById("input-shell-1").value || 0,
            chaos: +document.getElementById("input-octopus-1").value || 0,
            life: +document.getElementById("input-seaweed-1").value || 0,
            decay: +document.getElementById("input-urchin-1").value || 0
        };

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
            input.essGuard = input.essWave = input.essChaos = input.essLife = input.essDecay = 0;
            input.coreWG = input.coreWP = input.coreOD = input.coreVD = input.coreED = 0;
        }

        const r = calculate1Star(input);
        if (!r) return alert("재료 부족");

        update1StarResult(r);
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    if (setSwitcher) {
        setSwitcher.addEventListener('change', () => {
            if (window.last1StarResult) update1StarResult(window.last1StarResult);
        });
    }

    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', () => {
            if (window.last1StarResult) update1StarResult(window.last1StarResult);
        });
    }
});