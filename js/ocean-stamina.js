// 해양 스태미나 계산

// 전역 설정
const STAMINA_CONFIG = {
  perGather: 15, // 해양은 15 스태미나
  rodLevel: 0,
  expertStorm: 0,
  expertStar: 0,
  expertClamRefill: 0,
};

// 낚싯대 레벨별 드롭 수
const ROD_STATS = {
  1: 1, 2: 2, 3: 2, 4: 2, 5: 3,
  6: 3, 7: 3, 8: 4, 9: 4, 10: 4,
  11: 5, 12: 5, 13: 6, 14: 6, 15: 10
};

// 낚싯대 레벨별 조개 기본 확률
const ROD_CLAM_RATE = {
  1: 0.01, 2: 0.02, 3: 0.03, 4: 0.04, 5: 0.05,
  6: 0.06, 7: 0.07, 8: 0.08, 9: 0.09, 10: 0.10,
  11: 0.11, 12: 0.12, 13: 0.13, 14: 0.14, 15: 0.20
};

// 전문가 스킬: 폭풍의 물질꾼 (비 오는 날 추가 확률)
const EXPERT_STORM = {
  0: 0, 1: 0.01, 2: 0.03, 3: 0.05, 4: 0.07, 5: 0.10
};

// 전문가 스킬: 별별별! (3성 확률 증가)
const EXPERT_STAR = {
  0: 0, 1: 0.01, 2: 0.02, 3: 0.03, 4: 0.04, 5: 0.05, 6: 0.07
};

// 전문가 스킬: 조개 무한리필 (조개 확률 증가)
const EXPERT_CLAM_REFILL = {
  0: 0, 1: 0.01, 2: 0.015, 3: 0.02, 4: 0.025, 5: 0.03,
  6: 0.035, 7: 0.04, 8: 0.045, 9: 0.05, 10: 0.07
};

// 어패류 이름
const FISH_NAMES = {
  oyster: '굴',
  conch: '소라',
  octopus: '문어',
  seaweed: '미역',
  urchin: '성게'
};

// 입력 카운터
let inputCount = 1;

/**
 * 숫자 포맷팅
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 입력창 추가
 */
function addStaminaInput() {
  inputCount++;
  const container = document.getElementById('stamina-inputs-container');
  
  const newInputRow = document.createElement('div');
  newInputRow.className = 'stamina-input-row';
  newInputRow.id = `input-row-${inputCount}`;
  newInputRow.innerHTML = `
    <div class="stamina-input-group">
      <label class="stamina-label">
        스태미나
        <input type="number" id="stamina-input-${inputCount}" class="stamina-input" placeholder="3300" min="0" step="15">
      </label>
      
      <label class="stamina-label">
        어패류
        <select id="fish-select-${inputCount}" class="stamina-select">
          <option value="oyster">굴</option>
          <option value="conch">소라</option>
          <option value="octopus">문어</option>
          <option value="seaweed">미역</option>
          <option value="urchin">성게</option>
        </select>
      </label>
    </div>
    <button class="btn-remove" onclick="removeStaminaInput(${inputCount})">삭제</button>
  `;
  
  container.appendChild(newInputRow);
}

/**
 * 입력창 삭제
 */
function removeStaminaInput(id) {
  const row = document.getElementById(`input-row-${id}`);
  if (row) {
    row.remove();
  }
}

/**
 * 등급별 분배 (정수 기반)
 */
function distributeByRarity(totalDrops, starLevel) {
  const rate3 = 0.10 + (EXPERT_STAR[starLevel] || 0); // 3성 (기본 10%)
  const rate2 = 0.30;                                  // 2성 (고정 30%)
  const rate1 = 1 - rate2 - rate3;                     // 1성 (나머지)
  
  // 소수 기반 계산
  let raw1 = totalDrops * rate1;
  let raw2 = totalDrops * rate2;
  let raw3 = totalDrops * rate3;
  
  // 정수 변환
  let count1 = Math.floor(raw1);
  let count2 = Math.floor(raw2);
  let count3 = Math.floor(raw3);
  
  // 나머지 배분 (소수점이 큰 순서대로)
  let remainder = totalDrops - (count1 + count2 + count3);
  const probOrder = [
    { key: 'count3', frac: raw3 - count3 },
    { key: 'count2', frac: raw2 - count2 },
    { key: 'count1', frac: raw1 - count1 }
  ].sort((a, b) => b.frac - a.frac);
  
  const counts = { count1, count2, count3 };
  for (let i = 0; i < remainder; i++) {
    counts[probOrder[i % 3].key]++;
  }
  
  return counts;
}

/**
 * 스태미나 계산
 */
function calculateStamina() {
  // 정보 탭에서 전문가 설정 가져오기
  syncExpertSettings();
  
  const results = [];
  
  for (let i = 1; i <= inputCount; i++) {
    const inputElem = document.getElementById(`stamina-input-${i}`);
    const selectElem = document.getElementById(`fish-select-${i}`);
    
    if (!inputElem || !selectElem) continue;
    
    const stamina = parseInt(inputElem.value);
    const fishType = selectElem.value;
    
    if (!stamina || stamina <= 0) continue;
    
    // 채집 횟수
    const gatherCount = Math.floor(stamina / STAMINA_CONFIG.perGather);
    
    // 기본 드롭 수 (낚싯대 레벨)
    const dropsPerGather = STAMINA_CONFIG.rodLevel > 0 ? (ROD_STATS[STAMINA_CONFIG.rodLevel] || 1) : 1;
    let totalDrops = gatherCount * dropsPerGather;
    
    // 폭풍의 물질꾼 (비 오는 날 가정)
    const isRain = true;
    if (isRain && STAMINA_CONFIG.expertStorm > 0) {
      const stormBonus = Math.floor(gatherCount * (EXPERT_STORM[STAMINA_CONFIG.expertStorm] || 0));
      totalDrops += stormBonus;
    }
    
    // 등급별 분배
    const { count1, count2, count3 } = distributeByRarity(totalDrops, STAMINA_CONFIG.expertStar);
    
    // 조개 계산
    const baseClamRate = STAMINA_CONFIG.rodLevel > 0 ? (ROD_CLAM_RATE[STAMINA_CONFIG.rodLevel] || 0.01) : 0.01;
    const clamBonus = EXPERT_CLAM_REFILL[STAMINA_CONFIG.expertClamRefill] || 0;
    const totalClamRate = baseClamRate + clamBonus;
    const clamCount = Math.floor(gatherCount * totalClamRate);
    
    results.push({
      fishName: FISH_NAMES[fishType],
      count1,
      count2,
      count3,
      clamCount,
      totalDrops
    });
  }
  
  if (results.length === 0) {
    alert('스태미나를 입력해주세요.');
    return;
  }
  
  displayResults(results);
}

/**
 * 결과 표시
 */
function displayResults(results) {
  const resultCard = document.getElementById('stamina-result-card');
  const resultBody = document.getElementById('result-body');
  
  resultCard.style.display = 'block';
  
  let html = '';
  results.forEach((result) => {
    html += `
      <div class="fish-result-section">
        <h5 class="fish-result-title">${result.fishName}</h5>
        <div class="fish-result-row">
          <span class="result-label">1성 (★):</span>
          <span class="result-value">${formatNumber(result.count1)}개</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">2성 (★★):</span>
          <span class="result-value">${formatNumber(result.count2)}개</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">3성 (★★★):</span>
          <span class="result-value highlight">${formatNumber(result.count3)}개</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">조개:</span>
          <span class="result-value">${formatNumber(result.clamCount)}개</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">총 드롭:</span>
          <span class="result-value highlight">${formatNumber(result.totalDrops)}개</span>
        </div>
      </div>
    `;
  });
  
  resultBody.innerHTML = html;
  
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * 정보 탭에서 전문가 설정 동기화
 */
function syncExpertSettings() {
  const rodInput = document.getElementById('info-expert-rod');
  const stormInput = document.getElementById('expert-storm');
  const starInput = document.getElementById('expert-star');
  const clamInput = document.getElementById('expert-clam-refill');
  
  STAMINA_CONFIG.rodLevel = rodInput ? parseInt(rodInput.value) || 0 : 0;
  STAMINA_CONFIG.expertStorm = stormInput ? parseInt(stormInput.value) || 0 : 0;
  STAMINA_CONFIG.expertStar = starInput ? parseInt(starInput.value) || 0 : 0;
  STAMINA_CONFIG.expertClamRefill = clamInput ? parseInt(clamInput.value) || 0 : 0;
  
  updateExpertDisplay();
}

/**
 * 전문가 정보 표시 업데이트
 */
function updateExpertDisplay() {
  const rodLevel = STAMINA_CONFIG.rodLevel;
  const stormLevel = STAMINA_CONFIG.expertStorm;
  const starLevel = STAMINA_CONFIG.expertStar;
  const clamLevel = STAMINA_CONFIG.expertClamRefill;
  
  const expertInfoElem = document.getElementById('ocean-expert-info');
  if (expertInfoElem) {
    expertInfoElem.textContent = `낚싯대 ${rodLevel}강, 폭풍의 물질꾼 LV${stormLevel}, 별별별! LV${starLevel}, 조개 무한리필 LV${clamLevel}`;
  }
}

/**
 * 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
  const staminaInput = document.getElementById('stamina-input-1');
  if (staminaInput) {
    staminaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        calculateStamina();
      }
    });
  }
  
  // 정보 탭에서 전문가 설정이 변경될 때마다 동기화
  const expertInputs = ['info-expert-rod', 'expert-storm', 'expert-star', 'expert-clam-refill'];
  expertInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        syncExpertSettings();
        // 결과가 표시된 상태라면 자동 재계산
        const resultCard = document.getElementById('stamina-result-card');
        if (resultCard && resultCard.style.display === 'block') {
          calculateStamina();
        }
      });
    }
  });
  
  // 초기 동기화
  syncExpertSettings();
});