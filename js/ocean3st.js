/*************************************************
 * 3️⃣ 3성 계산기 (ocean3rd.js)
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    const GOLD_3STAR = { AQUA: 10699, NAUTILUS: 10824, SPINE: 10892 };
    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');

    const inputs = [
        document.getElementById("input-oyster-3"),
        document.getElementById("input-conch-3"),
        document.getElementById("input-octopus-3"),
        document.getElementById("input-seaweed-3"),
        document.getElementById("input-urchin-3")
    ];

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        if (sets > 0 && remainder > 0) return `${sets} / ${remainder}`;
        if (sets > 0) return `${sets} / 0`;
        return `0 / ${remainder}`;
    }

    // ===== 계산 함수 =====
    function calculate3Star(input) {
        const ELIXER_MATERIALS = {
            "불멸 재생의 영약 ★★★": ["수호의 엘릭서 ★★★", "생명의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "수레국화"],
            "파동 장벽의 영약 ★★★": ["파동의 엘릭서 ★★★", "수호의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "민들레"],
            "타락 침식의 영약 ★★★": ["혼란의 엘릭서 ★★★", "부식의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "데이지"],
            "생명 광란의 영약 ★★★": ["생명의 엘릭서 ★★★", "혼란의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "양귀비"],
            "맹독 파동의 영약 ★★★": ["부식의 엘릭서 ★★★", "파동의 엘릭서 ★★★", "발광 먹물 주머니", "발광 열매", "선애기별꽃"]
        };

        let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };
        let limit = Math.max(10, input.guard + input.wave + input.chaos + input.life + input.decay);

        for (let AQUA = 0; AQUA <= limit; AQUA++) {
            for (let NAUTILUS = 0; NAUTILUS <= limit; NAUTILUS++) {
                for (let SPINE = 0; SPINE <= limit; SPINE++) {
                    let potion = {
                        immortal: AQUA + NAUTILUS,
                        barrier: AQUA + NAUTILUS,
                        poison: AQUA + SPINE,
                        frenzy: NAUTILUS + SPINE,
                        corrupt: SPINE
                    };
                    let elixir = {
                        guard: potion.immortal + potion.barrier,
                        wave: potion.barrier + potion.poison,
                        chaos: potion.corrupt + potion.frenzy,
                        life: potion.immortal + potion.frenzy,
                        decay: potion.corrupt + potion.poison
                    };
                    if (elixir.guard > input.guard || elixir.wave > input.wave || elixir.chaos > input.chaos ||
                        elixir.life > input.life || elixir.decay > input.decay) continue;

                    let gold = AQUA * GOLD_3STAR.AQUA + NAUTILUS * GOLD_3STAR.NAUTILUS + SPINE * GOLD_3STAR.SPINE;
                    if (gold > best.gold) best = { gold, AQUA, NAUTILUS, SPINE };
                }
            }
        }

        if (best.gold < 0) return null;

        let potionNeed = {
            immortal: best.AQUA + best.NAUTILUS,
            barrier: best.AQUA + best.NAUTILUS,
            poison: best.AQUA + best.SPINE,
            frenzy: best.NAUTILUS + best.SPINE,
            corrupt: best.SPINE
        };

        let elixirNeed = {
            guard: potionNeed.immortal + potionNeed.barrier,
            wave: potionNeed.barrier + potionNeed.poison,
            chaos: potionNeed.corrupt + potionNeed.frenzy,
            life: potionNeed.immortal + potionNeed.frenzy,
            decay: potionNeed.corrupt + potionNeed.poison
        };

        let materialNeed = {
            seaSquirt: potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt,
            bottle: 3 * (potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt),
            glowInk: potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt,
            glowBerry: 2 * (potionNeed.immortal + potionNeed.barrier + potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt)
        };

        let blockNeed = {
            netherrack: elixirNeed.guard * 16,
            magma: elixirNeed.wave * 8,
            soulSand: elixirNeed.chaos * 8,
            crimson: elixirNeed.life * 4,
            warped: elixirNeed.decay * 4
        };

        let flowerNeed = {
            cornflower: potionNeed.immortal,
            dandelion: potionNeed.barrier,
            daisy: potionNeed.corrupt,
            poppy: potionNeed.frenzy,
            azure: potionNeed.poison
        };

        return { best, elixirNeed, potionNeed, materialNeed, blockNeed, flowerNeed, elixirCombos: ELIXER_MATERIALS };
    }

    // ===== 결과 업데이트 =====
    function update3StarResult(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-3").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();;
        document.getElementById("result-premium-bonus-3").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        document.getElementById("result-aqua-3").textContent = setSwitcher.checked ? formatSet(r.best.AQUA) : r.best.AQUA;
        document.getElementById("result-nautilus-3").textContent = setSwitcher.checked ? formatSet(r.best.NAUTILUS) : r.best.NAUTILUS;
        document.getElementById("result-spine-3").textContent = setSwitcher.checked ? formatSet(r.best.SPINE) : r.best.SPINE;

        document.getElementById("result-essence-3").textContent =
            `수호 ${setSwitcher.checked ? formatSet(r.elixirNeed.guard) : r.elixirNeed.guard}, ` +
            `파동 ${setSwitcher.checked ? formatSet(r.elixirNeed.wave) : r.elixirNeed.wave}, ` +
            `혼란 ${setSwitcher.checked ? formatSet(r.elixirNeed.chaos) : r.elixirNeed.chaos}, ` +
            `생명 ${setSwitcher.checked ? formatSet(r.elixirNeed.life) : r.elixirNeed.life}, ` +
            `부식 ${setSwitcher.checked ? formatSet(r.elixirNeed.decay) : r.elixirNeed.decay}`;

        document.getElementById("result-core-3").textContent =
            `불멸 재생 ${setSwitcher.checked ? formatSet(r.potionNeed.immortal) : r.potionNeed.immortal}, ` +
            `파동 장벽 ${setSwitcher.checked ? formatSet(r.potionNeed.barrier) : r.potionNeed.barrier}, ` +
            `타락 침식 ${setSwitcher.checked ? formatSet(r.potionNeed.poison) : r.potionNeed.poison}, ` +
            `생명 광란 ${setSwitcher.checked ? formatSet(r.potionNeed.frenzy) : r.potionNeed.frenzy}, ` +
            `맹독 파동 ${setSwitcher.checked ? formatSet(r.potionNeed.corrupt) : r.potionNeed.corrupt}`;

        document.getElementById("result-material-3").textContent =
            `불우렁쉥이 ${setSwitcher.checked ? formatSet(r.materialNeed.seaSquirt) : r.materialNeed.seaSquirt}, ` +
            `유리병 ${setSwitcher.checked ? formatSet(r.materialNeed.bottle) : r.materialNeed.bottle}, ` +
            `발광 먹물 ${setSwitcher.checked ? formatSet(r.materialNeed.glowInk) : r.materialNeed.glowInk}, ` +
            `발광 열매 ${setSwitcher.checked ? formatSet(r.materialNeed.glowBerry) : r.materialNeed.glowBerry}`;

        document.getElementById("result-block-3").textContent =
            `네더렉 ${setSwitcher.checked ? formatSet(r.blockNeed.netherrack) : r.blockNeed.netherrack}, ` +
            `마그마 ${setSwitcher.checked ? formatSet(r.blockNeed.magma) : r.blockNeed.magma}, ` +
            `영혼흙 ${setSwitcher.checked ? formatSet(r.blockNeed.soulSand) : r.blockNeed.soulSand}, ` +
            `진홍 ${setSwitcher.checked ? formatSet(r.blockNeed.crimson) : r.blockNeed.crimson}, ` +
            `뒤틀린 ${setSwitcher.checked ? formatSet(r.blockNeed.warped) : r.blockNeed.warped}`;

        document.getElementById("result-flower-3").textContent =
            `수레국화 ${setSwitcher.checked ? formatSet(r.flowerNeed.cornflower) : r.flowerNeed.cornflower}, ` +
            `민들레 ${setSwitcher.checked ? formatSet(r.flowerNeed.dandelion) : r.flowerNeed.dandelion}, ` +
            `데이지 ${setSwitcher.checked ? formatSet(r.flowerNeed.daisy) : r.flowerNeed.daisy}, ` +
            `양귀비 ${setSwitcher.checked ? formatSet(r.flowerNeed.poppy) : r.flowerNeed.poppy}, ` +
            `선애기별꽃 ${setSwitcher.checked ? formatSet(r.flowerNeed.azure) : r.flowerNeed.azure}`;

        window.last3StarResult = r;
    }

    // ===== 버튼 클릭 함수 =====
    window.run3StarOptimization = function() {
        const r = calculate3Star({
            guard: +document.getElementById("input-oyster-3").value,
            wave: +document.getElementById("input-conch-3").value,
            chaos: +document.getElementById("input-octopus-3").value,
            life: +document.getElementById("input-seaweed-3").value,
            decay: +document.getElementById("input-urchin-3").value
        });
        if (!r) return alert("재료 부족");

        update3StarResult(r);
        document.getElementById("result-card-3").style.display = "block";
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    setSwitcher.addEventListener('change', () => {
        if (window.last3StarResult) update3StarResult(window.last3StarResult);
    });

    // ===== 입력칸 세트 표시 =====
    // ===== 입력칸 세트 표시 =====
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.className = 'set-display';
        input.parentNode.appendChild(span);

        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 0;
            if (setSwitcher.checked) {
                const sets = Math.floor(value / SET_COUNT);
                const remainder = value % SET_COUNT;
                span.textContent = ` ${sets} / ${remainder}`;
            } else {
                span.textContent = '';
            }
        });
    });

});
