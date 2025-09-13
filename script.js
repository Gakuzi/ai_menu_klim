import { GoogleGenAI, Type } from "https://esm.run/@google/genai";

const AppState = {
    apiKey: null,
    settings: {},
    prompts: {
        main: '',
        rules: ''
    },
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
    globalSettingsBtn: document.getElementById('global-settings-btn'),
    screens: document.querySelectorAll('.screen'),
    navButtons: document.querySelectorAll('.nav-btn'),
    settingsForm: document.getElementById('settings-form'),
    peopleValue: document.getElementById('people-value'),
    decrementPeopleBtn: document.getElementById('decrement-people'),
    incrementPeopleBtn: document.getElementById('increment-people'),
    generateAiBtn: document.getElementById('generate-ai-btn'),
    loadDemoBtn: document.getElementById('load-demo-btn'),
    menuContent: document.getElementById('menu-content'),
    recipesList: document.getElementById('recipes-list'),
    recipeDetailScreen: document.getElementById('recipe-detail-screen'),
    recipeTitleDetail: document.getElementById('recipe-title-detail'),
    recipeStepsContainer: document.getElementById('recipe-steps-container'),
    recipeActions: document.getElementById('recipe-actions'),
    backToRecipesBtn: document.getElementById('back-to-recipes'),
    shoppingListContent: document.getElementById('shopping-list-content'),
    shoppingListSummary: document.getElementById('shopping-list-summary'),
    printContent: document.getElementById('print-content'),
    printBtn: document.getElementById('print-btn'),
    loaderModal: document.getElementById('loader-modal'),
    loaderStatus: document.getElementById('loader-status'),
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
    apiKeyInput: document.getElementById('api-key-input'),
    verifyApiKeyBtn: document.getElementById('verify-api-key-btn'),
    aiConnectionStatus: document.getElementById('ai-connection-status'),
    runDiagnosticsBtn: document.getElementById('run-diagnostics-btn'),
    diagnosticsResults: document.getElementById('diagnostics-results'),
    editPromptsBtn: document.getElementById('edit-prompts-btn'),
    promptsModal: document.getElementById('prompts-modal'),
    closePromptsModal: document.getElementById('close-prompts-modal'),
    savePromptsBtn: document.getElementById('save-prompts-btn'),
    resetPromptsBtn: document.getElementById('reset-prompts-btn'),
    promptMainInput: document.getElementById('prompt-main-input'),
    promptRulesInput: document.getElementById('prompt-rules-input'),
    runAutofixBtn: document.getElementById('run-autofix-btn'),
    autofixLog: document.getElementById('autofix-log'),
    pwaInstallPrompt: document.getElementById('pwa-install-prompt'),
    dismissPwaPrompt: document.getElementById('dismiss-pwa-prompt'),
};

const defaultPrompts = {
    main: `Generate a complete family meal plan as a single valid JSON object, without markdown, based on these user settings:
- People: {settings.people}
- Days: {settings.days}
- Protein preference: {settings.protein}
- Restrictions: {settings.restrictions}
- Dietary Goal: {settings.goal}
- Known Allergies: {settings.allergies}.`,
    rules: `The JSON object must strictly adhere to this structure: { "menu": [], "recipes": {}, "shoppingList": [] }.
1.  **Menu**: Create a diverse and logical plan for {settings.days} days.
    *   Each day object must contain: "dayName", "breakfast", "snack1", "lunch" ({ "name", "recipeId" }), "snack2", "dinner" ({ "name", "recipeId" }).
    *   **No repeating main dishes**, except for intelligently scheduled **leftovers**. Plan 1-2 leftover meals for subsequent lunches to minimize cooking.
    *   Breakfast and snacks should be simple and varied (e.g., oatmeal, yogurt, fruit, toast).

2.  **Recipes**: A dictionary of recipe objects, where the key is a unique camelCase "recipeId".
    *   Each recipe must contain: "name", "isProteinBased" (boolean, true for main lunch/dinner dishes), "ingredients" (an array of { "name", "quantity" }), and "steps" (an array of { "title", "description", "timer": integer in minutes }).
    *   **Accurately calculate ingredient quantities** for {settings.people} people.
    *   Only add a "timer" where active waiting is required (e.g., simmering for 20 minutes, baking for 30 minutes).

3.  **Shopping List**: Consolidate ALL ingredients from ALL recipes into a single list.
    *   Each item must contain: a unique kebab-case "id", "name", "quantity", "category" (from a standard list like "Мясо и птица", "Овощи и зелень", "Молочные продукты и яйца", etc.), and "price" (an estimated price in RUB).
    *   Calculate the total price proportionally based on these examples: 7 days for 3 people is approximately 6872 RUB; 5 days for 2 people is approximately 3920 RUB.

4.  **Content Rules**:
    *   All text must be in **Russian**.
    *   Generate simple, common, and appealing recipes suitable for a Russian family, strictly considering all specified restrictions and allergies.
    *   The entire output must be a single, valid JSON object, ready for parsing.`
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

// --- INITIALIZATION ---
async function init() {
    loadStateFromLocalStorage();
    
    if (!AppState.menu || AppState.menu.length === 0) {
        AppState.activeScreen = 'settings-screen';
    } else {
        const validScreens = ['menu-screen', 'recipes-screen', 'shopping-list-screen'];
        if (!validScreens.includes(AppState.activeScreen)) {
            AppState.activeScreen = 'menu-screen';
        }
    }
    
    await initializeAI();
    renderApp();
    registerEventListeners();
    checkPwaInstallPrompt();
}

function checkPwaInstallPrompt() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone || localStorage.getItem('pwaInstallPromptDismissed')) {
        DOM.pwaInstallPrompt.classList.add('hidden');
    } else {
         DOM.pwaInstallPrompt.classList.remove('hidden');
    }
}

async function initializeAI() {
    const apiKey = AppState.apiKey;
    if (apiKey) {
        const success = await verifyApiKey(apiKey, false); // verify without re-saving
        if (success) {
            updateAiStatus('ready');
        } else {
            updateAiStatus('unavailable-invalid');
        }
    } else {
        updateAiStatus('unavailable-empty');
    }
}

async function verifyApiKey(apiKey, saveToState = true) {
    if (!apiKey) return false;
    
    try {
        const tempAi = new GoogleGenAI({ apiKey });
        await tempAi.models.generateContent({model: 'gemini-2.5-flash', contents: 'test'});
        
        ai = tempAi;
        if (saveToState) {
            AppState.apiKey = apiKey;
            saveStateToLocalStorage();
        }
        return true;
    } catch (error) {
        console.error("AI Verification Error:", error);
        ai = null;
        return false;
    }
}

function updateAiStatus(status) {
    DOM.globalSettingsBtn.className = 'global-settings-btn'; // Reset classes
    DOM.aiConnectionStatus.className = 'status-text';
    
    let message = '';
    
    switch(status) {
        case 'ready':
            DOM.globalSettingsBtn.classList.add('ai-ready');
            DOM.generateAiBtn.disabled = false;
            DOM.aiConnectionStatus.classList.add('success');
            message = 'AI готов. Используется сохраненный ключ.';
            break;
        case 'unavailable-invalid':
            DOM.globalSettingsBtn.classList.add('ai-unavailable');
            DOM.generateAiBtn.disabled = true;
            DOM.aiConnectionStatus.classList.add('error');
            message = 'Сохраненный ключ недействителен. Проверьте и сохраните его снова.';
            break;
        case 'unavailable-empty':
             DOM.globalSettingsBtn.classList.add('ai-unavailable');
            DOM.generateAiBtn.disabled = true;
            DOM.aiConnectionStatus.classList.add('error');
            message = 'Введите API ключ для активации генерации.';
            break;
        case 'loading':
            DOM.generateAiBtn.disabled = true;
            message = 'Проверка ключа...';
            break;
    }
    DOM.aiConnectionStatus.textContent = message;
}

// --- STATE MANAGEMENT ---
function getSerializableState() {
    const stateToSave = JSON.parse(JSON.stringify(AppState));
    for (const timerId in stateToSave.timers) {
        delete stateToSave.timers[timerId].interval;
    }
    return stateToSave;
}

function saveStateToLocalStorage() {
    try {
        const stateToSave = getSerializableState();
        localStorage.setItem('familyMenuAppState', JSON.stringify(stateToSave));
    } catch (e) { console.error("Failed to save state:", e); }
}

function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem('familyMenuAppState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            Object.assign(AppState, parsedState);
            AppState.cookedMeals = AppState.cookedMeals || {};
            AppState.timers = AppState.timers || {};
            if (AppState.apiKey) {
                DOM.apiKeyInput.value = AppState.apiKey;
            }
            if (!AppState.prompts || !AppState.prompts.main) {
                AppState.prompts = { ...defaultPrompts };
            }
            Object.values(AppState.timers).forEach(timer => {
                if(timer.running) timer.interval = null; 
            });
        } catch (e) {
            console.error("Failed to parse state, using defaults.", e);
            localStorage.removeItem('familyMenuAppState');
            AppState.prompts = { ...defaultPrompts };
        }
    } else {
        AppState.prompts = { ...defaultPrompts };
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
    if (currentScreen && currentScreen.id === 'recipe-detail-screen' && screenId !== 'recipe-detail-screen') {
        detachAllTimers();
    }
    if (currentScreen) currentScreen.classList.remove('active');
    
    const nextScreen = document.getElementById(screenId);
    if(nextScreen) {
      nextScreen.classList.add('active');
      nextScreen.querySelector('.screen-content')?.scrollTo(0, 0);
    }
    
    DOM.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === screenId));
    
    if (screenId !== 'settings-screen') {
        AppState.activeScreen = screenId;
    }
    saveStateToLocalStorage();
    
    if (screenId === 'menu-screen') {
        scrollToCurrentDay();
    }
}

function detachAllTimers() {
    for (const timerId in AppState.timers) {
        const timer = AppState.timers[timerId];
        if (timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
    }
}

function scrollToCurrentDay() {
    setTimeout(() => {
        const days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
        const todayName = days[new Date().getDay()];
        const dayCards = DOM.menuContent.querySelectorAll('.day-card');
        
        dayCards.forEach(card => card.classList.remove('is-today'));
        
        const todayCard = Array.from(dayCards).find(card => 
            card.querySelector('h3').textContent.toLowerCase().includes(todayName)
        );

        if (todayCard) {
            todayCard.classList.add('is-today');
            todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 200);
}

// --- RENDERING ---
function renderApp() {
    renderMenu();
    renderRecipesList();
    renderShoppingList();
    renderPrintView();
    navigateTo(AppState.activeScreen);
}

function populateSettingsForm() {
    const { settings } = AppState;
    if (!settings || Object.keys(settings).length === 0) return;
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
        DOM.menuContent.innerHTML = `<p style="text-align: center; padding: 2rem;">Меню еще не сгенерировано.<br>Перейдите в настройки, чтобы начать.</p>`;
        return;
    }
    const mealTypes = { breakfast: 'Завтрак', snack1: 'Перекус', lunch: 'Обед', snack2: 'Полдник', dinner: 'Ужин' };
    DOM.menuContent.innerHTML = AppState.menu.map(day => `
        <div class="day-card">
            <h3>${day.dayName}</h3>
            <ul>
                ${Object.entries(mealTypes).map(([mealType, mealLabel]) => {
                    const meal = day[mealType];
                    let mealHtml;
                    if (typeof meal === 'object' && meal.recipeId) {
                        const isLeftover = meal.name.includes('(остатки)');
                        const isCooked = AppState.cookedMeals[meal.recipeId];
                        mealHtml = `<span class="meal-name clickable" data-recipe-id="${meal.recipeId}">
                            ${meal.name.replace(' (остатки)', '')}
                            ${isLeftover ? '<span class="leftover-icon">↻</span>' : ''}
                            ${isCooked ? '<span class="cooked-icon">✓</span>' : ''}
                        </span>`;
                    } else {
                        mealHtml = `<span class="meal-name">${meal || '—'}</span>`;
                    }
                    return `<li class="meal-item-wrapper">
                        <div class="meal-item">
                            <span class="meal-type-label">${mealLabel}</span>
                            ${mealHtml}
                        </div>
                        <div class="recipe-quick-view" data-recipe-container="${meal.recipeId || ''}"></div>
                    </li>`;
                }).join('')}
            </ul>
        </div>`).join('');
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
    navigateTo('recipe-detail-screen');
}

function renderRecipeActions(recipeId) {
    const recipe = AppState.recipes[recipeId];
    const currentStep = AppState.currentStepIndex;
    const totalSteps = recipe.steps.length;
    const isCooked = AppState.cookedMeals[recipeId];

    const prevButtonHtml = currentStep > 0
        ? `<button id="prev-step-btn" class="btn-secondary">← Назад</button>`
        : ``;

    const nextButtonHtml = currentStep < totalSteps - 1
        ? `<button id="next-step-btn" class="btn-primary">Далее →</button>`
        : `<button id="mark-cooked-btn" class="btn-primary ${isCooked ? 'cooked' : ''}">Завершить ✓</button>`;

    DOM.recipeActions.innerHTML = `${prevButtonHtml}${nextButtonHtml}`;
}

function updateStepVisibility(isNext = true) {
    const wrapper = DOM.recipeStepsContainer.querySelector('.recipe-step-wrapper');
    if (!wrapper) return;

    const oldStep = wrapper.querySelector('.recipe-step.active');
    if(oldStep) {
        oldStep.classList.remove('active');
        oldStep.classList.add('exiting');
    }
    
    const newStep = wrapper.querySelector(`.recipe-step[data-step-index="${AppState.currentStepIndex}"]`);
    if (newStep) newStep.classList.add('active');

    DOM.stepProgressBar.style.width = `${((AppState.currentStepIndex + 1) / AppState.recipes[AppState.currentRecipeId].steps.length) * 100}%`;

    const ingredientsPlaceholder = document.getElementById('ingredients-section-placeholder');
    if (AppState.currentStepIndex === AppState.recipes[AppState.currentRecipeId].steps.length - 1) {
        ingredientsPlaceholder.innerHTML = getIngredientsHtmlForRecipe(AppState.recipes[AppState.currentRecipeId]);
    } else {
        ingredientsPlaceholder.innerHTML = '';
    }

    initializeTimersForStep(AppState.currentStepIndex);
    renderRecipeActions(AppState.currentRecipeId);
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
        
        const timer = AppState.timers[timerId];
        if (timer && timer.running && !timer.interval) {
             startTimer(timerId);
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
    const categoryOrder = ["Мясо и птица", "Молочные продукты и яйца", "Овощи и зелень", "Фрукты и орехи", "Крупы и мука", "Хлеб и выпечка", "Прочее"];
    const itemsHtml = categoryOrder.map(category => categories[category] ? `
        <div class="shopping-category"><h3>${category}</h3>${categories[category].map(item => `
            <div class="shopping-item ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
                <div class="shopping-item-toggle ${item.completed ? 'completed' : ''}"></div>
                <div class="shopping-item-info"><span>${item.name}</span><div class="item-quantity">${item.quantity}</div></div>
            </div>`).join('')}</div>` : '').join('');
    
    const pwaPromptHtml = document.getElementById('pwa-install-prompt')?.outerHTML || '';
    DOM.shoppingListContent.innerHTML = pwaPromptHtml + itemsHtml;
    document.getElementById('dismiss-pwa-prompt')?.addEventListener('click', () => {
        document.getElementById('pwa-install-prompt').classList.add('hidden');
        localStorage.setItem('pwaInstallPromptDismissed', 'true');
    });

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
    DOM.printContent.innerHTML = `<h1>Список покупок</h1>${Object.keys(categories).map(cat => `<h2>${cat}</h2><ul>${categories[cat].map(item => `<li>${item.name} - ${item.quantity}</li>`).join('')}</ul>`).join('')}<footer>Семейное меню • Создано с любовью</footer>`;
}

// --- EVENT LISTENERS ---
function registerEventListeners() {
    DOM.globalSettingsBtn.addEventListener('click', () => navigateTo('settings-screen'));
    DOM.navButtons.forEach(button => button.addEventListener('click', () => navigateTo(button.dataset.screen)));
    
    const generationAction = () => {
        if (AppState.menu && AppState.menu.length > 0) {
            if (confirm("Вы уверены? Существующее меню будет заменено новым.")) {
                updateSettingsFromForm();
                handleGeneration();
            }
        } else {
            updateSettingsFromForm();
            handleGeneration();
        }
    };
    
    DOM.generateAiBtn.addEventListener('click', generationAction);
    DOM.loadDemoBtn.addEventListener('click', loadDefaultData);
    
    DOM.verifyApiKeyBtn.addEventListener('click', async () => {
        const key = DOM.apiKeyInput.value.trim();
        const originalButtonText = DOM.verifyApiKeyBtn.textContent;
        DOM.verifyApiKeyBtn.disabled = true;
        DOM.verifyApiKeyBtn.textContent = 'Проверка...';
        updateAiStatus('loading');

        const success = await verifyApiKey(key, true);
        
        if (success) {
            updateAiStatus('ready');
        } else {
            updateAiStatus('unavailable-invalid');
        }
        
        DOM.verifyApiKeyBtn.disabled = false;
        DOM.verifyApiKeyBtn.textContent = originalButtonText;
    });

    DOM.runDiagnosticsBtn.addEventListener('click', runAiDiagnostics);
    DOM.runAutofixBtn.addEventListener('click', runAutofixRoutine);
    DOM.decrementPeopleBtn.addEventListener('click', () => updatePeopleCount(-1));
    DOM.incrementPeopleBtn.addEventListener('click', () => updatePeopleCount(1));
    DOM.recipesList.addEventListener('click', e => { const card = e.target.closest('.recipe-card'); if (card) renderRecipeDetail(card.dataset.recipeId); });
    DOM.menuContent.addEventListener('click', handleMenuClick);
    DOM.backToRecipesBtn.addEventListener('click', () => navigateTo('recipes-screen'));
    DOM.recipeActions.addEventListener('click', handleRecipeNav);
    DOM.closePwaModal.addEventListener('click', () => { DOM.pwaModal.classList.remove('visible'); localStorage.setItem('pwaPromptShown', 'true'); });
    DOM.exportRemindersButton.addEventListener('click', exportToReminders);
    DOM.exportDataBtn.addEventListener('click', exportState);
    DOM.importDataBtn.addEventListener('click', () => DOM.importFileInput.click());
    DOM.importFileInput.addEventListener('change', importState);
    DOM.sharePlanBtn.addEventListener('click', sharePlanViaQR);
    DOM.scanQrBtn.addEventListener('click', startQrScanner);
    DOM.closeQrModal.addEventListener('click', () => DOM.qrCodeModal.classList.remove('visible'));
    DOM.closeScannerModal.addEventListener('click', stopQrScanner);
    DOM.printBtn.addEventListener('click', () => navigateTo('print-screen'));
    DOM.recipeStepsContainer.addEventListener('click', handleRecipeStepClick);
    DOM.recipeStepsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    DOM.recipeStepsContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    DOM.recipeStepsContainer.addEventListener('touchend', handleTouchEnd);
    DOM.editPromptsBtn.addEventListener('click', openPromptsEditor);
    DOM.closePromptsModal.addEventListener('click', () => DOM.promptsModal.classList.remove('visible'));
    DOM.savePromptsBtn.addEventListener('click', savePrompts);
    DOM.resetPromptsBtn.addEventListener('click', () => resetPrompts(false));
    
    DOM.shoppingListContent.addEventListener('click', e => {
        const itemElement = e.target.closest('.shopping-item');
        if(itemElement) {
            const item = AppState.shoppingList.find(i => i.id === itemElement.dataset.itemId);
            if(item) { item.completed = !item.completed; saveStateToLocalStorage(); renderShoppingList(); }
        }
    });

    DOM.dismissPwaPrompt.addEventListener('click', () => {
        DOM.pwaInstallPrompt.classList.add('hidden');
        localStorage.setItem('pwaInstallPromptDismissed', 'true');
    });
}

function updatePeopleCount(change) {
    let currentValue = parseInt(DOM.peopleValue.textContent, 10);
    const min = 1; const max = 6;
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
    renderRecipesList();
    renderMenu();
}

function handleMenuClick(e) {
    const target = e.target.closest('.meal-name.clickable');
    if (!target) return;
    const recipeId = target.dataset.recipeId;
    const container = document.querySelector(`.recipe-quick-view[data-recipe-container="${recipeId}"]`);
    const isExpanded = container.classList.contains('expanded');
    document.querySelectorAll('.recipe-quick-view.expanded').forEach(el => {
        if (el !== container) {
            el.classList.remove('expanded');
            el.innerHTML = '';
            el.closest('.meal-item-wrapper').querySelector('.meal-name.clickable')?.classList.remove('expanded');
        }
    });
    if (isExpanded) {
        container.classList.remove('expanded');
        target.classList.remove('expanded');
        container.innerHTML = '';
    } else {
        const recipe = AppState.recipes[recipeId];
        if (recipe) {
            container.innerHTML = `
                <div class="recipe-quick-view-ingredients"><h4>Ингредиенты</h4><ul>${recipe.ingredients.map(ing => `<li>${ing.name} - ${ing.quantity}</li>`).join('')}</ul></div>
                <div class="recipe-quick-view-steps"><h4>Шаги</h4>${recipe.steps.map((step, index) => `<div class="step"><strong>Шаг ${index + 1}: ${step.title}</strong><p>${step.description}</p>${step.timer ? `<div class="timer-container" data-timer-id="${recipeId}-${index}"><div class="timer-display">00:00</div><div class="timer-controls"><button class="start-btn">Старт</button><button class="pause-btn" disabled>Пауза</button><button class="reset-btn">Сброс</button></div></div>` : ''}</div>`).join('')}</div>`;
            container.classList.add('expanded');
            target.classList.add('expanded');
        }
    }
}

function handleRecipeStepClick(e) {
    const timerContainer = e.target.closest('.timer-container');
    if (!timerContainer) return;
    const timerId = timerContainer.dataset.timerId;
    if(e.target.classList.contains('start-btn')) startTimer(timerId);
    if(e.target.classList.contains('pause-btn')) pauseTimer(timerId);
    if(e.target.classList.contains('reset-btn')) resetTimer(timerId);
}
function handleRecipeNav(e) {
    const recipe = AppState.recipes[AppState.currentRecipeId];
    if (!recipe) return;
    if (e.target.id === 'next-step-btn' && AppState.currentStepIndex < recipe.steps.length - 1) {
        AppState.currentStepIndex++; updateStepVisibility(true);
    } else if (e.target.id === 'prev-step-btn' && AppState.currentStepIndex > 0) {
        AppState.currentStepIndex--; updateStepVisibility(false);
    } else if (e.target.id === 'mark-cooked-btn') {
        toggleCookedStatus(AppState.currentRecipeId);
        showToast("Рецепт отмечен как приготовленный!");
        navigateTo('recipes-screen');
    }
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
                    lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, recipeId: { type: Type.STRING } } },
                    snack2: { type: Type.STRING },
                    dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, recipeId: { type: Type.STRING } } }
                }
            }
        },
        recipes: {
            type: Type.OBJECT,
            properties: {}
        },
        shoppingList: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    category: { type: Type.STRING },
                    price: { type: Type.NUMBER }
                }
            }
        }
    }
};

async function handleGeneration() {
    if (!ai) { showToast("Генерация недоступна. Проверьте API ключ в настройках.", true); return; }
    
    DOM.loaderStatus.innerHTML = "Подготовка запроса...";
    DOM.loaderModal.classList.add('visible');
    
    try {
        const prompt = createPrompt(AppState.settings);
        
        DOM.loaderStatus.innerHTML = "Отправляю запрос в AI...<br>Это может занять до 30 секунд.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: responseSchema },
        });
        
        DOM.loaderStatus.innerHTML = "Обработка ответа...";

        const data = JSON.parse(response.text);

        if (!data.recipes || typeof data.recipes !== 'object') {
           throw new Error("Invalid format: 'recipes' should be an object/dictionary.");
        }
        
        AppState.menu = data.menu;
        AppState.recipes = data.recipes;
        AppState.shoppingList = data.shoppingList.map(item => ({...item, completed: false}));
        AppState.cookedMeals = {};
        AppState.timers = {};
        saveStateToLocalStorage();
        AppState.activeScreen = 'menu-screen';
        renderApp();
    } catch (error) { 
        console.error("Error generating menu:", error); 
        const errorMessage = getErrorMessage(error);
        showToast(`Ошибка генерации: ${errorMessage.fix}`, true);
    } finally { 
        DOM.loaderModal.classList.remove('visible'); 
    }
}

function loadDefaultData() {
    showToast("Загружен демонстрационный план.");
    Object.assign(AppState, defaultPlan);
    AppState.shoppingList = AppState.shoppingList.map(item => ({...item, completed: false}));
    AppState.cookedMeals = AppState.cookedMeals || {};
    AppState.timers = {};
    saveStateToLocalStorage();
    AppState.activeScreen = 'menu-screen';
    renderApp();
}

function createPrompt(settings) {
    let main = AppState.prompts.main;
    let rules = AppState.prompts.rules;

    const replacements = {
        '{settings.people}': settings.people,
        '{settings.days}': settings.days,
        '{settings.protein}': settings.protein,
        '{settings.restrictions}': settings.restrictions.join(', ') || 'None',
        '{settings.goal}': settings.goal,
        '{settings.allergies}': settings.allergies || 'None',
    };

    for (const key in replacements) {
        const regex = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        main = main.replace(regex, replacements[key]);
        rules = rules.replace(regex, replacements[key]);
    }
    
    return `${main}\n\n${rules}`;
}

// --- PROMPTS MANAGEMENT ---
function openPromptsEditor() {
    DOM.promptMainInput.value = AppState.prompts.main;
    DOM.promptRulesInput.value = AppState.prompts.rules;
    DOM.promptsModal.classList.add('visible');
}

function savePrompts() {
    AppState.prompts.main = DOM.promptMainInput.value;
    AppState.prompts.rules = DOM.promptRulesInput.value;
    saveStateToLocalStorage();
    showToast("Промты успешно сохранены!");
    DOM.promptsModal.classList.remove('visible');
}

function resetPrompts(silent = false) {
    const doReset = () => {
        AppState.prompts = { ...defaultPrompts };
        DOM.promptMainInput.value = AppState.prompts.main;
        DOM.promptRulesInput.value = AppState.prompts.rules;
        saveStateToLocalStorage();
        if (!silent) {
            showToast("Промты сброшены.");
        }
    };

    if (silent) {
        doReset();
    } else {
        if (confirm("Вы уверены, что хотите сбросить промты до значений по умолчанию?")) {
            doReset();
        }
    }
}


// --- UTILITIES ---
function showToast(message, isError = false) {
    DOM.toast.textContent = message;
    DOM.toast.style.backgroundColor = isError ? 'var(--warning-accent)' : 'var(--success-accent)';
    DOM.toast.classList.add('show');
    setTimeout(() => DOM.toast.classList.remove('show'), 3000);
}
const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
function escapeHtml(string) { return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s]); }


// --- SYNC & DATA MANAGEMENT ---
async function sharePlanViaQR() {
    if (!AppState.menu || AppState.menu.length === 0) {
        showToast('Сначала сгенерируйте меню, чтобы поделиться им.'); return;
    }
    try {
        const stateToShare = getSerializableState();
        const jsonString = JSON.stringify(stateToShare);
        const compressed = pako.deflate(jsonString, { to: 'string' });
        const base64 = btoa(compressed);
        await QRCode.toCanvas(DOM.qrCodeCanvas, base64, { errorCorrectionLevel: 'L', width: 256 });
        DOM.qrCodeModal.classList.add('visible');
    } catch (err) { console.error('QR Code generation failed', err); showToast('Не удалось создать QR-код.'); }
}

async function startQrScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        DOM.qrVideo.srcObject = stream;
        DOM.qrVideo.play();
        DOM.qrScannerModal.classList.add('visible');
        qrAnimation = requestAnimationFrame(tick);
    } catch (err) { console.error("Camera access denied:", err); showToast("Не удалось получить доступ к камере."); }
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
        canvas.width = DOM.qrVideo.videoWidth; canvas.height = DOM.qrVideo.videoHeight;
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
                    AppState.activeScreen = 'menu-screen';
                    renderApp();
                    showToast("План успешно синхронизирован!");
                } else { throw new Error("Invalid data"); }
            } catch (err) { console.error("QR data processing error", err); showToast("Ошибка: Неверный QR-код."); }
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
        const stateToExport = getSerializableState();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([JSON.stringify(stateToExport, null, 2)], { type: 'application/json' }));
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
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.settings && importedState.menu && importedState.recipes) {
                Object.assign(AppState, importedState);
                saveStateToLocalStorage();
                populateSettingsForm();
                initializeAI();
                AppState.activeScreen = 'settings-screen';
                renderApp();
                showToast("Данные успешно импортированы!");
            } else {
                throw new Error("Invalid data structure in file.");
            }
        } catch (error) {
            console.error("Failed to import state:", error);
            showToast("Ошибка импорта. Файл поврежден или имеет неверный формат.", true);
        } finally {
            event.target.value = null; // Reset input
        }
    };
    reader.onerror = () => {
        showToast("Не удалось прочитать файл.", true);
        event.target.value = null;
    };
    reader.readAsText(file);
}

// --- TIMER LOGIC ---
function startTimer(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer || timer.running) return;
    
    timer.running = true;
    const timerContainer = document.querySelector(`.timer-container[data-timer-id="${timerId}"]`);
    if(timerContainer) {
        timerContainer.querySelector('.start-btn').disabled = true;
        timerContainer.querySelector('.pause-btn').disabled = false;
    }

    timer.interval = setInterval(() => {
        timer.remaining--;
        updateTimerDisplay(timerId);
        if (timer.remaining <= 0) {
            pauseTimer(timerId);
            alarmSound.play();
            showToast("Время вышло!");
        }
        saveStateToLocalStorage();
    }, 1000);
}

function pauseTimer(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer || !timer.running) return;
    
    timer.running = false;
    clearInterval(timer.interval);
    timer.interval = null;
    
    const timerContainer = document.querySelector(`.timer-container[data-timer-id="${timerId}"]`);
    if(timerContainer) {
        timerContainer.querySelector('.start-btn').disabled = false;
        timerContainer.querySelector('.pause-btn').disabled = true;
    }
    saveStateToLocalStorage();
}

function resetTimer(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer) return;
    
    pauseTimer(timerId);
    timer.remaining = timer.duration;
    updateTimerDisplay(timerId);
    saveStateToLocalStorage();
}

function updateTimerDisplay(timerId) {
    const timer = AppState.timers[timerId];
    if (!timer) return;
    const timerDisplay = document.querySelector(`.timer-container[data-timer-id="${timerId}"] .timer-display`);
    if(timerDisplay) {
        const minutes = Math.floor(timer.remaining / 60).toString().padStart(2, '0');
        const seconds = (timer.remaining % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }
}


// --- Error Handling & Diagnostics ---
function getErrorMessage(error) {
    const defaultFix = "Проверьте ваше интернет-соединение и попробуйте снова. Если проблема повторяется, возможно, сервисы Google временно недоступны.";
    let message = error.message || 'Произошла неизвестная ошибка.';
    let fix = defaultFix;
    let link = null;

    if (message.includes("Failed to fetch") || message.includes("ERR_CONNECTION_CLOSED")) {
        message = "Сетевая ошибка.";
        fix = "Не удалось подключиться к серверам Google. Проверьте ваше интернет-соединение, отключите VPN/прокси и попробуйте снова. Возможно, это временная проблема на стороне Google.";
        link = { text: "Проверить статус сервисов Google", url: "https://status.cloud.google.com/" };
    } else if (message.includes("API key not valid")) {
        message = "Неверный API ключ.";
        fix = "Пожалуйста, проверьте правильность введенного API ключа в настройках.";
    } else if (message.includes("overloaded") || (error.error && error.error.code === 503)) {
        message = "Серверы AI перегружены.";
        fix = "Это временная проблема на стороне Google. Пожалуйста, подождите несколько минут и попробуйте снова.";
        link = { text: "Проверить статус сервисов Google", url: "https://status.cloud.google.com/" };
    } else if (message.includes("Content creation is blocked")) {
        message = "Запрос заблокирован политикой безопасности.";
        fix = "Ваш запрос содержит потенциально небезопасный контент. Попробуйте изменить формулировки в настройках или в редакторе промтов.";
    } else if (message.includes("quota")) {
        message = "Превышена квота использования API.";
        fix = "Вы достигли лимита запросов для вашего ключа. Проверьте лимиты в вашей Google Cloud Console.";
        link = { text: "Перейти в Google Cloud Console", url: "https://console.cloud.google.com/" };
    } else if (message.includes("billing account")) {
        message = "Проблема с биллингом.";
        fix = "Убедитесь, что к вашему проекту Google Cloud привязан активный биллинговый аккаунт.";
        link = { text: "Перейти в настройки биллинга", url: "https://console.cloud.google.com/billing" };
    }
    
    return { message, fix, link };
}

async function runAiDiagnostics() {
    DOM.diagnosticsResults.innerHTML = '';
    DOM.diagnosticsResults.classList.add('visible');
    const key = AppState.apiKey;

    // Step 1: Key presence
    let step1Result = `<div class="diagnostic-step">
        <div class="step-title">Шаг 1: Проверка наличия ключа</div>`;
    if (key) {
        step1Result += `<div class="step-status success">УСПЕХ</div>
            <div class="step-details">Ключ найден в локальном хранилище.</div>`;
    } else {
        step1Result += `<div class="step-status error">ПРОВАЛЕН</div>
            <div class="step-details">Ключ не найден.</div>
            <div class="step-fix">Введите и сохраните ваш API ключ в поле выше.</div>`;
    }
    step1Result += `</div>`;
    DOM.diagnosticsResults.innerHTML += step1Result;
    if (!key) return;

    // Step 2: Basic API Test
    let step2Result = `<div class="diagnostic-step">
        <div class="step-title">Шаг 2: Базовый тест API (проверка ключа)</div>`;
    try {
        const testAi = new GoogleGenAI({ apiKey: key });
        await testAi.models.generateContent({model: 'gemini-2.5-flash', contents: 'test'});
        step2Result += `<div class="step-status success">УСПЕХ</div>
            <div class="step-details">Ключ действителен и соединение с API установлено.</div>`;
    } catch (e) {
        const errorInfo = getErrorMessage(e);
        step2Result += `<div class="step-status error">ПРОВАЛЕН</div>
            <div class="step-details"><strong>Ошибка:</strong> ${escapeHtml(errorInfo.message)}</div>
            <div class="step-fix">${errorInfo.fix} ${errorInfo.link ? `<a href="${errorInfo.link.url}" target="_blank">${errorInfo.link.text}</a>` : ''}</div>`;
        step2Result += `</div>`;
        DOM.diagnosticsResults.innerHTML += step2Result;
        return;
    }
    step2Result += `</div>`;
    DOM.diagnosticsResults.innerHTML += step2Result;

    // Step 3: Real Generation Test
    let step3Result = `<div class="diagnostic-step">
        <div class="step-title">Шаг 3: Тест генерации (простой JSON)</div>`;
    try {
        const testAi = new GoogleGenAI({ apiKey: key });
        const testSchema = { type: Type.OBJECT, properties: { recipeName: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } } } };
        const response = await testAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Create a simple omelette recipe in Russian as a JSON object.',
            config: { responseMimeType: "application/json", responseSchema: testSchema },
        });
        const parsedResponse = JSON.parse(response.text);

        step3Result += `<div class="step-status success">УСПЕХ</div>
            <div class="step-details">Нейросеть успешно сгенерировала структурированный ответ.</div>
            <div class="ai-response"><strong>Ответ от AI:</strong><br>${escapeHtml(JSON.stringify(parsedResponse, null, 2))}</div>`;
    } catch (e) {
        const errorInfo = getErrorMessage(e);
        step3Result += `<div class="step-status error">ПРОВАЛЕН</div>
            <div class="step-details"><strong>Ошибка:</strong> ${escapeHtml(errorInfo.message)}</div>
            <div class="step-fix">${errorInfo.fix} ${errorInfo.link ? `<a href="${errorInfo.link.url}" target="_blank">${errorInfo.link.text}</a>` : ''}</div>`;
    }
    step3Result += `</div>`;
    DOM.diagnosticsResults.innerHTML += step3Result;
}

async function runAutofixRoutine() {
    DOM.autofixLog.innerHTML = '';
    DOM.autofixLog.classList.add('visible');

    const log = (message, status = 'info') => {
        DOM.autofixLog.innerHTML += `<div class="autofix-log-entry">
            <div class="log-title log-status ${status}">${status.toUpperCase()}: ${message}</div>
        </div>`;
    };

    log('Запуск автоматического исправления...');

    // Step 1: Check network
    log('Шаг 1: Проверка сетевого подключения...');
    if (navigator.onLine) {
        log('Интернет-соединение активно.', 'success');
    } else {
        log('Отсутствует интернет-соединение. Проверьте сеть.', 'error');
        return;
    }

    // Step 2: Reset prompts
    log('Шаг 2: Сброс промтов к значениям по умолчанию...');
    resetPrompts(true); // silent reset
    log('Промты сброшены.', 'success');
    
    // Step 3: Re-run diagnostics
    log('Шаг 3: Запуск полной диагностики...');
    await runAiDiagnostics();
    
    // Final step
    setTimeout(() => {
        const hasErrors = DOM.diagnosticsResults.querySelector('.error');
        if (hasErrors) {
            log('Авто-исправление завершено, но остались нерешенные проблемы. Пожалуйста, следуйте инструкциям в логе диагностики.', 'error');
        } else {
            log('Авто-исправление завершено. Все системы работают в штатном режиме. Попробуйте сгенерировать меню снова.', 'success');
        }
    }, 500);
}

// --- START APP ---
init();
