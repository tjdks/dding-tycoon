// 해양 정보 탭 - 전문가 세팅 관련 함수

/**
 * 전문가 정보 토글
 */
function toggleExpertInfo(type) {
  const infoId = `desc-${type}`;
  const infoElement = document.getElementById(infoId);
  
  if (!infoElement) return;
  
  if (infoElement.style.display === 'none' || infoElement.style.display === '') {
    infoElement.style.display = 'block';
  } else {
    infoElement.style.display = 'none';
  }
}

/**
 * 모든 전문가 설정값 가져오기
 */
function getAllOceanExpertSettings() {
  return {
    rodLevel: parseInt(document.getElementById('info-expert-rod')?.value || 0),
    clam: parseInt(document.getElementById('expert-clam-level')?.value || 0),
    premiumPrice: parseInt(document.getElementById('info-expert-premium-price')?.value || 0),
    storm: parseInt(document.getElementById('expert-storm')?.value || 0),
    star: parseInt(document.getElementById('expert-star')?.value || 0),
    clamRefill: parseInt(document.getElementById('expert-clam-refill')?.value || 0)
  };
}

/**
 * 해양 관련 설정값만 가져오기 (스태미나 탭용)
 */
function getOceanSettings() {
  const rodLevel = parseInt(document.getElementById('info-expert-rod')?.value || 0);
  const expertStorm = parseInt(document.getElementById('expert-storm')?.value || 0);
  const expertStar = parseInt(document.getElementById('expert-star')?.value || 0);
  const expertClamRefill = parseInt(document.getElementById('expert-clam-refill')?.value || 0);
  
  return {
    rodLevel,
    expertStorm,
    expertStar,
    expertClamRefill
  };
}

/**
 * 설정 변경 감지 및 다른 탭에 반영
 */
function setupOceanSettingsSync() {
  const inputs = [
    'info-expert-rod',
    'expert-clam-level',
    'info-expert-premium-price',
    'expert-storm',
    'expert-star',
    'expert-clam-refill'
  ];
  
  const updateSettings = () => {
    const settings = getOceanSettings();
    
    // ocean-stamina.js의 설정 업데이트 (나중에 생성될 함수)
    if (typeof updateOceanExpertSettings === 'function') {
      updateOceanExpertSettings(settings);
    }
    
    // 전체 설정 콘솔 출력
    const allSettings = getAllOceanExpertSettings();
    console.log('해양 전문가 세팅 업데이트:', allSettings);
  };
  
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', updateSettings);
      input.addEventListener('change', updateSettings);
    }
  });
  
  // 초기 설정 적용
  updateSettings();
}

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
  setupOceanSettingsSync();
});