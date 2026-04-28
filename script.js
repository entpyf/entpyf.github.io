const TAB_BUTTONS = Array.from(document.querySelectorAll('.tab-btn'));
const TAB_PANELS = Array.from(document.querySelectorAll('.tab-content'));
const RESULT_CONFIG = {
    power: {
        containerId: 'power-result',
        messageId: 'power-status'
    },
    energy: {
        containerId: 'energy-result',
        messageId: 'energy-status'
    },
    radius: {
        containerId: 'radius-result',
        messageId: 'radius-status'
    }
};

const AGE_RANGE = {
    min: 3,
    max: 164
};

// ── i18n 文案字典 ──────────────────────────────────────────────

const I18N = {
    zh: {
        title: '光动力治疗计算器',
        subtitle: 'Photodynamic Therapy Calculator',
        tabPower: '功率计算',
        tabEnergy: '能量密度',
        tabRadius: '儿童半径预测',
        tablistLabel: 'PDT 计算功能',
        labelEnergyDensity: '能量密度',
        labelFiberLength: '光纤长度',
        labelExposureTime: '照射时间',
        labelRadius: '半径',
        labelChildAge: '儿童年龄（月龄）',
        unitSeconds: '秒',
        unitMonths: '月',
        btnCalcPower: '计算功率',
        btnCalcEnergy: '计算能量密度',
        btnPredictRadius: '预测半径',
        resultOutputPower: '输出功率',
        resultPowerDensity: '功率密度',
        resultPredictedRadius: '预测照射半径',
        hintAgeRange: '儿童年龄模型适用范围为 3-164 月龄；超出范围时仍可计算，但结果仅供参考。',
        msgPowerResult: '已根据当前输入计算输出功率与功率密度。',
        msgEnergyResult: '已根据当前输入计算能量密度。',
        msgRadiusResult: '结果为预测照射半径，单位为 cm。',
        msgRadiusWarning: `当前年龄超出 ${AGE_RANGE.min}-${AGE_RANGE.max} 月龄模型范围，结果属于模型外推，仅供参考。`,
        msgValidationError: '请修正标红字段后重新计算。',
        errEmpty: (label) => `请输入${label}`,
        errNotNumber: (label) => `${label}必须为数字`,
        errPositive: (label) => `${label}必须大于 0`,
        errNonNegative: (label) => `${label}不能为负数`,
        footerAriaLabel: '作者与单位信息',
        footerAuthor: '作者：Yufei Pan',
        footerAffiliation: '南京医科大学附属明基医院 · 耳鼻咽喉头颈外科',
        footerEmail: '邮箱：<a href="mailto:entpyf@163.com">entpyf@163.com</a>',
        langHint: '切换语言',
        langToggleText: 'EN',
        langToggleAriaLabel: 'Switch to English',
        pageTitle: '光动力治疗计算器',
        fieldLabels: {
            'ed-power': '能量密度',
            'lg-power': '光纤长度',
            'time-power': '照射时间',
            'r-power': '半径',
            'op-energy': '输出功率',
            'lg-energy': '光纤长度',
            'time-energy': '照射时间',
            'r-energy': '半径',
            'age-radius': '儿童年龄'
        }
    },
    en: {
        title: 'PDT Calculator',
        subtitle: 'Photodynamic Therapy Calculator',
        tabPower: 'Power',
        tabEnergy: 'Fluence',
        tabRadius: 'Pediatric Radius',
        tablistLabel: 'PDT Calculator Functions',
        labelEnergyDensity: 'Fluence',
        labelFiberLength: 'Fiber Length',
        labelExposureTime: 'Exposure Time',
        labelRadius: 'Radius',
        labelChildAge: 'Child Age (Months)',
        unitSeconds: 's',
        unitMonths: 'mo',
        btnCalcPower: 'Calculate Power',
        btnCalcEnergy: 'Calculate Fluence',
        btnPredictRadius: 'Predict Radius',
        resultOutputPower: 'Optical Power',
        resultPowerDensity: 'Irradiance',
        resultPredictedRadius: 'Predicted Irradiation Radius',
        hintAgeRange: 'Model applicable for ages 3–164 months; results outside this range are extrapolated and for reference only.',
        msgPowerResult: 'Optical power and irradiance calculated from the current inputs.',
        msgEnergyResult: 'Fluence calculated from the current inputs.',
        msgRadiusResult: 'Predicted irradiation radius in cm.',
        msgRadiusWarning: `Age is outside the ${AGE_RANGE.min}–${AGE_RANGE.max} month model range; result is extrapolated and for reference only.`,
        msgValidationError: 'Please correct the highlighted fields and try again.',
        errEmpty: (label) => `Please enter ${label}`,
        errNotNumber: (label) => `${label} must be a number`,
        errPositive: (label) => `${label} must be greater than 0`,
        errNonNegative: (label) => `${label} cannot be negative`,
        footerAriaLabel: 'Author and affiliation',
        footerAuthor: 'Author: Yufei Pan',
        footerAffiliation: 'BenQ Medical Center, Nanjing Medical University · Dept. of Otolaryngology-HNS',
        footerEmail: 'Email: <a href="mailto:entpyf@163.com">entpyf@163.com</a>',
        langHint: 'Switch Language',
        langToggleText: '中文',
        langToggleAriaLabel: '切换为中文',
        pageTitle: 'PDT Calculator',
        fieldLabels: {
            'ed-power': 'Fluence',
            'lg-power': 'Fiber Length',
            'time-power': 'Exposure Time',
            'r-power': 'Radius',
            'op-energy': 'Optical Power',
            'lg-energy': 'Fiber Length',
            'time-energy': 'Exposure Time',
            'r-energy': 'Radius',
            'age-radius': 'Child Age'
        }
    }
};

let currentLang = 'en';

function t(key) {
    return I18N[currentLang][key];
}

function fieldLabel(inputId) {
    return I18N[currentLang].fieldLabels[inputId];
}

// 翻译所有带 data-i18n 属性的静态元素
function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        const text = I18N[currentLang][key];
        if (text === undefined) return;

        if (key === 'footerEmail') {
            el.innerHTML = text;
        } else {
            el.textContent = text;
        }
    });

    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('pageTitle');

    const tablist = document.querySelector('[data-i18n-aria="tablistLabel"]');
    if (tablist) {
        tablist.setAttribute('aria-label', t('tablistLabel'));
    }

    const siteFooter = document.querySelector('.site-footer');
    if (siteFooter) {
        siteFooter.setAttribute('aria-label', t('footerAriaLabel'));
    }

    const toggleBtn = document.getElementById('lang-toggle');
    toggleBtn.textContent = t('langToggleText');
    toggleBtn.setAttribute('aria-label', t('langToggleAriaLabel'));

    // 如果结果区已经显示，更新结果文案
    refreshVisibleResults();
}

// 如果某个结果面板已经展示，更新其状态消息
function refreshVisibleResults() {
    ['power', 'energy', 'radius'].forEach((key) => {
        const { container } = getResultElements(key);
        if (container.hidden) return;

        const state = container.dataset.state;
        if (state === 'error') {
            setResultState(key, 'error', t('msgValidationError'));
        } else if (key === 'power') {
            setResultState(key, 'normal', t('msgPowerResult'));
        } else if (key === 'energy') {
            setResultState(key, 'normal', t('msgEnergyResult'));
        } else if (key === 'radius') {
            if (state === 'warning') {
                setResultState(key, 'warning', t('msgRadiusWarning'));
            } else {
                setResultState(key, 'normal', t('msgRadiusResult'));
            }
        }
    });
}

// ── VALIDATION_RULES 保持结构不变，label 改为运行时读取 ──

const VALIDATION_RULES = {
    power: [
        { id: 'ed-power', key: 'energyDensity', mode: 'positive' },
        { id: 'lg-power', key: 'fiberLength', mode: 'positive' },
        { id: 'time-power', key: 'exposureTime', mode: 'positive' },
        { id: 'r-power', key: 'radius', mode: 'positive' }
    ],
    energy: [
        { id: 'op-energy', key: 'outputPower', mode: 'positive' },
        { id: 'lg-energy', key: 'fiberLength', mode: 'positive' },
        { id: 'time-energy', key: 'exposureTime', mode: 'positive' },
        { id: 'r-energy', key: 'radius', mode: 'positive' }
    ],
    radius: [
        { id: 'age-radius', key: 'age', mode: 'nonNegative' }
    ]
};

const FIELD_CONFIG_BY_ID = Object.values(VALIDATION_RULES)
    .flat()
    .reduce((configMap, config) => {
        configMap[config.id] = config;
        return configMap;
    }, {});

// 功率计算公式
// OP = (Ed / Time) * Lg * R * 6280
function fastpower(energyDensity, fiberLength, exposureTime, radius) {
    return (energyDensity / exposureTime) * fiberLength * radius * 6280;
}

// 能量密度计算公式
// Ed = OP / (Lg * R * 6280) * Time
function fastenergy(outputPower, fiberLength, exposureTime, radius) {
    return (outputPower / (fiberLength * radius * 6280)) * exposureTime;
}

// 照射半径预测公式，原始预测值为直径（mm）
function predictAP(age) {
    const intercept = 4.90664022719264;
    const slope = 0.0469951024357361;
    return intercept + slope * age;
}

function getInput(inputId) {
    return document.getElementById(inputId);
}

function getFieldMessage(inputId) {
    return document.getElementById(`${inputId}-message`);
}

function clearFieldState(inputId) {
    const input = getInput(inputId);
    const message = getFieldMessage(inputId);

    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    message.textContent = '';
    delete message.dataset.state;
}

function setFieldError(inputId, errorMessage) {
    const input = getInput(inputId);
    const message = getFieldMessage(inputId);

    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    message.textContent = errorMessage;
    message.dataset.state = 'error';
}

function validateNumericField(fieldConfig) {
    const input = getInput(fieldConfig.id);
    const rawValue = input.value.trim();
    const label = fieldLabel(fieldConfig.id);

    if (rawValue === '') {
        return { error: t('errEmpty')(label) };
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
        return { error: t('errNotNumber')(label) };
    }

    if (fieldConfig.mode === 'positive' && value <= 0) {
        return { error: t('errPositive')(label) };
    }

    if (fieldConfig.mode === 'nonNegative' && value < 0) {
        return { error: t('errNonNegative')(label) };
    }

    return { value };
}

function validateFields(calculatorKey) {
    const fieldConfigs = VALIDATION_RULES[calculatorKey];
    const values = {};
    let firstInvalidInput = null;

    fieldConfigs.forEach((fieldConfig) => {
        clearFieldState(fieldConfig.id);

        const validationResult = validateNumericField(fieldConfig);

        if (validationResult.error) {
            setFieldError(fieldConfig.id, validationResult.error);

            if (!firstInvalidInput) {
                firstInvalidInput = getInput(fieldConfig.id);
            }

            return;
        }

        values[fieldConfig.key] = validationResult.value;
    });

    return {
        values,
        firstInvalidInput
    };
}

function getResultElements(calculatorKey) {
    const config = RESULT_CONFIG[calculatorKey];

    return {
        container: document.getElementById(config.containerId),
        message: document.getElementById(config.messageId)
    };
}

function hideResult(calculatorKey) {
    const { container, message } = getResultElements(calculatorKey);

    container.hidden = true;
    container.classList.remove('show');
    container.dataset.state = 'normal';
    container.setAttribute('role', 'status');
    message.textContent = '';
}

function setResultState(calculatorKey, state, messageText) {
    const { container, message } = getResultElements(calculatorKey);

    container.hidden = false;
    container.classList.add('show');
    container.dataset.state = state;
    container.setAttribute('role', state === 'error' ? 'alert' : 'status');
    message.textContent = messageText;
}

function focusAndScroll(element) {
    if (!element) {
        return;
    }

    try {
        element.focus({ preventScroll: true });
    } catch (error) {
        element.focus();
    }

    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function revealResult(calculatorKey) {
    const { container } = getResultElements(calculatorKey);

    requestAnimationFrame(() => {
        container.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    });
}

function runPowerCalculator(values) {
    const outputPower = fastpower(
        values.energyDensity,
        values.fiberLength,
        values.exposureTime,
        values.radius
    );

    // 功率密度按圆柱侧面积估算，便于移动端直接给出完整结果。
    const exposureArea = 2 * Math.PI * values.radius * values.fiberLength;
    const powerDensity = outputPower / exposureArea;

    document.getElementById('power-value').textContent = outputPower.toFixed(2);
    document.getElementById('power-density-value').textContent = powerDensity.toFixed(2);

    setResultState('power', 'normal', t('msgPowerResult'));
    revealResult('power');
}

function runEnergyCalculator(values) {
    const energyDensity = fastenergy(
        values.outputPower,
        values.fiberLength,
        values.exposureTime,
        values.radius
    );

    document.getElementById('energy-value').textContent = energyDensity.toFixed(2);

    setResultState('energy', 'normal', t('msgEnergyResult'));
    revealResult('energy');
}

function runRadiusCalculator(values) {
    const predictedDiameter = predictAP(values.age);
    const predictedRadius = predictedDiameter / 2 / 10;
    const outOfRange = values.age < AGE_RANGE.min || values.age > AGE_RANGE.max;

    document.getElementById('radius-value').textContent = predictedRadius.toFixed(2);

    if (outOfRange) {
        setResultState('radius', 'warning', t('msgRadiusWarning'));
    } else {
        setResultState('radius', 'normal', t('msgRadiusResult'));
    }

    revealResult('radius');
}

function runCalculator(calculatorKey) {
    const validationResult = validateFields(calculatorKey);

    if (validationResult.firstInvalidInput) {
        setResultState(calculatorKey, 'error', t('msgValidationError'));
        focusAndScroll(validationResult.firstInvalidInput);
        return;
    }

    if (calculatorKey === 'power') {
        runPowerCalculator(validationResult.values);
        return;
    }

    if (calculatorKey === 'energy') {
        runEnergyCalculator(validationResult.values);
        return;
    }

    runRadiusCalculator(validationResult.values);
}

function activateTab(tabKey, shouldFocusButton = false) {
    TAB_BUTTONS.forEach((button) => {
        const isActive = button.dataset.tab === tabKey;

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        button.tabIndex = isActive ? 0 : -1;

        if (isActive && shouldFocusButton) {
            button.focus();
        }
    });

    TAB_PANELS.forEach((panel) => {
        const isActive = panel.id === `${tabKey}-tab`;

        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
        panel.setAttribute('aria-hidden', String(!isActive));
    });
}

function moveTabFocus(currentButton, direction) {
    const currentIndex = TAB_BUTTONS.indexOf(currentButton);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = TAB_BUTTONS.length - 1;
    }

    if (nextIndex >= TAB_BUTTONS.length) {
        nextIndex = 0;
    }

    activateTab(TAB_BUTTONS[nextIndex].dataset.tab, true);
}

function handleTabKeydown(event) {
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveTabFocus(event.currentTarget, 1);
    }

    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveTabFocus(event.currentTarget, -1);
    }

    if (event.key === 'Home') {
        event.preventDefault();
        activateTab(TAB_BUTTONS[0].dataset.tab, true);
    }

    if (event.key === 'End') {
        event.preventDefault();
        activateTab(TAB_BUTTONS[TAB_BUTTONS.length - 1].dataset.tab, true);
    }
}

TAB_BUTTONS.forEach((button) => {
    button.addEventListener('click', () => {
        activateTab(button.dataset.tab);
    });

    button.addEventListener('keydown', handleTabKeydown);
});

document.querySelectorAll('.calculate-btn').forEach((button) => {
    button.addEventListener('click', () => {
        runCalculator(button.dataset.calcTarget);
    });
});

document.querySelectorAll('input[type="number"]').forEach((input) => {
    const panel = input.closest('.tab-content');
    const calculatorKey = panel.dataset.calculator;
    const fieldConfig = FIELD_CONFIG_BY_ID[input.id];

    input.addEventListener('input', () => {
        clearFieldState(input.id);
        hideResult(calculatorKey);
    });

    input.addEventListener('blur', () => {
        clearFieldState(input.id);

        const validationResult = validateNumericField(fieldConfig);

        if (validationResult.error) {
            setFieldError(input.id, validationResult.error);
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            runCalculator(calculatorKey);
        }
    });
});

// ── 语言切换按钮 ──

document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    translatePage();
});

activateTab('power');
translatePage();
