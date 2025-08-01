// script.js

// ====================================================================================================
// 1. 게임 상태 변수 및 초기 설정
// ====================================================================================================

const player = {
    gold: 100, // 초기 골드
    day: 1,    // 현재 날짜
    season: '봄', // 현재 계절
    inventory: {}, // 인벤토리 (아이템: 수량)
    selectedTool: null, // 현재 선택된 도구
    selectedSeed: null, // 현재 선택된 씨앗 (심기 모드일 때)
    homeLevel: 1, // 집 레벨
    homeUpgradeCost: 1000, // 집 업그레이드 비용
    hasGreenhouse: false, // 온실 보유 여부
    buildings: {}, // 보유 건물 (건물: 수량)
    stocks: {}, // 보유 주식 (주식: 수량)
};

// 농장 격자 데이터 (10x10)
// 각 셀은 { state: 'untilled' | 'tilled' | 'planted' | 'watered' | 'harvestable', crop: null, watered: false, growthStage: 0, plantedDay: 0 }
const farmGrid = [];
const GRID_SIZE = 10;
const INITIAL_PLAYABLE_AREA = 2; // 2x2 시작 땅

// 작물 데이터
const cropsData = {
    carrot: { name: '당근', seedPrice: 10, baseSellPrice: 30, growthTime: 3, season: ['봄', '여름', '가을'] },
    potato: { name: '감자', seedPrice: 12, baseSellPrice: 35, growthTime: 4, season: ['봄', '여름', '가을'] },
    beet: { name: '비트', seedPrice: 15, baseSellPrice: 40, growthTime: 3, season: ['봄', '여름', '가을'] },
    sweetPotato: { name: '고구마', seedPrice: 20, baseSellPrice: 50, growthTime: 5, season: ['여름', '가을'] },
    tomato: { name: '토마토', seedPrice: 18, baseSellPrice: 45, growthTime: 4, season: ['여름'] },
    blueberry: { name: '블루베리', seedPrice: 22, baseSellPrice: 55, growthTime: 6, season: ['여름'] },
    cabbage: { name: '배추', seedPrice: 25, baseSellPrice: 60, growthTime: 6, season: ['가을'] },
    lettuce: { name: '상추', seedPrice: 10, baseSellPrice: 28, growthTime: 2, season: ['봄', '가을'] },
    watermelon: { name: '수박', seedPrice: 30, baseSellPrice: 80, growthTime: 7, season: ['여름'] },
    pumpkin: { name: '호박', seedPrice: 28, baseSellPrice: 70, growthTime: 6, season: ['가을'] },
    greenOnion: { name: '파', seedPrice: 8, baseSellPrice: 20, growthTime: 2, season: ['봄', '여름', '가을'] },
    kale: { name: '케일', seedPrice: 15, baseSellPrice: 40, growthTime: 3, season: ['가을'] },
    garlic: { name: '마늘', seedPrice: 18, baseSellPrice: 45, growthTime: 4, season: ['봄'] },
    pepper: { name: '고추', seedPrice: 20, baseSellPrice: 50, growthTime: 5, season: ['여름'] },
    corn: { name: '옥수수', seedPrice: 25, baseSellPrice: 65, growthTime: 6, season: ['여름'] },
    wheat: { name: '밀', seedPrice: 8, baseSellPrice: 25, growthTime: 2, season: ['봄', '여름'] },
};

const animalsData = {
    chicken: { name: '닭', price: 100, produce: 'egg', produceTime: 1, baseSellPrice: 10, lastFedDay: 0 },
    cow: { name: '소', price: 500, produce: 'milk', produceTime: 3, baseSellPrice: 50, lastFedDay: 0 },
    sheep: { name: '양', price: 300, produce: 'wool', produceTime: 2, baseSellPrice: 30, lastFedDay: 0 },
};

// 주식 데이터
const stocksData = {
    techCorp: { name: '테크기업', basePrice: 1000, currentPrice: 1000 },
    farmGoods: { name: '농산물유통', basePrice: 500, currentPrice: 500 },
    miningInc: { name: '광산회사', basePrice: 750, currentPrice: 750 },
    energyCo: { name: '에너지회사', basePrice: 1200, currentPrice: 1200 },
    healthCare: { name: '헬스케어', basePrice: 800, currentPrice: 800 },
};

// 상점 아이템 데이터
const shopItems = {
    seeds: {
        carrotSeed: { name: '당근 씨앗', basePrice: 10, type: 'seed', crop: 'carrot' },
        potatoSeed: { name: '감자 씨앗', basePrice: 12, type: 'seed', crop: 'potato' },
        beetSeed: { name: '비트 씨앗', basePrice: 15, type: 'seed', crop: 'beet' },
        sweetPotatoSeed: { name: '고구마 씨앗', basePrice: 20, type: 'seed', crop: 'sweetPotato' },
        tomatoSeed: { name: '토마토 씨앗', basePrice: 18, type: 'seed', crop: 'tomato' },
        blueberrySeed: { name: '블루베리 씨앗', basePrice: 22, type: 'seed', crop: 'blueberry' },
        cabbageSeed: { name: '배추 씨앗', basePrice: 25, type: 'seed', crop: 'cabbage' },
        lettuceSeed: { name: '상추 씨앗', basePrice: 10, type: 'seed', crop: 'lettuce' },
        watermelonSeed: { name: '수박 씨앗', basePrice: 30, type: 'seed', crop: 'watermelon' },
        pumpkinSeed: { name: '호박 씨앗', basePrice: 28, type: 'seed', crop: 'pumpkin' },
        greenOnionSeed: { name: '파 씨앗', basePrice: 8, type: 'seed', crop: 'greenOnion' },
        kaleSeed: { name: '케일 씨앗', basePrice: 15, type: 'seed', crop: 'kale' },
        garlicSeed: { name: '마늘 씨앗', basePrice: 18, type: 'seed', crop: 'garlic' },
        pepperSeed: { name: '고추 씨앗', basePrice: 20, type: 'seed', crop: 'pepper' },
        cornSeed: { name: '옥수수 씨앗', basePrice: 25, type: 'seed', crop: 'corn' },
        wheatSeed: { name: '밀 씨앗', basePrice: 8, type: 'seed', crop: 'wheat' },
    },
    tools: {
        hoe: { name: '괭이', level: 1, range: 1, upgradeCost: 50, type: 'tool' },
        wateringCan: { name: '물뿌리개', level: 1, range: 1, upgradeCost: 70, type: 'tool' },
        shovel: { name: '삽', level: 1, range: 1, upgradeCost: 60, type: 'tool' },
        hand: { name: '손', level: 1, range: 1, upgradeCost: 50, type: 'tool' },
        basket: { name: '바구니', level: 1, range: 1, upgradeCost: 0, type: 'tool' }, // 채집 도구
        bucket: { name: '양동이', level: 1, range: 1, upgradeCost: 0, type: 'tool' }, // 채집 도구
        scissors: { name: '가위', level: 1, range: 1, upgradeCost: 0, type: 'tool' }, // 채집 도구
        planter: { name: '파종기', level: 1, range: 1, upgradeCost: 100, type: 'tool' }, // 여러 씨앗 심기 도구
        hammer: { name: '망치', level: 1, range: 1, upgradeCost: 0, type: 'tool' }, // 건물 철거 도구
    },
    animals: {
        chicken: { name: '닭', price: 100, type: 'animal', animalType: 'chicken' },
        cow: { name: '소', price: 500, type: 'animal', animalType: 'cow' },
        sheep: { name: '양', price: 300, type: 'animal', animalType: 'sheep' },
    },
    buildings: {
        coop: { name: '닭장', price: 200, type: 'building', size: { width: 2, height: 2 }, capacity: 10, animalType: ['chicken'] },
        barn: { name: '외양간', price: 500, type: 'building', size: { width: 3, height: 3 }, capacity: 10, animalType: ['cow', 'sheep'] },
        greenhouse: { name: '온실', price: 10000, type: 'building', size: { width: 5, height: 5 }, requiresLand: true },
    },
    animalFood: {
        basicFeed: { name: '기본 사료', price: 10, type: 'animalFood', hungerRestore: 1 },
        premiumFeed: { name: '고급 사료', price: 30, type: 'animalFood', hungerRestore: 3 },
    }
};

// ====================================================================================================
// 2. DOM 요소 캐싱
// ====================================================================================================

const goldCounter = document.getElementById('gold-counter');
const dayCounter = document.getElementById('day-counter');
const seasonDisplay = document.getElementById('season-display');
const inventoryList = document.getElementById('inventory-list');
const logList = document.getElementById('log-list');
const farmGridElement = document.getElementById('farm-grid');
const nextDayBtn = document.getElementById('next-day-btn');
const shopBtn = document.getElementById('shop-btn');
const homeBtn = document.getElementById('home-btn');
const inventoryBtn = document.getElementById('inventory-btn');
const shopModal = document.getElementById('shop-modal');
const inventoryModal = document.getElementById('inventory-modal');
const closeModalBtn = shopModal.querySelector('.close-btn');
const closeInventoryModalBtn = document.getElementById('close-inventory-modal');
const seedShopList = document.getElementById('seed-shop-list');
const toolBtns = document.querySelectorAll('.tool-btn');
const selectedToolDisplay = document.getElementById('selected-tool');
const locationTitle = document.getElementById('location-title');
const homeScreen = document.getElementById('home-screen');

const shopTabs = document.querySelectorAll('.shop-tabs .tab-link');
const tabContents = document.querySelectorAll('.tab-content');

const realEstateGridElement = document.getElementById('real-estate-grid');
const selectedLandPriceDisplay = document.getElementById('selected-land-price');
const buyLandBtn = document.getElementById('buy-land-btn');

const toolShopList = document.getElementById('tool-shop-list');
const animalShopList = document.getElementById('animal-shop-list');
const buildingShopList = document.getElementById('building-shop-list');
const animalFoodShopList = document.getElementById('animal-food-shop-list');

let selectedLandCell = null; // 부동산에서 선택된 땅
let selectedBuilding = null; // 건축에서 선택된 건물

const buildModeBtn = document.getElementById('build-mode-btn');
let isBuildMode = false; // 건물 설치 모드 여부

const homeLevelDisplay = document.getElementById('home-level');
const homeUpgradeCostDisplay = document.getElementById('home-upgrade-cost');
const upgradeHomeBtn = document.getElementById('upgrade-home-btn');

// ====================================================================================================
// 3. 게임 초기화 함수
// ====================================================================================================

function initGame() {
    // 농장 격자 초기화
    for (let i = 0; i < GRID_SIZE; i++) {
        farmGrid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            const distance = Math.sqrt(i * i + j * j);
            const basePrice = 50;
            const price = Math.round(basePrice * (1 + distance * 0.1));
            farmGrid[i][j] = { 
                state: 'untilled', 
                crop: null, 
                watered: false, 
                growthStage: 0, 
                plantedDay: 0, 
                isOwned: false, 
                basePrice: price, 
                currentPrice: price 
            };
        }
    }

    // 초기 2x2 땅을 경작 가능한 상태로 설정
    for (let i = 0; i < INITIAL_PLAYABLE_AREA; i++) {
        for (let j = 0; j < INITIAL_PLAYABLE_AREA; j++) {
            farmGrid[i][j].state = 'tilled'; // 시작부터 경작된 상태로
            farmGrid[i][j].isOwned = true; // 초기 땅은 소유된 상태
        }
    }

    // 초기 인벤토리 설정 (예: 씨앗 몇 개)
    player.inventory.carrotSeed = 5;
    player.inventory.potatoSeed = 5;

    updateUI();
    renderFarmGrid();
    updatePrices(); // 게임 시작 시 초기 가격 설정
    addLog('게임 시작! 농장을 관리하여 1000 골드를 모으세요.');
}

// ====================================================================================================
// 4. UI 업데이트 함수
// ====================================================================================================

function updateUI() {
    goldCounter.textContent = player.gold;
    dayCounter.textContent = player.day;
    seasonDisplay.textContent = player.season;

    // 인벤토리 업데이트
    inventoryList.innerHTML = '';
    for (const item in player.inventory) {
        if (player.inventory[item] > 0) {
            const li = document.createElement('li');
            let itemName = item;
            if (item.endsWith('Seed')) {
                itemName = shopItems.seeds[item]?.name;
            } else if (animalsData.chicken.produce === item) {
                itemName = '달걀';
            } else if (animalsData.cow.produce === item) {
                itemName = '우유';
            } else if (animalsData.sheep.produce === item) {
                itemName = '양털';
            } else if (shopItems.animalFood[item]) {
                itemName = shopItems.animalFood[item].name;
            }
            li.textContent = `${itemName}: ${player.inventory[item]}`;
            // 씨앗 선택 버튼 추가
            if (item.endsWith('Seed')) {
                const selectBtn = document.createElement('button');
                selectBtn.textContent = '선택';
                selectBtn.onclick = () => selectSeed(item); // item 자체를 넘기도록 수정
                li.appendChild(selectBtn);
            } else if (shopItems.animalFood[item]) {
                const feedBtn = document.createElement('button');
                feedBtn.textContent = '먹이 주기';
                feedBtn.onclick = () => feedAnimal(item); // 먹이 주기 함수 호출
                li.appendChild(feedBtn);
            } else if (Object.values(animalsData).some(animal => animal.produce === item)) {
                const sellBtn = document.createElement('button');
                sellBtn.textContent = '판매';
                sellBtn.onclick = () => sellItem(item);
                li.appendChild(sellBtn);
            }
            inventoryList.appendChild(li);
        }
    }

    // 건물 인벤토리 업데이트
    for (const buildingKey in player.buildings) {
        if (player.buildings[buildingKey] > 0) {
            const li = document.createElement('li');
            const building = shopItems.buildings[buildingKey];
            const buildingName = building?.name;
            let buildingInfo = `${buildingName}: ${player.buildings[buildingKey]}`;

            if (Array.isArray(building.animalType)) {
                let animalCount = 0;
                building.animalType.forEach(type => {
                    animalCount += player.animals && player.animals[type] ? player.animals[type].length : 0;
                });
                const capacity = building.capacity * player.buildings[buildingKey];
                buildingInfo += ` (${animalCount}/${capacity})`;
            }

            li.textContent = buildingInfo;

            const placeBtn = document.createElement('button');
            placeBtn.textContent = '설치';
            placeBtn.onclick = () => selectBuildingForPlacement(buildingKey);
            li.appendChild(placeBtn);
            inventoryList.appendChild(li);
        }
    }

    // 선택된 도구 표시
    selectedToolDisplay.textContent = player.selectedTool ? shopItems.tools[player.selectedTool]?.name || player.selectedTool : '없음';

    // 도구 버튼 활성화/비활성화 및 스타일
    toolBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === player.selectedTool) {
            btn.classList.add('active');
        }
    });

    // 집 업그레이드 정보 업데이트
    homeLevelDisplay.textContent = player.homeLevel;
    homeUpgradeCostDisplay.textContent = player.homeUpgradeCost;
    upgradeHomeBtn.disabled = player.gold < player.homeUpgradeCost || player.homeLevel >= 10; // 최대 레벨 10으로 가정
}

function addLog(message) {
    const li = document.createElement('li');
    li.textContent = `[${player.day}일] ${message}`;
    logList.prepend(li); // 최신 로그가 위로 오도록
    if (logList.children.length > 6) {
        logList.removeChild(logList.lastChild);
    }
}

function renderFarmGrid() {
    farmGridElement.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = i;
            cell.dataset.col = j;

            const cellData = farmGrid[i][j];
            cell.classList.add(cellData.state);

            // 작물 이미지/텍스트 표시 (간단하게 텍스트로)
            if (cellData.crop) {
                let cropDisplay = '';
                if (cellData.state === 'planted') {
                    cropDisplay = `${cropsData[cellData.crop].name} (${cellData.growthStage}/${cropsData[cellData.crop].growthTime})`;
                } else if (cellData.state === 'harvestable') {
                    cropDisplay = `${cropsData[cellData.crop].name} (수확 가능)`;
                } else if (cellData.state === 'withered') {
                    cropDisplay = `${cropsData[cellData.crop].name} (시듦)`;
                }
                cell.textContent = cropDisplay;
            } else if (cellData.state === 'building' && cellData.building) {
                cell.textContent = shopItems.buildings[cellData.building].name;
            }

            // 물 준 상태 표시
            if (cellData.watered) {
                cell.classList.add('watered');
            }

            cell.addEventListener('click', handleFarmCellClick);
            farmGridElement.appendChild(cell);
        }
    }
}

// ====================================================================================================
// 5. 게임 로직 함수
// ====================================================================================================

function nextDay() {
    player.day++;

    // 계절 업데이트 (예: 30일마다 계절 변경)
    if (player.day % 30 === 1) { // 1일, 31일, 61일...
        const seasons = ['봄', '여름', '가을', '겨울'];
        const currentSeasonIndex = seasons.indexOf(player.season);
        player.season = seasons[(currentSeasonIndex + 1) % seasons.length];
        addLog(`${player.season}이(가) 되었습니다.`);
    }

    updatePrices(); // 매일 가격 업데이트

    // 동물 부산물 생산
    if (player.animals) {
        for (const animalType in player.animals) {
            player.animals[animalType].forEach(animal => {
                const animalData = animalsData[animal.type];
                // 먹이 안주면 이틀 후 죽음
                if (player.day - animal.lastFedDay > 2) {
                    // 동물 제거 로직
                    const animalIndex = player.animals[animalType].indexOf(animal);
                    if (animalIndex > -1) {
                        player.animals[animalType].splice(animalIndex, 1);
                    }
                    addLog(`${animalData.name}이(가) 먹이를 먹지 못해 죽었습니다.`);
                    return; // 죽은 동물은 부산물 생산 건너뛰기
                }

                if (player.day - animal.lastProduceDay >= animalData.produceTime) {
                    const produceItem = animalData.produce;
                    if (player.inventory[produceItem]) {
                        player.inventory[produceItem]++;
                    } else {
                        player.inventory[produceItem] = 1;
                    }
                    animal.lastProduceDay = player.day;
                    addLog(`${animalData.name}이(가) ${produceItem}을(를) 생산했습니다.`);
                }
            });
        }
    }

    // 작물 성장 및 물 주기 상태 처리
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = farmGrid[i][j];
            if (cell.state === 'planted') {
                if (cell.watered) {
                    cell.growthStage++;
                    addLog(`${cropsData[cell.crop].name}이(가) 자랐습니다. (${cell.growthStage}/${cropsData[cell.crop].growthTime})`);
                    if (cell.growthStage >= cropsData[cell.crop].growthTime) {
                        cell.state = 'harvestable';
                        addLog(`${cropsData[cell.crop].name}이(가) 수확 가능합니다!`);
                    }
                    cell.watered = false; // 물 준 상태 초기화
                } else {
                    // 물을 주지 않으면 시들기 시작 (2일 후 죽음)
                    if (player.day - cell.plantedDay > 1 && !cell.watered) { // 심은 다음날부터 물 안주면
                        cell.state = 'withered'; // 시든 상태 추가 (나중에 삽으로 제거)
                        addLog(`${cropsData[cell.crop].name}이(가 시들었습니다. 삽으로 제거하세요.`);
                        cell.crop = null;
                    }
                }
            } else if (cell.state === 'tilled' && cell.watered) {
                cell.watered = false; // 경작된 땅도 하루 지나면 물 마름
            }
        }
    }

    updateUI();
    renderFarmGrid();
    addLog('하루가 지났습니다.');

    
}

function upgradeHome() {
    if (player.gold >= player.homeUpgradeCost && player.homeLevel < 10) {
        player.gold -= player.homeUpgradeCost;
        player.homeLevel++;
        player.homeUpgradeCost *= 2; // 비용 2배 증가
        addLog(`집이 Lv.${player.homeLevel}로 업그레이드되었습니다!`);
        updateUI();

        if (player.homeLevel >= 10) {
            alert('축하합니다! 집을 10레벨까지 강화하여 게임 엔딩을 보았습니다!');
            // 게임 종료 관련 버튼 비활성화
            nextDayBtn.disabled = true;
            shopBtn.disabled = true;
        }
    } else if (player.homeLevel >= 10) {
        addLog('집은 더 이상 업그레이드할 수 없습니다.');
    } else {
        addLog('골드가 부족하여 집을 업그레이드할 수 없습니다.');
    }
}

function updatePrices() {
    for (const cropKey in cropsData) {
        const crop = cropsData[cropKey];
        const change = (Math.random() * 0.6 - 0.3); // -30% ~ +30%
        let newPrice = crop.baseSellPrice * (1 + change);
        newPrice = Math.max(1, Math.round(newPrice)); // 최소 1골드, 반올림
        crop.currentSellPrice = newPrice;

        // 씨앗 가격은 수확물 가격의 1/3
        const seedItem = shopItems.seeds[`${cropKey}Seed`];
        if (seedItem) {
            seedItem.price = Math.max(1, Math.round(newPrice / 3));
        }
    }

    for (const animalKey in animalsData) {
        const animal = animalsData[animalKey];
        const change = (Math.random() * 0.6 - 0.3); // -30% ~ +30%
        let newPrice = animal.baseSellPrice * (1 + change);
        newPrice = Math.max(1, Math.round(newPrice));
        animal.currentSellPrice = newPrice;
    }

    // 부동산 가격 변동
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = farmGrid[i][j];
            if (!cell.isOwned) {
                const change = (Math.random() * 0.4 - 0.2); // -20% ~ +20%
                let newPrice = cell.basePrice * (1 + change);
                cell.currentPrice = Math.max(1, Math.round(newPrice));
            }
        }
    }

    // 주식 가격 변동
    for (const stockKey in stocksData) {
        const stock = stocksData[stockKey];
        const change = (Math.random() * 0.2 - 0.1); // -10% ~ +10%
        let newPrice = stock.currentPrice * (1 + change);
        stock.currentPrice = Math.max(1, Math.round(newPrice));
    }

    addLog('작물, 부산물, 부동산 및 주식 가격이 변동되었습니다.');
}

function openShop() {
    shopModal.classList.remove('hidden'); // hidden 클래스 제거
    renderShopItems();
}

function closeShop() {
    shopModal.classList.add('hidden'); // hidden 클래스 추가
}

function openInventory() {
    inventoryModal.classList.remove('hidden');
    updateUI(); // 인벤토리 모달을 열 때마다 UI 업데이트
}

function closeInventory() {
    inventoryModal.classList.add('hidden');
}

function renderShopItems() {
    seedShopList.innerHTML = '';
    for (const seedKey in shopItems.seeds) {
        const seed = shopItems.seeds[seedKey];
        const li = document.createElement('li');
        const cropType = seed.crop;
        const seasons = cropsData[cropType].season.join(', ');
        li.innerHTML = `
            <span>${seed.name} (${seasons}) - ${seed.price} G</span>
            <button onclick="buyItem('seed', '${seedKey}')">구매</button>
        `;
        seedShopList.appendChild(li);
    }
}

function renderToolShopItems() {
    toolShopList.innerHTML = '';
    for (const toolKey in shopItems.tools) {
        const tool = shopItems.tools[toolKey];
        if (tool.upgradeCost > 0) { // 업그레이드 가능한 도구만 표시
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${tool.name} (Lv.${tool.level}, 범위: ${tool.range}x${tool.range}) - ${tool.upgradeCost} G</span>
                <button onclick="upgradeTool('${toolKey}')" ${player.gold < tool.upgradeCost || tool.level >= 10 ? 'disabled' : ''}>강화</button>
            `;
            toolShopList.appendChild(li);
        }
    }
}

function renderAnimalShopItems() {
    animalShopList.innerHTML = '';
    for (const animalKey in shopItems.animals) {
        const animal = shopItems.animals[animalKey];
        const requiredBuilding = Object.values(shopItems.buildings).find(b => b.animalType && b.animalType.includes(animal.animalType));
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${animal.name} - ${animal.price} G (필요: ${requiredBuilding?.name || '없음'})</span>
            <button onclick="buyItem('animal', '${animalKey}')" ${player.gold < animal.price ? 'disabled' : ''}>구매</button>
        `;
        animalShopList.appendChild(li);
    }
}

function renderBuildingShopItems() {
    buildingShopList.innerHTML = '';
    for (const buildingKey in shopItems.buildings) {
        const building = shopItems.buildings[buildingKey];
        const li = document.createElement('li');
        const isDisabled = player.gold < building.price;
        console.log(`Building: ${building.name}, Price: ${building.price}, Player Gold: ${player.gold}, Disabled: ${isDisabled}`);
        li.innerHTML = `
            <span>${building.name} - ${building.price} G</span>
            <button onclick="buyItem('building', '${buildingKey}')" ${isDisabled ? 'disabled' : ''}>구매</button>
        `;
        buildingShopList.appendChild(li);
    }
}

function renderAnimalFoodShopItems() {
    animalFoodShopList.innerHTML = '';
    for (const foodKey in shopItems.animalFood) {
        const food = shopItems.animalFood[foodKey];
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${food.name} - ${food.price} G</span>
            <button onclick="buyItem('animalFood', '${foodKey}')" ${player.gold < food.price ? 'disabled' : ''}>구매</button>
        `;
        animalFoodShopList.appendChild(li);
    }
}

function renderStockMarket() {
    const stockMarketList = document.getElementById('stock-market-list');
    const myStocksList = document.getElementById('my-stocks-list');

    stockMarketList.innerHTML = '';
    myStocksList.innerHTML = '';

    // 주식 시장 목록 렌더링
    for (const stockKey in stocksData) {
        const stock = stocksData[stockKey];
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${stock.name}: ${stock.currentPrice} G</span>
            <button onclick="buyStock('${stockKey}')" ${player.gold < stock.currentPrice ? 'disabled' : ''}>구매</button>
        `;
        stockMarketList.appendChild(li);
    }

    // 내 주식 목록 렌더링
    for (const stockKey in player.stocks) {
        if (player.stocks[stockKey] > 0) {
            const stock = stocksData[stockKey];
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${stock.name}: ${player.stocks[stockKey]} 주 (현재 가치: ${stock.currentPrice * player.stocks[stockKey]} G)</span>
                <button onclick="sellStock('${stockKey}')">판매</button>
            `;
            myStocksList.appendChild(li);
        }
    }
}

function buyItem(type, itemKey) {
    let itemData;
    let price;
    let itemName;

    if (type === 'seed') {
        itemData = shopItems.seeds[itemKey];
        price = itemData.price;
        itemName = itemData.name;
    } else if (type === 'animal') {
        itemData = shopItems.animals[itemKey];
        price = itemData.price;
        itemName = itemData.name;
    } else if (type === 'building') {
        itemData = shopItems.buildings[itemKey];
        price = itemData.price;
        itemName = itemData.name;
    } else if (type === 'animalFood') {
        itemData = shopItems.animalFood[itemKey];
        price = itemData.price;
        itemName = itemData.name;
    } else {
        addLog('알 수 없는 아이템 타입입니다.');
        return;
    }

    if (player.gold >= price) {
        player.gold -= price;
        if (type === 'building') {
            if (itemKey === 'greenhouse') {
                player.hasGreenhouse = true;
            }
            if (player.buildings[itemKey]) {
                player.buildings[itemKey]++;
            } else {
                player.buildings[itemKey] = 1;
            }
        } else if (type === 'animal') {
            const animalType = itemData.animalType; // chicken, cow, sheep
            const buildingKey = Object.keys(shopItems.buildings).find(key => shopItems.buildings[key].animalType && shopItems.buildings[key].animalType.includes(animalType));

            if (!buildingKey || !player.buildings[buildingKey] || player.buildings[buildingKey] < 1) {
                const requiredBuilding = Object.values(shopItems.buildings).find(b => b.animalType === animalType);
                addLog(`${itemName}을(를) 키울 ${requiredBuilding?.name || '건물'}이(가) 없습니다.`);
                player.gold += price; // 환불
                return;
            }

            const animalCount = player.animals && player.animals[animalType] ? player.animals[animalType].length : 0;
            const capacity = shopItems.buildings[buildingKey].capacity * player.buildings[buildingKey];

            if (animalCount >= capacity) {
                addLog(`${shopItems.buildings[buildingKey].name}이(가) 꽉 찼습니다.`);
                player.gold += price; // 환불
                return;
            }

            if (!player.animals) {
                player.animals = {};
            }
            if (!player.animals[animalType]) {
                player.animals[animalType] = [];
            }
            player.animals[animalType].push({ type: animalType, lastFedDay: player.day, lastProduceDay: player.day });
        } else {
            if (player.inventory[itemKey]) {
                player.inventory[itemKey]++;
            } else {
                player.inventory[itemKey] = 1;
            }
        }
        addLog(`${itemName}을(를) ${price} G에 구매했습니다.`);
        updateUI();
        renderShopItems(); // 씨앗 상점 업데이트
        renderAnimalShopItems(); // 동물 상점 업데이트
        renderBuildingShopItems(); // 건물 상점 업데이트
        renderAnimalFoodShopItems(); // 동물 사료 상점 업데이트
    } else {
        addLog('골드가 부족합니다.');
    }
}

function sellItem(itemKey) {
    if (player.inventory[itemKey] && player.inventory[itemKey] > 0) {
        const animal = Object.values(animalsData).find(a => a.produce === itemKey);
        if (animal) {
            const sellPrice = animal.currentSellPrice;
            player.gold += sellPrice;
            player.inventory[itemKey]--;
            addLog(`${itemKey}을(를) ${sellPrice} G에 판매했습니다.`);
            updateUI();
        } else {
            addLog('판매할 수 없는 아이템입니다.');
        }
    } else {
        addLog('판매할 아이템이 없습니다.');
    }
}

function buyStock(stockKey) {
    const stock = stocksData[stockKey];
    if (player.gold >= stock.currentPrice) {
        player.gold -= stock.currentPrice;
        if (player.stocks[stockKey]) {
            player.stocks[stockKey]++;
        } else {
            player.stocks[stockKey] = 1;
        }
        addLog(`${stock.name} 주식 1주를 ${stock.currentPrice} G에 구매했습니다.`);
        updateUI();
        renderStockMarket();
    } else {
        addLog('골드가 부족하여 주식을 구매할 수 없습니다.');
    }
}

function sellStock(stockKey) {
    if (player.stocks[stockKey] && player.stocks[stockKey] > 0) {
        const stock = stocksData[stockKey];
        player.gold += stock.currentPrice;
        player.stocks[stockKey]--;
        addLog(`${stock.name} 주식 1주를 ${stock.currentPrice} G에 판매했습니다.`);
        updateUI();
        renderStockMarket();
    } else {
        addLog('판매할 주식이 없습니다.');
    }
}

function upgradeTool(toolKey) {
    const tool = shopItems.tools[toolKey];
    if (tool && player.gold >= tool.upgradeCost && tool.level < 10) {
        player.gold -= tool.upgradeCost;
        tool.level++;
        tool.range++;
        tool.upgradeCost *= 2; // 비용 2배 증가
        addLog(`${tool.name}을(를) Lv.${tool.level}로 강화했습니다!`);
        updateUI();
        renderToolShopItems();
    } else if (tool.level >= 10) {
        addLog(`${tool.name}은(는) 더 이상 강화할 수 없습니다.`);
    } else {
        addLog(`골드가 부족하여 ${tool.name}을(를) 강화할 수 없습니다.`);
    }
}

function renderRealEstateGrid() {
    realEstateGridElement.innerHTML = '';
    realEstateGridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;
    realEstateGridElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, 40px)`;

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = i;
            cell.dataset.col = j;

            const cellData = farmGrid[i][j];
            if (cellData.isOwned) {
                cell.classList.add('owned');
                cell.textContent = '소유';
            } else {
                const price = cellData.currentPrice;
                cell.dataset.price = price;
                cell.textContent = `${price} G`;
                cell.addEventListener('click', handleRealEstateCellClick);
            }

            realEstateGridElement.appendChild(cell);
        }
    }
}

function handleRealEstateCellClick(event) {
    if (selectedLandCell) {
        selectedLandCell.classList.remove('selected');
    }
    selectedLandCell = event.target;
    selectedLandCell.classList.add('selected');
    selectedLandPriceDisplay.textContent = selectedLandCell.dataset.price;
    buyLandBtn.disabled = false;
}

function buyLand() {
    if (!selectedLandCell) {
        addLog('구매할 땅을 선택해주세요.');
        return;
    }

    const row = parseInt(selectedLandCell.dataset.row);
    const col = parseInt(selectedLandCell.dataset.col);
    const price = farmGrid[row][col].currentPrice;

    if (player.gold >= price) {
        player.gold -= price;
        farmGrid[row][col].isOwned = true;
        farmGrid[row][col].state = 'tilled';
        addLog(`(${row}, ${col}) 땅을 ${price} G에 구매했습니다.`);
        selectedLandCell = null;
        selectedLandPriceDisplay.textContent = '0';
        buyLandBtn.disabled = true;
        updateUI();
        renderFarmGrid();
        renderRealEstateGrid();
    } else {
        addLog('골드가 부족하여 땅을 구매할 수 없습니다.');
    }
}

function openTab(tabName) {
    tabContents.forEach(tabContent => {
        tabContent.classList.add('hidden');
    });
    shopTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    document.querySelector(`.tab-link[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'realEstate') {
        renderRealEstateGrid();
    } else if (tabName === 'tools') {
        renderToolShopItems();
    } else if (tabName === 'animals') {
        renderAnimalShopItems();
    } else if (tabName === 'buildings') {
        renderBuildingShopItems();
    } else if (tabName === 'animalFood') {
        renderAnimalFoodShopItems();
    } else if (tabName === 'stocks') {
        renderStockMarket();
    }
}


    

function feedAnimal(foodKey) {
    if (player.inventory[foodKey] && player.inventory[foodKey] > 0) {
        let fedCount = 0;
        for (const animalType in player.animals) {
            player.animals[animalType].forEach(animal => {
                if (player.day - animal.lastFedDay > 0) { // 먹이를 줄 수 있는 동물만
                    animal.lastFedDay = player.day;
                    fedCount++;
                }
            });
        }
        if (fedCount > 0) {
            player.inventory[foodKey]--;
            addLog(`${fedCount}마리의 동물에게 ${shopItems.animalFood[foodKey].name}을(를) 주었습니다.`);
        } else {
            addLog('먹이를 줄 동물이 없습니다.');
        }
    } else {
        addLog('해당 먹이가 부족합니다.');
    }
    updateUI();
}

function selectTool(toolName) {
    player.selectedTool = toolName;
    player.selectedSeed = null; // 도구 선택 시 씨앗 선택 해제
    isBuildMode = false; // 도구 선택 시 건물 설치 모드 해제
    addLog(`${shopItems.tools[toolName]?.name || toolName}을(를) 선택했습니다.`);
    updateUI();
}

function selectSeed(seedKey) {
    player.selectedSeed = seedKey; // seedKey는 이제 'carrotSeed' 형태
    player.selectedTool = null; // 씨앗 선택 시 도구 선택 해제
    isBuildMode = false; // 씨앗 선택 시 건물 설치 모드 해제
    addLog(`${cropsData[seedKey.replace('Seed', '')].name} 씨앗을 심을 준비가 되었습니다.`);
    updateUI();
}

function toggleBuildMode() {
    isBuildMode = !isBuildMode;
    player.selectedTool = null; // 건물 설치 모드 시 도구 선택 해제
    player.selectedSeed = null; // 건물 설치 모드 시 씨앗 선택 해제
    if (isBuildMode) {
        addLog('건물 설치 모드: 설치할 건물을 선택하세요.');
    } else {
        addLog('건물 설치 모드 해제.');
    }
    updateUI();
}

function selectBuildingForPlacement(buildingKey) {
    selectedBuilding = buildingKey;
    isBuildMode = true;
    player.selectedTool = null;
    player.selectedSeed = null;
    addLog(`${shopItems.buildings[buildingKey].name}을(를) 설치할 준비가 되었습니다. 농장 격자를 클릭하여 설치하세요.`);
    updateUI();
}

function handleFarmCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = farmGrid[row][col];

    if (isBuildMode && selectedBuilding) {
        const building = shopItems.buildings[selectedBuilding];
        const width = building.size.width;
        const height = building.size.height;

        // 설치 가능 여부 확인
        let canPlace = true;
        for (let r = row; r < row + height; r++) {
            for (let c = col; c < col + width; c++) {
                if (r >= GRID_SIZE || c >= GRID_SIZE || farmGrid[r][c].state !== 'tilled') {
                    canPlace = false;
                    break;
                }
            }
            if (!canPlace) break;
        }

        if (canPlace) {
            // 건물 설치
            for (let r = row; r < row + height; r++) {
                for (let c = col; c < col + width; c++) {
                    farmGrid[r][c].state = 'building';
                    farmGrid[r][c].building = selectedBuilding;
                }
            }
            player.buildings[selectedBuilding]--; // 구매한 건물 수량 감소
            addLog(`${building.name}을(를) (${row}, ${col})에 설치했습니다.`);
            selectedBuilding = null; // 설치 후 선택 해제
            isBuildMode = false; // 설치 후 건물 설치 모드 해제
        } else {
            addLog('건물을 설치할 수 없습니다. 충분히 경작된 빈 땅이 필요합니다.');
        }
    } else if (player.selectedTool === 'hoe') {
        const hoeRange = shopItems.tools.hoe.range;
        for (let r = row; r < Math.min(GRID_SIZE, row + hoeRange); r++) {
            for (let c = col; c < Math.min(GRID_SIZE, col + hoeRange); c++) {
                const targetCell = farmGrid[r][c];
                if (targetCell.state === 'untilled' && targetCell.isOwned) {
                    targetCell.state = 'tilled';
                    addLog(`(${r}, ${c}) 땅을 경작했습니다.`);
                } else if (targetCell.state === 'tilled') {
                    addLog(`(${r}, ${c}) 땅은 이미 경작되어 있습니다.`);
                } else {
                    addLog(`(${r}, ${c}) 땅은 경작할 수 없습니다.`);
                }
            }
        }
    } else if (player.selectedTool === 'watering-can') {
        const wateringCanRange = shopItems.tools.wateringCan.range;
        for (let r = row; r < Math.min(GRID_SIZE, row + wateringCanRange); r++) {
            for (let c = col; c < Math.min(GRID_SIZE, col + wateringCanRange); c++) {
                const targetCell = farmGrid[r][c];
                if (targetCell.state === 'planted' && !targetCell.watered) {
                    targetCell.watered = true;
                    addLog(`(${r}, ${c}) ${cropsData[targetCell.crop].name}에 물을 주었습니다.`);
                } else if (targetCell.state === 'tilled' && !targetCell.watered) {
                    targetCell.watered = true;
                    addLog(`(${r}, ${c}) 경작된 땅에 물을 주었습니다.`);
                } else if (targetCell.watered) {
                    addLog(`(${r}, ${c}) 이미 물을 주었습니다.`);
                } else {
                    addLog(`(${r}, ${c}) 물을 줄 수 없습니다.`);
                }
            }
        }
    } else if (player.selectedTool === 'shovel') {
        // 삽: 시든 작물 제거 또는 경작된 땅 초기화
        if (cell.state === 'withered') {
            cell.state = 'tilled';
            cell.crop = null;
            cell.watered = false;
            cell.growthStage = 0;
            cell.plantedDay = 0;
            addLog(`(${row}, ${col}) 시든 작물을 제거했습니다.`);
        } else if (cell.state === 'tilled') {
            cell.state = 'untilled';
            cell.crop = null;
            cell.watered = false;
            cell.growthStage = 0;
            cell.plantedDay = 0;
            addLog(`(${row}, ${col}) 땅을 초기화했습니다.`);
        } else {
            addLog(`(${row}, ${col}) 삽을 사용할 수 없습니다.`);
        }
    } else if (player.selectedTool === 'hammer') {
        if (cell.state === 'building' && cell.building) {
            const buildingKey = cell.building;
            const building = shopItems.buildings[buildingKey];

            // Find the top-left corner of the building
            let buildingRow = -1, buildingCol = -1;
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (farmGrid[r][c].building === buildingKey) {
                        buildingRow = r;
                        buildingCol = c;
                        break;
                    }
                }
                if (buildingRow !== -1) break;
            }

            const width = building.size.width;
            const height = building.size.height;

            // 건물이 차지하는 모든 셀을 tilled 상태로 변경
            for (let r = buildingRow; r < buildingRow + height; r++) {
                for (let c = buildingCol; c < buildingCol + width; c++) {
                    if (r < GRID_SIZE && c < GRID_SIZE && farmGrid[r][c].building === buildingKey) {
                        farmGrid[r][c].state = 'tilled';
                        farmGrid[r][c].building = null;
                    }
                }
            }

            player.buildings[buildingKey]++; // 철거된 건물은 인벤토리로
            addLog(`${building.name}을(를) 철거했습니다.`);
        } else {
            addLog('철거할 건물이 없습니다.');
        }
    } else if (player.selectedTool === 'hand') {
        const handRange = shopItems.tools.hand.range;
        for (let r = row; r < Math.min(GRID_SIZE, row + handRange); r++) {
            for (let c = col; c < Math.min(GRID_SIZE, col + handRange); c++) {
                const targetCell = farmGrid[r][c];
                if (targetCell.state === 'harvestable') {
                    const harvestedCrop = targetCell.crop;
                    const sellPrice = cropsData[harvestedCrop].currentSellPrice; // 변동된 가격 적용
                    player.gold += sellPrice;
                    addLog(`${cropsData[harvestedCrop].name}을(를) 수확하여 ${sellPrice} G를 얻었습니다.`);
                    
                    // If the cell was part of a greenhouse, return it to the 'building' state
                    if (targetCell.building === 'greenhouse') {
                        targetCell.state = 'building';
                    } else {
                        targetCell.state = 'untilled'; // 수확 후 경작되지 않은 상태로
                    }
                    
                    targetCell.crop = null;
                    targetCell.watered = false;
                    targetCell.growthStage = 0;
                    targetCell.plantedDay = 0;
                } else {
                    addLog(`(${r}, ${c}) 수확할 작물이 없습니다.`);
                }
            }
        }
    } else if (player.selectedTool === 'basket' || player.selectedTool === 'bucket' || player.selectedTool === 'scissors') {
        // 동물 부산물 수확
        if (cell.state === 'building' && cell.building) {
            const buildingData = shopItems.buildings[cell.building];
            if (buildingData.animalType) { // 동물 관련 건물인 경우
                const animalType = buildingData.animalType;
                if (player.animals && player.animals[animalType] && player.animals[animalType].length > 0) {
                    const animal = player.animals[animalType][0]; // 첫 번째 동물로부터 수확 (간단화)
                    const animalInfo = animalsData[animal.type];
                    const produceItem = animalInfo.produce;
                    const sellPrice = animalInfo.currentSellPrice; // 변동된 가격 적용

                    if (player.inventory[player.selectedTool] && player.inventory[player.selectedTool] > 0) { // 해당 도구가 인벤토리에 있어야 함
                        if (player.inventory[produceItem]) {
                            player.inventory[produceItem]++;
                        } else {
                            player.inventory[produceItem] = 1;
                        }
                        player.gold += sellPrice;
                        addLog(`${animalInfo.name}으로부터 ${produceItem}을(를) 수확하여 ${sellPrice} G를 얻었습니다.`);
                        animal.lastProduceDay = player.day; // 수확 후 생산일 업데이트
                    } else {
                        addLog(`${shopItems.tools[player.selectedTool].name}이(가) 없어 수확할 수 없습니다.`);
                    }
                } else {
                    addLog(`${buildingData.name}에 ${animalType}이(가) 없습니다.`);
                }
            } else {
                addLog('이 건물에서는 부산물을 수확할 수 없습니다.');
            }
        } else {
            addLog('이곳에서는 부산물을 수확할 수 없습니다.');
        }
    } else if (player.selectedSeed) {
        const seedKey = player.selectedSeed;
        const cropType = seedKey.replace('Seed', '');
        const planterRange = shopItems.tools.planter.range;

        for (let r = row; r < Math.min(GRID_SIZE, row + planterRange); r++) {
            for (let c = col; c < Math.min(GRID_SIZE, col + planterRange); c++) {
                const targetCell = farmGrid[r][c];
                const isGreenhouseCell = targetCell.building === 'greenhouse';

                // Can plant on tilled soil, or inside a greenhouse (which has 'building' state)
                if ((targetCell.state === 'tilled' || isGreenhouseCell) && !targetCell.crop) {
                    if (player.inventory[seedKey] && player.inventory[seedKey] > 0) {
                        // Can plant if in season OR if inside a greenhouse
                        if (cropsData[cropType].season.includes(player.season) || isGreenhouseCell) {
                            player.inventory[seedKey]--;
                            targetCell.state = 'planted'; // Change state to 'planted'
                            targetCell.crop = cropType;
                            targetCell.watered = false;
                            targetCell.growthStage = 0;
                            targetCell.plantedDay = player.day;
                            addLog(`(${r}, ${c})에 ${cropsData[cropType].name} 씨앗을 심었습니다.`);
                        } else {
                            addLog(`${cropsData[cropType].name}은(는) ${player.season}에 심을 수 없습니다.`);
                        }
                    } else {
                        addLog(`${cropsData[cropType].name} 씨앗이 부족합니다.`);
                    }
                } else if (targetCell.crop) {
                    addLog(`(${r}, ${c})에는 이미 작물이 심어져 있습니다.`);
                } else {
                    addLog(`(${r}, ${c})에는 씨앗을 심을 수 없습니다. 먼저 땅을 경작하세요.`);
                }
            }
        }
    } else {
        addLog('먼저 도구 또는 씨앗을 선택하세요.');
    }

    updateUI();
    renderFarmGrid();
}

// ====================================================================================================
// 6. 이벤트 리스너
// ====================================================================================================

nextDayBtn.addEventListener('click', nextDay);
shopBtn.addEventListener('click', openShop);
inventoryBtn.addEventListener('click', openInventory);
closeModalBtn.addEventListener('click', closeShop);
closeInventoryModalBtn.addEventListener('click', closeInventory);

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
    if (event.target === shopModal) {
        closeShop();
    }
});

// 도구 버튼 이벤트 리스너
toolBtns.forEach(btn => {
    btn.addEventListener('click', () => selectTool(btn.dataset.tool));
});

// 상점 탭 이벤트 리스너
shopTabs.forEach(tab => {
    tab.addEventListener('click', () => openTab(tab.dataset.tab));
});

buyLandBtn.addEventListener('click', buyLand);
buildModeBtn.addEventListener('click', toggleBuildMode);
upgradeHomeBtn.addEventListener('click', upgradeHome);

// 집으로 가기 버튼
homeBtn.addEventListener('click', () => {
    if (farmGridElement.classList.contains('hidden')) {
        // 집 화면에서 농장으로
        farmGridElement.classList.remove('hidden');
        homeScreen.classList.add('hidden');
        locationTitle.textContent = '농장';
        addLog('농장으로 돌아왔습니다.');
    } else {
        // 농장 화면에서 집으로
        farmGridElement.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        locationTitle.textContent = '집';
        addLog('집으로 이동했습니다.');
    }
});

// ====================================================================================================
// 7. 게임 시작
// ====================================================================================================

initGame();
