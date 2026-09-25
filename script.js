// Variables de estado
let currentInput = '0';
let expression = '';
let isDegreeMode = true;
let memoryValue = 0;
let resetScreen = false;

// Elementos DOM
const lcdMain = document.getElementById('lcd-main');
const lcdHistory = document.getElementById('lcd-history');
const degIndicator = document.getElementById('deg-indicator');
const radIndicator = document.getElementById('rad-indicator');
const memIndicator = document.getElementById('mem-indicator');
const btnDegRad = document.getElementById('btn-deg-rad');

// Actualizar la pantalla de la calculadora
function updateDisplay() {
  lcdMain.textContent = currentInput;
  lcdHistory.innerHTML = expression || '&nbsp;';
}

// Alternar entre DEG y RAD
function toggleAngleMode() {
  isDegreeMode = !isDegreeMode;
  if (isDegreeMode) {
    degIndicator.classList.add('active');
    radIndicator.classList.remove('active');
    btnDegRad.textContent = 'DEG';
  } else {
    radIndicator.classList.add('active');
    degIndicator.classList.remove('active');
    btnDegRad.textContent = 'RAD';
  }
}

// Funciones de memoria (MC, MR, M+, M-)
function handleMemory(action) {
  let val = parseFloat(currentInput) || 0;
  switch (action) {
    case 'MC':
      memoryValue = 0;
      memIndicator.classList.add('hidden');
      break;
    case 'MR':
      currentInput = memoryValue.toString();
      resetScreen = true;
      break;
    case 'M+':
      memoryValue += val;
      memIndicator.classList.remove('hidden');
      resetScreen = true;
      break;
    case 'M-':
      memoryValue -= val;
      memIndicator.classList.remove('hidden');
      resetScreen = true;
      break;
  }
  updateDisplay();
}

// Agregar número
function appendNumber(num) {
  if (currentInput === '0' || resetScreen) {
    currentInput = num;
    resetScreen = false;
  } else {
    currentInput += num;
  }
  updateDisplay();
}

// Agregar punto decimal
function appendDecimal() {
  if (resetScreen) {
    currentInput = '0.';
    resetScreen = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

// Agregar operadore básico (+, -, *, /)
function appendOp(op) {
  expression += currentInput + ' ' + op + ' ';
  resetScreen = true;
  updateDisplay();
}

// Agregar funciones matemáticas (sin, cos, tan, log, etc.)
function appendFunc(func) {
  expression += func;
  resetScreen = false;
  updateDisplay();
}

// Agregar símbolos (parentesis, pi, exponentes)
function appendSymbol(sym) {
  if (currentInput !== '0' && !resetScreen && sym !== '(') {
    expression += currentInput + sym;
  } else {
    expression += sym;
  }
  resetScreen = true;
  updateDisplay();
}

// Cambiar signo (+/-)
function toggleSign() {
  if (currentInput !== '0') {
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay();
  }
}

// Borrar todo (AC)
function clearAll() {
  currentInput = '0';
  expression = '';
  resetScreen = false;
  updateDisplay();
}

// Borrar último dígito (DEL)
function deleteLast() {
  if (resetScreen) return;
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
}

// Calcular resultado
function calculateResult() {
  try {
    let fullExpr = expression + currentInput;
    let parsedExpr = prepareExpression(fullExpr);

    // Evaluación matemática
    let result = new Function(`return ${parsedExpr}`)();

    if (isNaN(result) || !isFinite(result)) {
      currentInput = 'Error';
    } else {
      // Redondear para evitar problemas de precisión flotante en JS
      currentInput = Number(Math.round(result + 'e10') + 'e-10').toString();
    }
    expression = '';
    resetScreen = true;
  } catch (err) {
    currentInput = 'Error';
    resetScreen = true;
  }
  updateDisplay();
}

// Traducir símbolos a funciones Math de JavaScript
function prepareExpression(expr) {
  let formatted = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/\^2/g, '**2')
    .replace(/\^/g, '**');

  const angleFactor = isDegreeMode ? '(Math.PI/180)*' : '';

  formatted = formatted.replace(/sin\(/g, `Math.sin(${angleFactor}`);
  formatted = formatted.replace(/cos\(/g, `Math.cos(${angleFactor}`);
  formatted = formatted.replace(/tan\(/g, `Math.tan(${angleFactor}`);
  formatted = formatted.replace(/sqrt\(/g, 'Math.sqrt(');
  formatted = formatted.replace(/log\(/g, 'Math.log10(');
  formatted = formatted.replace(/ln\(/g, 'Math.log(');

  return formatted;
}

// Soporte para entrada con Teclado
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
  else if (e.key === '.') appendDecimal();
  else if (e.key === '+') appendOp('+');
  else if (e.key === '-') appendOp('-');
  else if (e.key === '*') appendOp('*');
  else if (e.key === '/') {
    e.preventDefault();
    appendOp('/');
  }
  else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculateResult();
  }
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '(' || e.key === ')') appendSymbol(e.key);
  else if (e.key === '^') appendSymbol('^');
});