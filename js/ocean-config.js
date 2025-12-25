/*************************************************
 * 해양 계산기 - 공통 설정 및 상수
 *************************************************/

// 세트 관련 상수
export const SET_COUNT = 64;

// 골드 가격
export const GOLD_PRICES = {
    '1star': { A: 3436, K: 3486, L: 3592 },
    '2star': { CORE: 7413, POTION: 7487, WING: 7592 },
    '3star': { AQUA: 10699, NAUTILUS: 10824, SPINE: 10892 }
};

// 프리미엄 가격 비율
export const PREMIUM_PRICE_RATE = {
    1: 0.05, 2: 0.07, 3: 0.10, 4: 0.15,
    5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50
};

// 1성 - 핵에서 정수로 변환
export const CORE_TO_ESSENCE_1STAR = {
    WG: { guard: 1, wave: 1 },
    WP: { wave: 1, chaos: 1 },
    OD: { chaos: 1, life: 1 },
    VD: { life: 1, decay: 1 },
    ED: { decay: 1, guard: 1 }
};

// 1성 - 정수에서 블록으로 변환
export const ESSENCE_TO_BLOCK_1STAR = {
    guard: { clay: 1 },
    wave: { sand: 3 },
    chaos: { dirt: 4 },
    life: { gravel: 2 },
    decay: { granite: 1 }
};

// 1성 - 핵에서 물고기로 변환
export const CORE_TO_FISH_1STAR = {
    WG: { shrimp: 1 },
    WP: { domi: 1 },
    OD: { herring: 1 },
    VD: { goldfish: 1 },
    ED: { bass: 1 }
};

// 3성 - 의약에서 엘릭서로 변환
export const POTION_TO_ELIXIR_3STAR = {
    immortal: { guard: 1, life: 1 },
    barrier: { guard: 1, wave: 1 },
    corrupt: { chaos: 1, decay: 1 },
    frenzy: { chaos: 1, life: 1 },
    venom: { wave: 1, decay: 1 }
};

// 낚싯대 강화 데이터
export const ROD_DATA = {
    1: { drop: 1, clamRate: 0 },
    2: { drop: 1, clamRate: 0.01 },
    3: { drop: 2, clamRate: 0.01 },
    4: { drop: 2, clamRate: 0.01 },
    5: { drop: 2, clamRate: 0.02 },
    6: { drop: 3, clamRate: 0.02 },
    7: { drop: 3, clamRate: 0.02 },
    8: { drop: 3, clamRate: 0.03 },
    9: { drop: 4, clamRate: 0.03 },
    10: { drop: 4, clamRate: 0.03 },
    11: { drop: 4, clamRate: 0.05 },
    12: { drop: 5, clamRate: 0.05 },
    13: { drop: 5, clamRate: 0.05 },
    14: { drop: 5, clamRate: 0.05 },
    15: { drop: 6, clamRate: 0.10 }
};

// 전문가 스킬 데이터
export const EXPERT_SKILLS = {
    storm: [0, 0.01, 0.03, 0.05, 0.07, 0.10],
    clamRefill: [0, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.07]
};