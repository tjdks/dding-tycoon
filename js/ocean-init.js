/*************************************************
 * 해양 계산기 - 메인 초기화
 *************************************************/

import { setupTabs, setupSetSwitcher, setupInputSetDisplay } from './ocean-ui.js';
import * as Calculator1Star from './ocean-calculator-1star.js';
import * as Calculator2Star from './ocean-calculator-2star.js';
import * as Calculator3Star from './ocean-calculator-3star.js';
import * as Stamina from './ocean-stamina.js';
import { getElement } from './ocean-utils.js';

/**
 * 페이지 초기화
 */
function init() {
    // 탭 설정
    setupTabs();

    // 계산기 초기화
    Calculator1Star.init();
    Calculator2Star.init();
    Calculator3Star.init();
    Stamina.init();

    // 세트 스위처 설정
    setupSetSwitcher(() => {
        Calculator1Star.refresh();
        Calculator2Star.refresh();
        Calculator3Star.refresh();
    });

    // 첫 화면 입력칸 세트 표시 설정
    const firstStar = getElement('star-1');
    if (firstStar) setupInputSetDisplay(firstStar);

    // 프리미엄 입력값 자동 반영
    const premiumInput = getElement("info-expert-premium-price");
    if (premiumInput) {
        premiumInput.addEventListener("input", () => {
            // 결과가 있으면 재계산
            Calculator1Star.refresh();
            Calculator2Star.refresh();
            Calculator3Star.refresh();
        });
    }

    console.log("✅ 해양 계산기 초기화 완료");
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
