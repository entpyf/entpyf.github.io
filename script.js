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

const VALIDATION_RULES = {
    power: [
        { id: 'ed-power', key: 'energyDensity', label: '能量密度', mode: 'positive' },
        { id: 'lg-power', key: 'fiberLength', label: '光纤长度', mode: 'positive' },
        { id: 'time-power', key: 'exposureTime', label: '照射时间', mode: 'positive' },
        { id: 'r-power', key: 'radius', label: '半径', mode: 'positive' }
    ],
    energy: [
        { id: 'op-energy', key: 'outputPower', label: '输出功率', mode: 'positive' },
        { id: 'lg-energy', key: 'fiberLength', label: '光纤长度', mode: 'positive' },
        { id: 'time-energy', key: 'exposureTime', label: '照射时间', mode: 'positive' },
        { id: 'r-energy', key: 'radius', label: '半径', mode: 'positive' }
    ],
    radius: [
        { id: 'age-radius', key: 'age', label: '儿童年龄', mode: 'nonNegative' }
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

    if (rawValue === '') {
        return { error: `请输入${fieldConfig.label}` };
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
        return { error: `${fieldConfig.label}必须为数字` };
    }

    if (fieldConfig.mode === 'positive' && value <= 0) {
        return { error: `${fieldConfig.label}必须大于 0` };
    }

    if (fieldConfig.mode === 'nonNegative' && value < 0) {
        return { error: `${fieldConfig.label}不能为负数` };
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

    setResultState('power', 'normal', '已根据当前输入计算输出功率与功率密度。');
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

    setResultState('energy', 'normal', '已根据当前输入计算能量密度。');
    revealResult('energy');
}

function runRadiusCalculator(values) {
    const predictedDiameter = predictAP(values.age);
    const predictedRadius = predictedDiameter / 2 / 10;
    const outOfRange = values.age < AGE_RANGE.min || values.age > AGE_RANGE.max;

    document.getElementById('radius-value').textContent = predictedRadius.toFixed(2);

    if (outOfRange) {
        setResultState(
            'radius',
            'warning',
            `当前年龄超出 ${AGE_RANGE.min}-${AGE_RANGE.max} 月龄模型范围，结果属于模型外推，仅供参考。`
        );
    } else {
        setResultState('radius', 'normal', '结果为预测照射半径，单位为 cm。');
    }

    revealResult('radius');
}

function runCalculator(calculatorKey) {
    const validationResult = validateFields(calculatorKey);

    if (validationResult.firstInvalidInput) {
        setResultState(calculatorKey, 'error', '请修正标红字段后重新计算。');
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

activateTab('power');
