const body = document.body;
const demoButton = document.querySelector('#demoButton');
const buttonLabel = document.querySelector('.button-label');
const buttonLabelInput = document.querySelector('#buttonLabelInput');

/* Every slider maps 1:1 onto a custom property on #demoButton, so the CSS
   stays the single source of truth and "reset" just drops the inline styles. */
const RANGES = [
  { id: 'buttonRadius',  prop: '--button-radius',  unit: 'px'  },
  { id: 'shineWidth',    prop: '--shine-width',    unit: '%'   },
  { id: 'shineStart',    prop: '--shine-start',    unit: '%'   },
  { id: 'shineTravel',   prop: '--shine-travel',   unit: '%'   },
  { id: 'shineSkew',     prop: '--shine-skew',     unit: 'deg' },
  { id: 'shineDuration', prop: '--shine-duration', unit: 'ms'  },
  { id: 'shineDelay',    prop: '--shine-delay',    unit: 'ms'  },
  { id: 'shineOpacity',  prop: '--shine-opacity',  unit: '%'   },
  { id: 'traceWidth',    prop: '--trace-width',    unit: 'px'  },
  { id: 'traceArc',      prop: '--trace-arc',      unit: 'deg' },
  { id: 'traceFade',     prop: '--trace-fade',     unit: 'deg' },
  { id: 'traceDuration', prop: '--trace-duration', unit: 'ms'  },
  { id: 'traceInset',    prop: '--trace-inset',    unit: 'px'  },
  { id: 'traceOpacity',  prop: '--trace-opacity',  unit: '%'   },
];

/* Tint pickers fall back to the button's own label colour when "match" is on. */
const TINTS = [
  { colorId: 'shineTint', autoId: 'shineTintAuto', prop: '--shine-tint' },
  { colorId: 'traceTint', autoId: 'traceTintAuto', prop: '--trace-tint' },
];

const AUTO_TINT = 'var(--button-ink)';
const el = id => document.querySelector(`#${id}`);
const defaults = new Map();

/* ------------------------------------------------------------- sliders */

RANGES.forEach(({ id, prop, unit }) => {
  const input = el(id);
  const output = input.closest('.range-row').querySelector('output');
  defaults.set(id, input.value);

  const apply = () => {
    demoButton.style.setProperty(prop, input.value + unit);
    output.textContent = input.value + unit;
  };
  input.addEventListener('input', apply);
  apply();
});

/* --------------------------------------------------------------- tints */

TINTS.forEach(({ colorId, autoId, prop }) => {
  const color = el(colorId);
  const auto = el(autoId);
  defaults.set(colorId, color.value);
  defaults.set(autoId, auto.checked);

  const apply = () => {
    color.disabled = auto.checked;
    demoButton.style.setProperty(prop, auto.checked ? AUTO_TINT : color.value);
  };
  color.addEventListener('input', apply);
  auto.addEventListener('change', apply);
  apply();
});

/* ------------------------------------------------- layer on/off + direction */

const layerToggle = (id, key) => {
  const input = el(id);
  defaults.set(id, input.checked);
  const apply = () => { body.dataset[key] = input.checked ? 'on' : 'off'; };
  input.addEventListener('change', apply);
  apply();
};
layerToggle('shineOn', 'shine');
layerToggle('traceOn', 'trace');

const traceReverse = el('traceReverse');
defaults.set('traceReverse', traceReverse.checked);
const applyDirection = () =>
  demoButton.style.setProperty('--trace-direction', traceReverse.checked ? 'reverse' : 'normal');
traceReverse.addEventListener('change', applyDirection);
applyDirection();

/* ------------------------------------------------------ theme + family */

let labelIsCustom = false;

function select(group, value) {
  body.dataset[group] = value;
  document.querySelectorAll(`[data-${group}-choice]`).forEach(button => {
    const selected = button.dataset[`${group}Choice`] === value;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
  if (group === 'button' && !labelIsCustom) {
    const defaultLabel = ({
      primary: 'Primary', secondary: 'Secondary', 'accent-one': 'Accent', 'accent-two': 'Accent',
    })[value];
    setLabel(defaultLabel);
    buttonLabelInput.value = defaultLabel;
  }
}

function setLabel(text) {
  buttonLabel.textContent = text;
  demoButton.setAttribute('aria-label', text);
}

['theme', 'button'].forEach(group =>
  document.querySelectorAll(`[data-${group}-choice]`).forEach(button => {
    button.addEventListener('click', () => select(group, button.dataset[`${group}Choice`]));
  }));

buttonLabelInput.addEventListener('input', () => {
  labelIsCustom = buttonLabelInput.value.trim() !== '';
  setLabel(buttonLabelInput.value.trim() || 'Button');
});

/* ------------------------------------------------------------ interaction */

/* Clicking replays the sweep: kill the animation for a frame, then let the
   hover/focus rule reapply it from the top. */
demoButton.addEventListener('click', () => {
  demoButton.classList.add('replay');
  void demoButton.offsetWidth;
  demoButton.classList.remove('replay');
});

/* ------------------------------------------------------- reset + export */

el('resetButton').addEventListener('click', () => {
  defaults.forEach((value, id) => {
    const input = el(id);
    if (input.type === 'checkbox') input.checked = value;
    else input.value = value;
    input.dispatchEvent(new Event(input.type === 'range' ? 'input' : 'change'));
  });
  el('shineTint').dispatchEvent(new Event('input'));
  el('traceTint').dispatchEvent(new Event('input'));
  setStatus('Defaults restored');
});

function currentCss() {
  const lines = RANGES.map(({ prop, unit, id }) => `  ${prop}: ${el(id).value}${unit};`);
  TINTS.forEach(({ prop, colorId, autoId }) =>
    lines.push(`  ${prop}: ${el(autoId).checked ? AUTO_TINT : el(colorId).value};`));
  lines.push(`  --trace-direction: ${traceReverse.checked ? 'reverse' : 'normal'};`);
  return `.demo-button {\n${lines.join('\n')}\n}`;
}

let statusTimer;
function setStatus(message) {
  const status = el('copyStatus');
  status.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { status.textContent = ''; }, 2400);
}

el('copyButton').addEventListener('click', async () => {
  const css = currentCss();
  try {
    await navigator.clipboard.writeText(css);
    setStatus('Copied to clipboard');
  } catch {
    console.log(css);
    setStatus('Clipboard blocked — logged to console');
  }
});
