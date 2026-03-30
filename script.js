// script.js
let displayValue = '0';
let previousValue = '';
let operator = '';
let scientificMode = false;

// Fake live currency rates (base: USD)
const currencyRates = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.5, INR: 83.2,
    AUD: 1.51, CAD: 1.39, CNY: 7.25, BRL: 5.65, RUB: 97.4
};
const currencies = Object.keys(currencyRates);

// Unit conversion data
const units = {
    length: { m: 1, cm: 0.01, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
    weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495, ton: 1000 },
    volume: { l: 1, ml: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176 },
    area: { m2: 1, cm2: 0.0001, km2: 1000000, ha: 10000, acre: 4046.86 },
    time: { s: 1, min: 60, h: 3600, day: 86400 },
    data: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 }
};

// Initialize everything
$(document).ready(function () {
    renderCalculator();
    renderCurrencySelectors();
    renderTipButtons();
    loadUnits();
    renderMoreTools();
    console.log('%c🧮 Smart Calculator Web ready!', 'color:#00d4ff;font-weight:bold');
});

// Calculator
function renderCalculator() {
    const buttons = [
        ['C', '±', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '−'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];
    if (scientificMode) {
        buttons.unshift(['sin', 'cos', 'tan', 'log', '√']);
    }
    let html = '';
    buttons.forEach(row => {
        html += '<div class="row g-2">';
        row.forEach(btn => {
            html += `<div class="col"><button onclick="handleCalcInput('${btn}')" class="calc-btn btn btn-outline-light w-100 ${btn === '=' ? 'btn-primary' : ''}">${btn}</button></div>`;
        });
        html += '</div>';
    });
    $('#calc-buttons').html(html);
}

function handleCalcInput(val) {
    const display = $('#calc-display');
    if (val === 'C') {
        displayValue = '0';
    } else if (val === '±') {
        displayValue = (parseFloat(displayValue) * -1).toString();
    } else if (val === '%') {
        displayValue = (parseFloat(displayValue) / 100).toString();
    } else if (['+', '−', '×', '÷'].includes(val)) {
        previousValue = displayValue;
        operator = val;
        displayValue = '0';
    } else if (val === '=') {
        if (operator) {
            let result = 0;
            const prev = parseFloat(previousValue);
            const curr = parseFloat(displayValue);
            if (operator === '+') result = prev + curr;
            else if (operator === '−') result = prev - curr;
            else if (operator === '×') result = prev * curr;
            else if (operator === '÷') result = prev / curr;
            displayValue = result.toString();
            operator = '';
        }
    } else if (['sin','cos','tan','log','√'].includes(val)) {
        let num = parseFloat(displayValue);
        if (val === 'sin') num = Math.sin(num * Math.PI / 180);
        else if (val === 'cos') num = Math.cos(num * Math.PI / 180);
        else if (val === 'tan') num = Math.tan(num * Math.PI / 180);
        else if (val === 'log') num = Math.log10(num);
        else if (val === '√') num = Math.sqrt(num);
        displayValue = num.toString();
    } else {
        if (displayValue === '0' && val !== '.') displayValue = val;
        else displayValue += val;
    }
    display.text(displayValue);
}

function toggleScientific() {
    scientificMode = !scientificMode;
    renderCalculator();
}

// Currency
function renderCurrencySelectors() {
    let html = '';
    currencies.forEach(cur => {
        html += `<option value="${cur}">${cur}</option>`;
    });
    $('#from-currency').html(html);
    $('#to-currency').html(html);
    $('#from-currency').val('USD');
    $('#to-currency').val('EUR');
    convertCurrency();
}

function convertCurrency() {
    const from = $('#from-currency').val();
    const to = $('#to-currency').val();
    const amount = parseFloat($('#from-amount').val()) || 0;
    const rate = currencyRates[to] / currencyRates[from];
    $('#to-amount').val((amount * rate).toFixed(4));
}

// Tip
function renderTipButtons() {
    const percents = [5, 10, 15, 18, 20, 25];
    let html = '';
    percents.forEach(p => {
        html += `<button onclick="setTipPercent(${p}); calculateTip()" class="btn btn-outline-light flex-fill">${p}%</button>`;
    });
    $('#tip-percent-buttons').html(html);
}

function setTipPercent(p) {
    $('#tip-slider').val(p);
}

function calculateTip() {
    const bill = parseFloat($('#bill-amount').val()) || 0;
    const percent = parseFloat($('#tip-slider').val());
    const people = parseFloat($('#people-count').val()) || 1;
    const tip = bill * (percent / 100);
    const total = bill + tip;
    const perPerson = total / people;
    $('#tip-amount').text('$' + tip.toFixed(2));
    $('#total-per-person').text('$' + perPerson.toFixed(2));
}

// Unit Converter
function loadUnits() {
    const category = $('#unit-category').val();
    const unitList = Object.keys(units[category]);
    let html = '';
    unitList.forEach(u => {
        html += `<option value="${u}">${u.toUpperCase()}</option>`;
    });
    $('#from-unit').html(html);
    $('#to-unit').html(html);
    $('#from-unit').val(unitList[0]);
    $('#to-unit').val(unitList[1] || unitList[0]);
    convertUnit();
}

function convertUnit() {
    const category = $('#unit-category').val();
    const fromUnit = $('#from-unit').val();
    const toUnit = $('#to-unit').val();
    const value = parseFloat($('#from-value').val()) || 0;
    const base = value / units[category][fromUnit];
    const result = base * units[category][toUnit];
    $('#to-value').val(result.toFixed(6));
}

// More Tools (Discount, GST, Loan, Date)
function renderMoreTools() {
    const tools = [
        { title: 'Discount', icon: '🏷️', func: 'showDiscount()' },
        { title: 'GST / Tax', icon: '📊', func: 'showGST()' },
        { title: 'Loan', icon: '🏦', func: 'showLoan()' },
        { title: 'Date Diff', icon: '📅', func: 'showDate()' }
    ];
    let html = '';
    tools.forEach(t => {
        html += `
        <div class="col-6 col-md-3">
            <div onclick="${t.func}" class="card bg-dark border-primary text-center h-100 p-4">
                <div class="fs-1 mb-3">${t.icon}</div>
                <h6>${t.title}</h6>
            </div>
        </div>`;
    });
    $('#more-tools-grid').html(html);
}

// Simple modals for extra tools (demo)
function showDiscount() {
    const price = prompt('Original Price?', '100');
    const disc = prompt('Discount %?', '15');
    const result = price * (1 - disc / 100);
    alert(`💰 Final Price after ${disc}% discount: $${parseFloat(result).toFixed(2)}`);
}
function showGST() {
    const price = prompt('Original Price?', '100');
    const gst = prompt('GST %?', '18');
    const result = price * (1 + gst / 100);
    alert(`📊 Total with ${gst}% GST: $${parseFloat(result).toFixed(2)}`);
}
function showLoan() {
    alert('🏦 Loan Calculator Demo:\nMonthly EMI calculated instantly in full version!');
}
function showDate() {
    alert('📅 Date Calculator Demo:\nDifference between two dates shown in days/weeks/months!');
}
