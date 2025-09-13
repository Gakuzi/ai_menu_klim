import { GoogleGenAI, Type } from "https://esm.run/@google/genai";

const AppState = {
    settings: {},
    menu: [],
    recipes: {},
    shoppingList: [],
    cookedMeals: {}, // { "recipeId": true }
    currentRecipeId: null,
    currentStepIndex: 0,
    timers: {},
    activeScreen: 'settings-screen'
};

const DOM = {
    container: document.getElementById('app-container'),
    screens: document.querySelectorAll('.screen'),
    navButtons: document.querySelectorAll('.nav-btn'),
    settingsForm: document.getElementById('settings-form'),
    peopleValue: document.getElementById('people-value'),
    decrementPeopleBtn: document.getElementById('decrement-people'),
    incrementPeopleBtn: document.getElementById('increment-people'),
    generateButton: document.querySelector('#settings-form button[type="submit"]'),
    menuContent: document.getElementById('menu-content'),
    regenerateMenuBtn: document.getElementById('regenerate-menu'),
    recipesList: document.getElementById('recipes-list'),
    recipeDetailScreen: document.getElementById('recipe-detail-screen'),
    recipeTitleDetail: document.getElementById('recipe-title-detail'),
    recipeStepsContainer: document.getElementById('recipe-steps-container'),
    recipeActions: document.getElementById('recipe-actions'),
    backToRecipesBtn: document.getElementById('back-to-recipes'),
    shoppingListContent: document.getElementById('shopping-list-content'),
    shoppingListSummary: document.getElementById('shopping-list-summary'),
    printContent: document.getElementById('print-content'),
    loaderModal: document.getElementById('loader-modal'),
    toast: document.getElementById('toast-notification'),
    pwaModal: document.getElementById('pwa-modal'),
    closePwaModal: document.getElementById('close-pwa-modal'),
    stepProgressBar: document.getElementById('step-progress-bar'),
    exportRemindersButton: document.getElementById('export-reminders-button'),
    importDataBtn: document.getElementById('import-data-btn'),
    exportDataBtn: document.getElementById('export-data-btn'),
    importFileInput: document.getElementById('import-file-input'),
    sharePlanBtn: document.getElementById('share-plan-btn'),
    scanQrBtn: document.getElementById('scan-qr-btn'),
    qrCodeModal: document.getElementById('qr-code-modal'),
    qrCodeCanvas: document.getElementById('qr-code-canvas'),
    closeQrModal: document.getElementById('close-qr-modal'),
    qrScannerModal: document.getElementById('qr-scanner-modal'),
    qrVideo: document.getElementById('qr-video'),
    closeScannerModal: document.getElementById('close-scanner-modal'),
};

const defaultPlan = {
  menu: [{"dayName":"Понедельник","breakfast":"Овсяная каша с ягодами","snack1":"Яблоко","lunch":{"name":"Куриный суп с лапшой","recipeId":"chickenNoodleSoup"},"snack2":"Йогурт","dinner":{"name":"Гречка с тефтелями","recipeId":"buckwheatMeatballs"}},{"dayName":"Вторник","breakfast":"Сырники со сметаной","snack1":"Банан","lunch":{"name":"Куриный суп (остатки)","recipeId":"chickenNoodleSoup"},"snack2":"Горсть орехов","dinner":{"name":"Картофельное пюре с котлетами","recipeId":"mashedPotatoesCutlets"}},{"dayName":"Среда","breakfast":"Яичница с тостами","snack1":"Апельсин","lunch":{"name":"Гречка с тефтелями (остатки)","recipeId":"buckwheatMeatballs"},"snack2":"Творог","dinner":{"name":"Паста болоньезе","recipeId":"pastaBolognese"}}],
  recipes: {"chickenNoodleSoup":{"name":"Куриный суп с лапшой","isProteinBased":true,"ingredients":[{"name":"Куриное филе","quantity":"300 г"},{"name":"Лапша яичная","quantity":"100 г"},{"name":"Картофель","quantity":"2 шт"},{"name":"Морковь","quantity":"1 шт"},{"name":"Лук репчатый","quantity":"1 шт"}],"steps":[{"title":"Сварить бульон","description":"Отварите куриное филе до готовности, затем выньте и нарежьте."},{"title":"Добавить овощи","description":"Нарежьте картофель, морковь и лук, добавьте в бульон и варите 15 минут.","timer":15},{"title":"Завершение","description":"Добавьте лапшу и варите еще 5-7 минут. Верните курицу в суп."}]},"buckwheatMeatballs":{"name":"Гречка с тефтелями","isProteinBased":true,"ingredients":[{"name":"Гречневая крупа","quantity":"200 г"},{"name":"Фарш (говядина/свинина)","quantity":"400 г"},{"name":"Томатная паста","quantity":"2 ст.л."},{"name":"Лук репчатый","quantity":"1 шт"}],"steps":[{"title":"Приготовить тефтели","description":"Смешайте фарш с мелко нарезанным луком, сформируйте тефтели и обжарьте."},{"title":"Тушение","description":"Добавьте томатную пасту и немного воды, тушите тефтели 20 минут.","timer":20},{"title":"Сварить гречку","description":"Отварите гречку согласно инструкции на упаковке."}]},"mashedPotatoesCutlets":{"name":"Картофельное пюре с котлетами","isProteinBased":true,"ingredients":[{"name":"Картофель","quantity":"1 кг"},{"name":"Молоко","quantity":"150 мл"},{"name":"Фарш","quantity":"500 г"},{"name":"Хлеб","quantity":"2 ломтика"}],"steps":[{"title":"Приготовить котлеты","description":"Смешать фарш с замоченным в молоке хлебом, сформировать котлеты и обжарить с двух сторон."},{"title":"Приготовить пюре","description":"Отварить картофель до готовности, растолочь с горячим молоком и сливочным маслом."}]},"pastaBolognese":{"name":"Паста болоньезе","isProteinBased":true,"ingredients":[{"name":"Паста (спагетти)","quantity":"300 г"},{"name":"Фарш говяжий","quantity":"400 г"},{"name":"Томаты в с/с","quantity":"400 г"},{"name":"Лук","quantity":"1 шт"},{"name":"Чеснок","quantity":"2 зубчика"}],"steps":[{"title":"Приготовить соус","description":"Обжарить лук и чеснок, добавить фарш и готовить до изменения цвета. Добавить томаты и тушить 25 минут.","timer":25},{"title":"Отварить пасту","description":"Отварить пасту до состояния аль денте."}]}},
  shoppingList: [{"id":"chicken-fillet","name":"Куриное филе","quantity":"300 г","category":"Мясо и птица","price":150,"completed":false},{"id":"ground-beef-pork","name":"Фарш (говядина/свинина)","quantity":"400 г","category":"Мясо и птица","price":200,"completed":false},{"id":"ground-beef","name":"Фарш говяжий","quantity":"400 г","category":"Мясо и птица","price":220,"completed":false},{"id":"potatoes","name":"Картофель","quantity":"1.2 кг","category":"Овощи и зелень","price":60,"completed":false},{"id":"carrot","name":"Морковь","quantity":"1 шт","category":"Овощи и зелень","price":10,"completed":false},{"id":"onion","name":"Лук репчатый","quantity":"3 шт","category":"Овощи и зелень","price":15,"completed":false}],
  cookedMeals: {}
};

const alarmSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU9vT18=');
let ai;
let touchStartX = 0;
let touchCurrentX = 0;
let isSwiping = false;
let qrAnimation;

function init() {
    loadStateFromLocalStorage();
    registerEventListeners();
    initializeAI();
    renderApp();
    checkPwaPrompt();
}

function checkPwaPrompt() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && !localStorage.getItem('pwaPromptShown')) {
        setTimeout(() => DOM.pwaModal.classList.add('visible'), 5000);
    }
}

function initializeAI() {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        DOM.generateButton.textContent = "Сгенерировать меню";
    } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        ai = null;
        DOM.generateButton.textContent = "Загрузить план по умолчанию";
        alert("Не удалось инициализировать AI. Убедитесь, что API-ключ настроен в переменных окружения. Будет загружен план по умолчанию.");
    }
}


// --- STATE MANAGEMENT ---
function saveStateToLocalStorage() {
    localStorage.setItem('familyMenuAppState', JSON.stringify(AppState));
}

function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem('familyMenuAppState');
    if (savedState) {
        Object.assign(AppState, JSON.parse(savedState));
        // Ensure cookedMeals exists for older state versions
        if (!AppState.cookedMeals) {
            AppState.cookedMeals = {};
        }
    }
    populateSettingsForm();
}

function updateSettingsFromForm() {
    AppState.settings = {
        people: DOM.peopleValue.textContent,
        days: document.getElementById('days-select').value,
        protein: document.querySelector('input[name="protein"]:checked').value,
        restrictions: Array.from(document.querySelectorAll('input[name="restrictions"]:checked')).map(el => el.value),
        goal: document.querySelector('input[name="goal"]:checked').value,
        allergies: document.getElementById('allergies-input').value,
    };
    saveStateToLocalStorage();
}


// --- NAVIGATION ---
function navigateTo(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) currentScreen.classList.remove('active');
    document.getElementById(screenId).classList.add('active');
    DOM.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === screenId));
    AppState.activeScreen = screenId;
    saveStateToLocalStorage();
}

// --- RENDERING ---
function renderApp() {
    if (!AppState.menu || AppState.menu.length === 0) {
        navigateTo('settings-screen');
    } else {
        renderMenu();
        renderRecipesList();
        renderShoppingList();
        renderPrintView();
        navigateTo(AppState.activeScreen);
    }
}

function populateSettingsForm() {
    const { settings } = AppState;
    if (!settings) return;

    const people = parseInt(settings.people || 3, 10);
    DOM.peopleValue.textContent = people;
    DOM.decrementPeopleBtn.disabled = people <= 1;
    DOM.incrementPeopleBtn.disabled = people >= 6;

    document.getElementById('days-select').value = settings.days || 7;
    document.querySelector(`input[name="protein"][value="${settings.protein || 'chicken'}"]`).checked = true;
    document.querySelectorAll('input[name="restrictions"]').forEach(el => el.checked = (settings.restrictions || ['no-fish', 'no-mushrooms']).includes(el.value));
    document.querySelector(`input[name="goal"][value="${settings.goal || 'balanced'}"]`).checked = true;
    document.getElementById('allergies-input').value = settings.allergies || '';
}

function renderMenu() {
    if (!AppState.menu || AppState.menu.length === 0) {
        DOM.menuContent.innerHTML = `<p>Меню еще не сгенерировано. Перейдите в настройки, чтобы начать.</p>`;
        return;
    }
    const mealTypes = { breakfast: 'Завтрак', snack1: 'Перекус', lunch: 'Обед', snack2: 'Полдник', dinner: 'Ужин' };
    DOM.menuContent.innerHTML = `<div class="day-cards-container">${AppState.menu.map(day => `
        <div class="day-card"><h3>${day.dayName}</h3><ul>${Object.keys(mealTypes).map(mealType => {
            const meal = day[mealType];
            let mealHtml;
            if (typeof meal === 'object' && meal.recipeId) {
                const isLeftover = meal.name.includes('(остатки)');
                const isCooked = AppState.cookedMeals[meal.recipeId];
                mealHtml = `<span class="clickable-meal ${isCooked ? 'cooked' : ''}" data-recipe-id="${meal.recipeId}">${meal.name.replace(' (остатки)', '')} ${isLeftover ? '<span class="leftover-icon">↻</span>' : ''} ${isCooked ? '✓' : ''}</span>`;
            } else { mealHtml = `<span>${meal || '—'}</span>`; }
            return `<li><span class="meal-type-label">${mealTypes[mealType]}</span>${mealHtml}</li>`;
        }).join('')}</ul></div>`).join('')}</div>`;
}

function renderRecipesList() {
    if (Object.keys(AppState.recipes).length === 0) {
        DOM.recipesList.innerHTML = `<p>Нет доступных рецептов. Сгенерируйте меню.</p>`; return;
    }
    DOM.recipesList.innerHTML = Object.entries(AppState.recipes).map(([recipeId, recipe]) => `
        <div class="recipe-card ${AppState.cookedMeals[recipeId] ? 'cooked' : ''}" data-recipe-id="${recipeId}">
            <h3>${recipe.name}</h3>
            <div class="recipe-card-meta">
                <span>${recipe.ingredients.length} ингредиентов</span>
                ${recipe.steps.some(step => step.timer) ? '<span>⏱️ С таймерами</span>' : ''}
                ${recipe.isProteinBased ? '<span>🥣 Основное блюдо</span>' : ''}
            </div>
        </div>`).join('');
}

function renderRecipeDetail(recipeId) {
    AppState.currentRecipeId = recipeId;
    AppState.currentStepIndex = 0;
    const recipe = AppState.recipes[recipeId];
    if (!recipe) return;
    
    DOM.recipeTitleDetail.textContent = recipe.name;

    DOM.recipeStepsContainer.innerHTML = `<div class="recipe-step-wrapper">${recipe.steps.map((step, index) => `
        <div class="recipe-step" data-step-index="${index}">
            <img src="https://placehold.co/600x400/${index % 2 === 0 ? 'D4A373' : '5E7A6E'}/F9F7F4?text=${encodeURIComponent(step.title)}" alt="${step.title}">
            <h4>Шаг ${index + 1}: ${step.title}</h4><p>${step.description}</p>
            ${step.timer ? `<div class="timer-container" data-timer-id="${recipeId}-${index}"><div class="timer-display">00:00</div><div class="timer-controls"><button class="start-btn">Старт</button><button class="pause-btn" disabled>Пауза</button><button class="reset-btn">Сброс</button></div></div>` : ''}
        </div>`).join('')}</div> <div id="ingredients-section-placeholder"></div>`;
    
    updateStepVisibility();
    renderRecipeActions(recipeId);
    navigateTo('recipe-detail-screen');
}

function renderRecipeActions(recipeId) {
    const isCooked = AppState.cookedMeals[recipeId];
    DOM.recipeActions.innerHTML = `<button id="mark-cooked-btn" class="btn-secondary ${isCooked ? 'cooked' : ''}">${isCooked ? 'Отметить как не готовое' : 'Я приготовил(а)'}</button>`;
}

function updateStepVisibility(isNext = true) {
    const wrapper = DOM.recipeStepsContainer.querySelector('.recipe-step-wrapper');
    if (!wrapper) return;

    const steps = wrapper.querySelectorAll('.recipe-step');
    const oldStep = wrapper.querySelector('.recipe-step.active');
    if(oldStep) { oldStep.classList.remove('active'); oldStep.classList.add('exiting'); }
    
    const newStep = steps[AppState.currentStepIndex];
    newStep.classList.add('active');

    DOM.stepProgressBar.style.width = `${((AppState.currentStepIndex + 1) / steps.length) * 100}%`;

    const ingredientsPlaceholder = document.getElementById('ingredients-section-placeholder');
    if (AppState.currentStepIndex === steps.length - 1) {
        ingredientsPlaceholder.innerHTML = getIngredientsHtmlForRecipe(AppState.recipes[AppState.currentRecipeId]);
    } else { ingredientsPlaceholder.innerHTML = ''; }

    initializeTimersForStep(AppState.currentStepIndex);
}

function initializeTimersForStep(stepIndex) {
    const timerContainer = document.querySelector(`.recipe-step[data-step-index="${stepIndex}"] .timer-container`);
    if(timerContainer) {
        const timerId = timerContainer.dataset.timerId;
        const [recipeId, stepIdx] = timerId.split('-');
        const step = AppState.recipes[recipeId]?.steps[stepIdx];

        if (step?.timer && !AppState.timers[timerId]) {
            AppState.timers[timerId] = { duration: step.timer * 60, remaining: step.timer * 60, interval: null, running: false };
        }
        updateTimerDisplay(timerId);
    }
}

function getIngredientsHtmlForRecipe(recipe) {
    const shoppingListItems = AppState.shoppingList.reduce((acc, item) => { acc[item.name.toLowerCase()] = item.completed; return acc; }, {});
    return `<div id="ingredients-section"><h3>Ингредиенты:</h3><ul>${recipe.ingredients.map(ing => {
        const status = shoppingListItems[ing.name.toLowerCase()];
        return `<li>${status === true ? '✅' : status === false ? '❌' : '⚠️'} ${ing.name} - ${ing.quantity}</li>`;
    }).join('')}</ul></div>`;
}

function renderShoppingList() {
    if (AppState.shoppingList.length === 0) {
        DOM.shoppingListContent.innerHTML = `<p>Список покупок пуст.</p>`; DOM.shoppingListSummary.innerHTML = ''; return;
    }
    const categories = AppState.shoppingList.reduce((acc, item) => { (acc[item.category] = acc[item.category] || []).push(item); return acc; }, {});
    const categoryOrder = ["Мясо и птица", "Молочные и яйца", "Овощи и зелень", "Фрукты и орехи", "Крупы и мука", "Хлеб и выпечка", "Прочее"];
    DOM.shoppingListContent.innerHTML = categoryOrder.map(category => categories[category] ? `
        <div class="shopping-category"><h3>${category}</h3>${categories[category].map(item => `
            <div class="shopping-item ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
                <div class="shopping-item-toggle ${item.completed ? 'completed' : ''}"></div>
                <div class="shopping-item-info"><span>${item.name}</span><div class="item-quantity">${item.quantity}</div></div>
            </div>`).join('')}</div>` : '').join('');
    updateShoppingSummary();
}

function updateShoppingSummary() {
    const totalItems = AppState.shoppingList.length;
    const completedItems = AppState.shoppingList.filter(item => item.completed).length;
    const totalCost = AppState.shoppingList.reduce((sum, item) => sum + (item.price || 0), 0);
    DOM.shoppingListSummary.innerHTML = `
        <div class="progress-bar-container"><div id="shopping-progress-bar" style="width: ${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%"></div></div>
        <div id="shopping-summary-text">
            <span>Куплено: ${completedItems} из ${totalItems}</span>
            <span><strong>≈ ${totalCost.toLocaleString('ru-RU')} ₽</strong></span>
        </div>`;
}

function renderPrintView() {
    if (AppState.shoppingList.length === 0) { DOM.printContent.innerHTML = `<p>Список покупок пуст.</p>`; return; }
    const categories = AppState.shoppingList.reduce((acc, item) => { (acc[item.category] = acc[item.category] || []).push(item); return acc; }, {});
    DOM.printContent.innerHTML = `<h1>Список покупок</h1>${Object.keys(categories).map(cat => `<h2>${cat}</h2><ul>${categories[cat].map(item => `<li>${item.name} - ${item.quantity}</li>`).join('')}</ul>`).join('')}<footer>Семейное меню на неделю • Создано с любовью</footer>`;
}

// --- EVENT LISTENERS ---
function registerEventListeners() {
    DOM.navButtons.forEach(button => button.addEventListener('click', () => navigateTo(button.dataset.screen)));
    DOM.settingsForm.addEventListener('submit', e => { e.preventDefault(); updateSettingsFromForm(); handleGeneration(); });
    DOM.decrementPeopleBtn.addEventListener('click', () => updatePeopleCount(-1));
    DOM.incrementPeopleBtn.addEventListener('click', () => updatePeopleCount(1));
    DOM.regenerateMenuBtn.addEventListener('click', () => { if(confirm("Вы уверены? Текущее меню будет удалено.")) { updateSettingsFromForm(); handleGeneration(); } });
    DOM.recipesList.addEventListener('click', e => { const card = e.target.closest('.recipe-card'); if (card) renderRecipeDetail(card.dataset.recipeId); });
    DOM.menuContent.addEventListener('click', e => { const cell = e.target.closest('.clickable-meal'); if(cell?.dataset.recipeId) renderRecipeDetail(cell.dataset.recipeId); });
    DOM.backToRecipesBtn.addEventListener('click', () => navigateTo('recipes-screen'));
    DOM.recipeActions.addEventListener('click', e => { if (e.target.id === 'mark-cooked-btn') toggleCookedStatus(AppState.currentRecipeId); });
    DOM.closePwaModal.addEventListener('click', () => { DOM.pwaModal.classList.remove('visible'); localStorage.setItem('pwaPromptShown', 'true'); });
    DOM.exportRemindersButton.addEventListener('click', exportToReminders);
    DOM.exportDataBtn.addEventListener('click', exportState);
    DOM.importDataBtn.addEventListener('click', () => DOM.importFileInput.click());
    DOM.importFileInput.addEventListener('change', importState);
    DOM.sharePlanBtn.addEventListener('click', sharePlanViaQR);
    DOM.scanQrBtn.addEventListener('click', startQrScanner);
    DOM.closeQrModal.addEventListener('click', () => DOM.qrCodeModal.classList.remove('visible'));
    DOM.closeScannerModal.addEventListener('click', stopQrScanner);

    DOM.recipeStepsContainer.addEventListener('click', handleRecipeStepClick);
    DOM.recipeStepsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    DOM.recipeStepsContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    DOM.recipeStepsContainer.addEventListener('touchend', handleTouchEnd);
    
    DOM.shoppingListContent.addEventListener('click', e => {
        const itemElement = e.target.closest('.shopping-item');
        if(itemElement) {
            const item = AppState.shoppingList.find(i => i.id === itemElement.dataset.itemId);
            if(item) { item.completed = !item.completed; saveStateToLocalStorage(); renderShoppingList(); }
        }
    });
}

function updatePeopleCount(change) {
    let currentValue = parseInt(DOM.peopleValue.textContent, 10);
    const min = 1;
    const max = 6;
    let newValue = currentValue + change;
    
    if (newValue < min || newValue > max) return;

    DOM.peopleValue.textContent = newValue;
    DOM.decrementPeopleBtn.disabled = (newValue === min);
    DOM.incrementPeopleBtn.disabled = (newValue === max);
}

function toggleCookedStatus(recipeId) {
    AppState.cookedMeals[recipeId] = !AppState.cookedMeals[recipeId];
    saveStateToLocalStorage();
    renderRecipeActions(recipeId);
    renderRecipesList(); // Re-render lists to show cooked status
    renderMenu();
}

function handleRecipeStepClick(e) {
    const timerContainer = e.target.closest('.timer-container');
    if (!timerContainer) return;
    const timerId = timerContainer.dataset.timerId;
    if(e.target.classList.contains('start-btn')) startTimer(timerId);
    if(e.target.classList.contains('pause-btn')) pauseTimer(timerId);
    if(e.target.classList.contains('reset-btn')) resetTimer(timerId);
}
function handleTouchStart(e) {
    const stepWrapper = e.target.closest('.recipe-step-wrapper');
    if(!stepWrapper) return;
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
    isSwiping = true;
    stepWrapper.style.transition = 'none';
}
function handleTouchMove(e) {
    if(!isSwiping) return;
    touchCurrentX = e.touches[0].clientX;
    const diff = touchCurrentX - touchStartX;
    const activeStep = document.querySelector('.recipe-step.active');
    if (activeStep) activeStep.style.transform = `translateX(${diff}px)`;
}
function handleTouchEnd() {
    if(!isSwiping) return;
    isSwiping = false;
    const diff = touchCurrentX - touchStartX;
    const swipeThreshold = 50;
    const activeStep = document.querySelector('.recipe-step.active');
    activeStep.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const recipe = AppState.recipes[AppState.currentRecipeId];
    if (diff < -swipeThreshold && AppState.currentStepIndex < recipe.steps.length - 1) {
        AppState.currentStepIndex++; updateStepVisibility(true);
    } else if (diff > swipeThreshold && AppState.currentStepIndex > 0) {
        AppState.currentStepIndex--; updateStepVisibility(false);
    } else { activeStep.style.transform = 'translateX(0)'; }
}

// --- API & GENERATION LOGIC ---
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        menu: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    dayName: { type: Type.STRING },
                    breakfast: { type: Type.STRING },
                    snack1: { type: Type.STRING },
                    lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, recipeId: { type: Type.STRING },},},
                    snack2: { type: Type.STRING },
                    dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, recipeId: { type: Type.STRING },},},
                },
            },
        },
        recipes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING }, name: { type: Type.STRING }, isProteinBased: { type: Type.BOOLEAN },
                    ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, quantity: { type: Type.STRING },},},},
                    steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, timer: { type: Type.INTEGER, nullable: true },},},},
                },
            },
        },
        shoppingList: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING }, name: { type: Type.STRING }, quantity: { type: Type.STRING }, category: { type: Type.STRING }, price: { type: Type.NUMBER },
                },
            },
        },
    },
};

async function handleGeneration() {
    if (!ai) { loadDefaultData(); return; }
    DOM.loaderModal.classList.add('visible');
    try {
        const prompt = createPrompt(AppState.settings);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const data = JSON.parse(response.text);

        // Convert recipes array into an object for easier lookup
        const recipesObject = data.recipes.reduce((acc, recipe) => {
            acc[recipe.id] = recipe;
            return acc;
        }, {});

        AppState.menu = data.menu;
        AppState.recipes = recipesObject;
        AppState.shoppingList = data.shoppingList.map(item => ({...item, completed: false}));
        AppState.cookedMeals = {};
        AppState.timers = {};
        saveStateToLocalStorage();
        renderApp();
        navigateTo('menu-screen');
    } catch (error) { console.error("Error generating menu:", error); alert("Произошла ошибка при генерации меню. Попробуйте снова.");
    } finally { DOM.loaderModal.classList.remove('visible'); }
}

function loadDefaultData() {
    showToast("API ключ не найден. Загружен план по умолчанию.");
    Object.assign(AppState, defaultPlan);
    AppState.shoppingList = AppState.shoppingList.map(item => ({...item, completed: false}));
    AppState.cookedMeals = AppState.cookedMeals || {};
    saveStateToLocalStorage();
    renderApp();
    navigateTo('menu-screen');
}

function createPrompt(settings) {
    const priceReference = `(reference: 7 days for 3 people is ~6872 RUB).`;
    return `You are a professional and warm family meal planning assistant. Your task is to generate a complete meal plan based on user preferences. Provide the output ONLY in a single valid JSON object format, without any markdown formatting. The JSON must have this structure: { "menu": [], "recipes": [], "shoppingList": [] }. User Preferences: - People: ${settings.people} - Days: ${settings.days} - Protein: ${settings.protein} - Restrictions: ${settings.restrictions.join(', ')} - Goal: ${settings.goal} - Allergies: ${settings.allergies || 'None'}. Rules: 1. Menu: Array for ${settings.days} days. Each day object needs: "dayName" (e.g., "Понедельник"), "breakfast", "snack1", "lunch" ({ "name", "recipeId" }), "snack2", "dinner" ({ "name", "recipeId" }). Include 1-2 leftover meals. 2. Recipes: An array of recipe objects. Each recipe must have a unique camelCase "id". Each recipe needs: "id", "name", "isProteinBased" (boolean), "ingredients" (array of { "name", "quantity" }), "steps" (array of { "title", "description", "timer": integer in minutes, optional }). 3. Shopping List: Consolidate all ingredients. Each item needs: "id" (unique kebab-case), "name", "quantity", "category" (from: "Мясо и птица", "Молочные и яйца", "Овощи и зелень", "Фрукты и орехи", "Крупы и мука", "Хлеб и выпечка", "Прочее"), "price" (estimated price in RUB, proportional to people/days ${priceReference}). All text must be in Russian. Generate simple, common recipes suitable for a Russian family, with a cozy and appealing tone.`;
}


// --- UTILITIES ---
function showToast(message) {
    DOM.toast.textContent = message;
    DOM.toast.classList.add('show');
    setTimeout(() => DOM.toast.classList.remove('show'), 3000);
}

// --- SYNC & DATA MANAGEMENT ---
async function sharePlanViaQR() {
    try {
        const jsonString = JSON.stringify(AppState);
        const compressed = pako.deflate(jsonString, { to: 'string' });
        const base64 = btoa(compressed);
        
        await QRCode.toCanvas(DOM.qrCodeCanvas, base64, { errorCorrectionLevel: 'L', width: 256 });
        DOM.qrCodeModal.classList.add('visible');
    } catch (err) {
        console.error('QR Code generation failed', err);
        showToast('Не удалось создать QR-код.');
    }
}

async function startQrScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        DOM.qrVideo.srcObject = stream;
        DOM.qrVideo.play();
        DOM.qrScannerModal.classList.add('visible');
        qrAnimation = requestAnimationFrame(tick);
    } catch (err) {
        console.error("Camera access denied:", err);
        showToast("Не удалось получить доступ к камере.");
    }
}

function stopQrScanner() {
    if (DOM.qrVideo.srcObject) {
        DOM.qrVideo.srcObject.getTracks().forEach(track => track.stop());
        DOM.qrVideo.srcObject = null;
    }
    cancelAnimationFrame(qrAnimation);
    DOM.qrScannerModal.classList.remove('visible');
}

function tick() {
    if (DOM.qrVideo.readyState === DOM.qrVideo.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        canvas.width = DOM.qrVideo.videoWidth;
        canvas.height = DOM.qrVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(DOM.qrVideo, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            stopQrScanner();
            try {
                const compressed = atob(code.data);
                const jsonString = pako.inflate(compressed, { to: 'string' });
                const importedState = JSON.parse(jsonString);
                 if (importedState.settings && importedState.menu && importedState.recipes) {
                    Object.assign(AppState, importedState);
                    saveStateToLocalStorage();
                    populateSettingsForm();
                    initializeAI();
                    renderApp();
                    showToast("План успешно синхронизирован!");
                } else { throw new Error("Invalid data"); }
            } catch (err) {
                console.error("QR data processing error", err);
                showToast("Ошибка: Неверный QR-код.");
            }
            return;
        }
    }
    qrAnimation = requestAnimationFrame(tick);
}

function exportToReminders() {
    const uncompletedItems = AppState.shoppingList.filter(item => !item.completed);
    if (uncompletedItems.length === 0) { showToast("Нет продуктов для экспорта!"); return; }
    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
    let icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FamilyMenuApp//EN'];
    uncompletedItems.forEach(item => { icsContent.push('BEGIN:VTODO', `UID:${now}-${item.id}@familymenu.app`, `DTSTAMP:${now}Z`, `SUMMARY:${item.name} (${item.quantity})`, 'END:VTODO'); });
    icsContent.push('END:VCALENDAR');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
    link.download = 'Shopping-List.ics';
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportState() {
    try {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([JSON.stringify(AppState, null, 2)], { type: 'application/json' }));
        link.download = `family-menu-backup-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast("Данные успешно экспортированы!");
    } catch (error) { showToast("Ошибка при экспорте данных."); }
}

function importState(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.settings && importedState.menu && importedState.recipes) {
                Object.assign(AppState, importedState);
                saveStateToLocalStorage();
                populateSettingsForm();
                initializeAI();
                renderApp();
                showToast("Данные успешно импортированы!");
            } else { throw new Error("Invalid file format"); }
        } catch (error) { showToast("Ошибка: Неверный формат файла."); }
        finally { DOM.importFileInput.value = ''; }
    };
    reader.readAsText(file);
}

// Timer Functions
function startTimer(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer || timer.running) return;
    timer.running = true;
    const controls = document.querySelector(`[data-timer-id="${timerId}"] .timer-controls`);
    if(controls) { controls.querySelector('.start-btn').disabled = true; controls.querySelector('.pause-btn').disabled = false; }
    timer.interval = setInterval(() => {
        timer.remaining--;
        updateTimerDisplay(timerId);
        if (timer.remaining <= 0) {
            clearInterval(timer.interval);
            timer.running = false;
            timer.interval = null;
            showToast("Этап завершён!");
            alarmSound.play().catch(e => console.log("Playback prevented", e));
            if(controls) controls.querySelector('.pause-btn').disabled = true;
        }
    }, 1000);
    saveStateToLocalStorage();
}
function pauseTimer(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer || !timer.running) return;
    clearInterval(timer.interval);
    timer.running = false;
    timer.interval = null;
    const controls = document.querySelector(`[data-timer-id="${timerId}"] .timer-controls`);
    if(controls) { controls.querySelector('.start-btn').disabled = false; controls.querySelector('.pause-btn').disabled = true; }
    saveStateToLocalStorage();
}
function resetTimer(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer) return;
    if (timer.interval) clearInterval(timer.interval);
    timer.running = false;
    timer.remaining = timer.duration;
    updateTimerDisplay(timerId);
    const controls = document.querySelector(`[data-timer-id="${timerId}"] .timer-controls`);
    if(controls) { controls.querySelector('.start-btn').disabled = false; controls.querySelector('.pause-btn').disabled = true; }
    saveStateToLocalStorage();
}
function updateTimerDisplay(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer) return;
    const display = document.querySelector(`[data-timer-id="${timerId}"] .timer-display`);
    if(display) {
        const minutes = Math.floor(timer.remaining / 60).toString().padStart(2, '0');
        const seconds = (timer.remaining % 60).toString().padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
    }
}

document.addEventListener('DOMContentLoaded', init);