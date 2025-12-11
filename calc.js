// calc.js
// 최적 조합 탐색 (어패류 → 정수(1:1) → 핵(정수 소모) → 최종 아이템(핵 조합))
// 마지막에 최종 결과물에 필요한 '생선' 수량만 출력 (핵 제작 시 생선은 무시)

function getValue(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const v = el.value;
    return v === "" ? 0 : Number(v);
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('calculateBtn');
    const out = document.getElementById('result');

    btn.addEventListener('click', () => {
        // ---------- 입력값 ----------
        const 굴 = getValue('굴');
        const 소라 = getValue('소라');
        const 문어 = getValue('문어');
        const 미역 = getValue('미역');
        const 성게 = getValue('성게');

        // 기존 보유 정수
        const eG_exist = getValue('eG_exist');   // 수호
        const eW_exist = getValue('eW_exist');   // 파동
        const eC_exist = getValue('eC_exist');   // 혼란
        const eL_exist = getValue('eL_exist');   // 생명
        const eCo_exist = getValue('eCo_exist'); // 부식

        // 기존 보유 핵
        const cWG_exist = getValue('cWG_exist'); // 물결 수호 (WG)
        const cWP_exist = getValue('cWP_exist'); // 파동 오염 (WP)
        const cOD_exist = getValue('cOD_exist'); // 질서 파괴 (OD)
        const cVD_exist = getValue('cVD_exist'); // 활력 붕괴 (VD)
        const cED_exist = getValue('cED_exist'); // 침식 방어 (ED)

        // ---------- 정수 계산 (어패류 1:1 매핑) ----------
        // 굴 -> 수호, 소라 -> 파동, 문어 -> 혼란, 미역 -> 생명, 성게 -> 부식
        const tot_eG = eG_exist + 굴;
        const tot_eW = eW_exist + 소라;
        const tot_eC = eC_exist + 문어;
        const tot_eL = eL_exist + 미역;
        const tot_eCo = eCo_exist + 성게;

        // ---------- 준비: upper bounds ----------
        // 총 정수량으로 만들 수 있는 (대략) 핵 개수 상한 (핵 1개 당 정수 2개 사용)
        const totalEssences = tot_eG + tot_eW + tot_eC + tot_eL + tot_eCo;
        const potentialNewCores = Math.floor(totalEssences / 2);
        const totalExistingCores = cWG_exist + cWP_exist + cOD_exist + cVD_exist + cED_exist;
        const coreUpper = totalExistingCores + potentialNewCores;
        // 최종 아이템은 핵 3개씩 필요하므로 가능한 최종 아이템 총합 상한
        const maxFinalsTotal = Math.floor(coreUpper / 3);
        // 안전 상한 (in case zero) -> 최소 0, 최대 reasonably 200
        const maxFinals = Math.min(Math.max(maxFinalsTotal, 0), 200);

        // Final item values
        const VAL_A = 2403; // 영생의 아쿠티스 (A)
        const VAL_K = 2438; // 크라켄의 광란체 (K)
        const VAL_L = 2512; // 리바이던의 깃털 (L)

        // best tracking
        let best = {
            gold: -1,
            A: 0,
            K: 0,
            L: 0,
            make_WG: 0, make_WP: 0, make_OD: 0, make_VD: 0, make_ED: 0,
            need_eG: 0, need_eW: 0, need_eC: 0, need_eL: 0, need_eCo: 0,
            remain_eG: tot_eG, remain_eW: tot_eW, remain_eC: tot_eC, remain_eL: tot_eL, remain_eCo: tot_eCo,
            used_WG:0, used_WP:0, used_OD:0, used_VD:0, used_ED:0
        };

        // Brute force over feasible A,K,L values (sum limited)
        // iterate A from 0..maxFinals, K 0..maxFinals-A etc to reduce loops
        for (let A = 0; A <= maxFinals; A++) {
            for (let K = 0; K <= maxFinals - A; K++) {
                for (let L = 0; L <= maxFinals - A - K; L++) {

                    // required cores to make these finals
                    const need_WG = A + L;        // 물결 수호 사용 by A and L
                    const need_WP = K + L;        // 파동 오염 used by K and L
                    const need_OD = A + K;        // 질서 파괴 used by A and K
                    const need_VD = A + K;        // 활력 붕괴 used by A and K
                    const need_ED = L;            // 침식 방어 used by L

                    // additional cores to create (existing cores reduce need)
                    const make_WG = Math.max(0, need_WG - cWG_exist);
                    const make_WP = Math.max(0, need_WP - cWP_exist);
                    const make_OD = Math.max(0, need_OD - cOD_exist);
                    const make_VD = Math.max(0, need_VD - cVD_exist);
                    const make_ED = Math.max(0, need_ED - cED_exist);

                    // required essences to craft those new cores
                    // core -> required two essences mapping:
                    // WG needs: 수호(eG) + 파동(eW)
                    // WP needs: 파동(eW) + 혼란(eC)
                    // OD needs: 혼란(eC) + 생명(eL)
                    // VD needs: 생명(eL) + 부식(eCo)
                    // ED needs: 부식(eCo) + 수호(eG)
                    const req_eG = make_WG + make_ED;            // 수호 needed by make_WG and make_ED
                    const req_eW = make_WG + make_WP;            // 파동 needed by make_WG and make_WP
                    const req_eC = make_WP + make_OD;            // 혼란 needed by make_WP and make_OD
                    const req_eL = make_OD + make_VD;            // 생명 needed by make_OD and make_VD
                    const req_eCo = make_VD + make_ED;           // 부식 needed by make_VD and make_ED

                    // check if available essences suffice
                    if (req_eG <= tot_eG && req_eW <= tot_eW && req_eC <= tot_eC &&
                        req_eL <= tot_eL && req_eCo <= tot_eCo) {

                        const gold = A * VAL_A + K * VAL_K + L * VAL_L;

                        // tie-breaker: prefer higher gold; if equal, prefer less leftover total essences (optional)
                        if (gold > best.gold) {
                            // compute remainings for display
                            const remain_eG = tot_eG - req_eG;
                            const remain_eW = tot_eW - req_eW;
                            const remain_eC = tot_eC - req_eC;
                            const remain_eL = tot_eL - req_eL;
                            const remain_eCo = tot_eCo - req_eCo;

                            best = {
                                gold, A, K, L,
                                make_WG, make_WP, make_OD, make_VD, make_ED,
                                need_eG: req_eG, need_eW: req_eW, need_eC: req_eC, need_eL: req_eL, need_eCo: req_eCo,
                                remain_eG, remain_eW, remain_eC, remain_eL, remain_eCo,
                                used_WG: need_WG, used_WP: need_WP, used_OD: need_OD, used_VD: need_VD, used_ED: need_ED
                            };
                        }
                    }
                }
            }
        }

        // ---------- 출력 처리 ----------
        if (best.gold < 0) {
            out.innerHTML = `<b>현재 자원으로 만들 수 있는 조합이 없습니다.</b>`;
            return;
        }

        // fish requirements for final items (per spec)
        // 리바이던(깃털) -> 새우 1 per L
        // 크라켄 -> 도미 1 per K
        // 영생의 아쿠티스 -> none
        const neededShrimp = best.L; // 새우
        const neededDomi = best.K;   // 도미
        const neededHerring = 0;     // 청어 (none by final mapping)
        const neededGoldfish = 0;    // 금붕어
        const neededBass = 0;        // 농어

        // also compute how many additional cores were required (make_*)
        // and also how many essences need to be created (need_e*)
        // present a readable table
        const html = [];
        html.push(`<h3>최적 결과 (최대 골드)</h3>`);
        html.push(`<p><b>총 골드(예상):</b> ${best.gold} G</p>`);
        html.push(`<p><b>결과물 생산량:</b> 영생의 아쿠티스: ${best.A}개, 크라켄의 광란체: ${best.K}개, 리바이던의 깃털: ${best.L}개</p>`);

        // show cores used and make counts
        html.push(`<h4>핵 (사용 / 기존 보유 / 추가 제작)</h4>`);
        html.push(`<ul>
            <li>물결 수호 (WG): 사용 ${best.used_WG} / 보유 ${cWG_exist} / 추가 제작 ${best.make_WG}</li>
            <li>파동 오염 (WP): 사용 ${best.used_WP} / 보유 ${cWP_exist} / 추가 제작 ${best.make_WP}</li>
            <li>질서 파괴 (OD): 사용 ${best.used_OD} / 보유 ${cOD_exist} / 추가 제작 ${best.make_OD}</li>
            <li>활력 붕괴 (VD): 사용 ${best.used_VD} / 보유 ${cVD_exist} / 추가 제작 ${best.make_VD}</li>
            <li>침식 방어 (ED): 사용 ${best.used_ED} / 보유 ${cED_exist} / 추가 제작 ${best.make_ED}</li>
        </ul>`);

        // show essences needed and remainings
        html.push(`<h4>정수 (필요 / 보유 총합 / 잔여)</h4>`);
        html.push(`<ul>
            <li>수호: 필요 ${best.need_eG} / 보유 ${tot_eG} / 잔여 ${best.remain_eG}</li>
            <li>파동: 필요 ${best.need_eW} / 보유 ${tot_eW} / 잔여 ${best.remain_eW}</li>
            <li>혼란: 필요 ${best.need_eC} / 보유 ${tot_eC} / 잔여 ${best.remain_eC}</li>
            <li>생명: 필요 ${best.need_eL} / 보유 ${tot_eL} / 잔여 ${best.remain_eL}</li>
            <li>부식: 필요 ${best.need_eCo} / 보유 ${tot_eCo} / 잔여 ${best.remain_eCo}</li>
        </ul>`);

        // fish requirements (for final items)
        html.push(`<h4>최종 결과물에 필요한 생선</h4>`);
        html.push(`<ul>
            <li>새우 (리바이던의 깃털): ${neededShrimp}</li>
            <li>도미 (크라켄의 광란체): ${neededDomi}</li>
        </ul>`);

        // Also show summary of initial inputs and leftover essences/cores
        html.push(`<h4>입력 요약</h4>`);
        html.push(`<p>어패류 입력 — 굴:${굴}, 소라:${소라}, 문어:${문어}, 미역:${미역}, 성게:${성게}</p>`);
        html.push(`<p>기존 정수 (입력) — 수호:${eG_exist}, 파동:${eW_exist}, 혼란:${eC_exist}, 생명:${eL_exist}, 부식:${eCo_exist}</p>`);
        html.push(`<p>기존 핵 (입력) — 물결:${cWG_exist}, 파동:${cWP_exist}, 질서:${cOD_exist}, 활력:${cVD_exist}, 침식:${cED_exist}</p>`);

        out.innerHTML = html.join('\n');
    });
});
