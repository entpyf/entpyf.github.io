// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
    });
});

// 功率计算函数
// OP = (Ed / Time) * Lg * R * 6280
function fastpower(Ed, Lg, Time, R = 0.5) {
    return (Ed / Time) * Lg * R * 6280;
}

// 能量密度计算函数
// Ed = OP / (Lg * R * 6280) * Time
function fastenergy(OP, Lg, Time, R = 0.5) {
    return (OP / (Lg * R * 6280)) * Time;
}

// 照射半径预测函数 (基于线性回归)
// AP = intercept + slope × age
function predictAP(age) {
    const intercept = 4.90664022719264;
    const slope = 0.0469951024357361;
    return intercept + slope * age;
}

// 计算功率
function calculatePower() {
    const Ed = parseFloat(document.getElementById('ed-power').value) || 0;
    const Lg = parseFloat(document.getElementById('lg-power').value) || 0;
    const Time = parseFloat(document.getElementById('time-power').value) || 0;
    const R = parseFloat(document.getElementById('r-power').value) || 0.5;

    if (Time === 0) {
        alert('照射时间不能为 0');
        return;
    }

    if (Lg === 0 || R === 0) {
        alert('光纤长度和半径不能为 0');
        return;
    }

    const OP = fastpower(Ed, Lg, Time, R);
    
    // 功率密度 = 输出功率 / 照射面积
    // 照射面积 = 2 * π * R * Lg (圆柱表面积)
    const area = 2 * Math.PI * R * Lg;
    const powerDensity = OP / area;

    document.getElementById('power-value').textContent = OP.toFixed(2);
    document.getElementById('power-density-value').textContent = powerDensity.toFixed(2);
    document.getElementById('power-result').classList.add('show');
}

// 计算能量密度
function calculateEnergy() {
    const OP = parseFloat(document.getElementById('op-energy').value) || 0;
    const Lg = parseFloat(document.getElementById('lg-energy').value) || 0;
    const Time = parseFloat(document.getElementById('time-energy').value) || 0;
    const R = parseFloat(document.getElementById('r-energy').value) || 0.5;

    if (Lg === 0 || R === 0) {
        alert('光纤长度和半径不能为 0');
        return;
    }

    const Ed = fastenergy(OP, Lg, Time, R);
    document.getElementById('energy-value').textContent = Ed.toFixed(2);
    document.getElementById('energy-result').classList.add('show');
}

// 预测照射半径
function calculateRadius() {
    const age = parseFloat(document.getElementById('age-radius').value) || 0;

    if (age < 0) {
        alert('年龄不能为负数');
        return;
    }

    const diameter = predictAP(age);  // 预测的是直径 (mm)
    const radius = diameter / 2 / 10;  // 半径 = 直径 / 2，再转换为 cm
    document.getElementById('radius-value').textContent = radius.toFixed(2);
    document.getElementById('radius-result').classList.add('show');
}

// Allow Enter key to trigger calculation
document.querySelectorAll('#power-tab input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculatePower();
    });
});

document.querySelectorAll('#energy-tab input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateEnergy();
    });
});

document.querySelectorAll('#radius-tab input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateRadius();
    });
});

