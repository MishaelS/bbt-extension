/**
 * webview/kitten/logic.ts
 * Kitten animation that responds to keyboard input.
 * Uses Finite State Machine for smooth animation.
*/
export function getKittenLogic(): string
{
    return `

/*
    CONSTANTS
*/

const FRAME = {
    idle     : 'bongo_both_up.svg',
    left     : 'bongo_right_down.svg',
    right    : 'bongo_left_down.svg',
    both     : 'bongo_both_down.svg',
    sleeping : 'bongo_sleeping.svg'
};

const STATE = {
    IDLE     : 'idle',
    LEFT_HIT : 'left_hit',
    RIGHT_HIT: 'right_hit',
    BOTH_HIT : 'both_hit',
    SLEEPING : 'sleeping'
};

// Frame duration ms — lower = snappier response
const HIT_DURATION = 80;

/*
    STATE
*/

let _container    = null;
let _img          = null;
let _state        = STATE.IDLE;
let _enabled      = true;
let _timer        = null;
let _isHovered    = false;
let _activeKeys   = new Set(); // Track currently pressed keys

// Pre-built src strings (set once in initKitten, never rebuilt on every keystroke)
const _src = { idle: '', left: '', right: '', both: '', sleeping: '' };

// Key -> hand lookup (Set is O(1) vs Array.indexOf O(n))
const LEFT_KEYS = new Set([
    '1','2','3','4','5',
    'q','w','e','r','t','a','s','d','f','g','z','x','c','v','b',
    'й','ц','у','к','е','ф','ы','в','а','п','я','ч','с','м','и',
    ' ','tab','shift','control','alt','meta'
]);

const RIGHT_KEYS = new Set([
    '6','7','8','9','0','-','=',
    'y','u','i','o','p','[',']','h','j','k','l','n','m',
    'н','г','ш','щ','з','х','ъ','р','о','л','д','ж','э','т','ь','б','ю','.',
    'enter','backspace','delete'
]);

function detectHand(key)
{
    if (!key) return 'left';
    const k = key.toLowerCase();
    if (LEFT_KEYS.has(k))  return 'left';
    if (RIGHT_KEYS.has(k)) return 'right';
    // Digits fallback
    if (k.length === 1 && k >= '0' && k <= '9')
        return parseInt(k) <= 5 ? 'left' : 'right';
    return 'left';
}

/*
    FSM
*/

function setFrame(key)
{
    if (_img && _src[key]) _img.src = _src[key];
}

function cancelTimer()
{
    if (_timer) { clearTimeout(_timer); _timer = null; }
}

function enterState(next)
{
    if (_state === next) return;
    cancelTimer();
    _state = next;

    switch (next) {
        case STATE.IDLE:
            setFrame(_isHovered ? 'sleeping' : 'idle');
            break;
        case STATE.SLEEPING:
            setFrame('sleeping');
            break;
        case STATE.LEFT_HIT:
            setFrame('left');
            _timer = setTimeout(function() { 
                // Only return to IDLE if we're still in LEFT_HIT and no other keys are pressed
                if (_state === STATE.LEFT_HIT && _activeKeys.size === 0) {
                    enterState(STATE.IDLE);
                }
            }, HIT_DURATION);
            break;
        case STATE.RIGHT_HIT:
            setFrame('right');
            _timer = setTimeout(function() { 
                if (_state === STATE.RIGHT_HIT && _activeKeys.size === 0) {
                    enterState(STATE.IDLE);
                }
            }, HIT_DURATION);
            break;
        case STATE.BOTH_HIT:
            setFrame('both');
            _timer = setTimeout(function() { 
                if (_state === STATE.BOTH_HIT && _activeKeys.size < 2) {
                    enterState(STATE.IDLE);
                }
            }, HIT_DURATION);
            break;
    }
}

// Keystroke handler (shared for webview keydown + extension messages)
function handleHand(hand)
{
    if (!_enabled) return;

    // Cancel any pending timer
    cancelTimer();

    // Count active keys
    const activeCount = _activeKeys.size;

    // Determine what to show based on active key count
    if (activeCount >= 2) {
        // Two or more keys pressed -> both hands
        if (_state !== STATE.BOTH_HIT) {
            enterState(STATE.BOTH_HIT);
        }
    } else if (activeCount === 1) {
        // Single key pressed -> show appropriate hand
        // Get the first (and only) active key
        const firstKey = _activeKeys.values().next().value;
        const handType = detectHand(firstKey);
        
        if (handType === 'left' && _state !== STATE.LEFT_HIT) {
            enterState(STATE.LEFT_HIT);
        } else if (handType === 'right' && _state !== STATE.RIGHT_HIT) {
            enterState(STATE.RIGHT_HIT);
        }
    } else {
        // No keys pressed -> idle
        if (_state !== STATE.IDLE) {
            enterState(STATE.IDLE);
        }
    }
}

// Track keydown
function onKeyDown(event)
{
    const key = event.key;
    if (!key || key === '') return;

    // Add to active set
    _activeKeys.add(key);

    // Handle the keystroke
    handleHand(detectHand(key));
}

// Track keyup
function onKeyUp(event)
{
    const key = event.key;
    if (!key || key === '') return;

    // Remove from active set
    _activeKeys.delete(key);

    // Re-evaluate what to show
    const activeCount = _activeKeys.size;

    if (activeCount >= 2) {
        // Still have 2+ keys -> keep both
        if (_state !== STATE.BOTH_HIT) {
            enterState(STATE.BOTH_HIT);
        }
    } else if (activeCount === 1) {
        // One key left -> show its hand
        const firstKey = _activeKeys.values().next().value;
        const handType = detectHand(firstKey);

        if (handType === 'left' && _state !== STATE.LEFT_HIT) {
            enterState(STATE.LEFT_HIT);
        } else if (handType === 'right' && _state !== STATE.RIGHT_HIT) {
            enterState(STATE.RIGHT_HIT);
        }
    } else {
        // No keys left -> idle
        enterState(STATE.IDLE);
    }
}

/*
    DOM creation
*/

let _created = false;

function createFloatingKitten()
{
    if (_created) return;
    if (!window._kittenResourcePath) return;
    if (document.getElementById('bbt-kitten')) return;

    // Pre-build src strings once
    const base = window._kittenResourcePath;
    _src.idle     = base + '/' + FRAME.idle;
    _src.left     = base + '/' + FRAME.left;
    _src.right    = base + '/' + FRAME.right;
    _src.both     = base + '/' + FRAME.both;
    _src.sleeping = base + '/' + FRAME.sleeping;

    const container = document.createElement('div');
    container.id        = 'bbt-kitten';
    container.className = 'kitten-floating';

    const img = document.createElement('img');
    img.className = 'kitten-image';
    img.alt       = '🐱';
    img.title     = 'Byte Bit Kitten 🎵';
    img.src       = _src.idle;

    // Hover -> sleeping frame (no meow)
    img.addEventListener('mouseenter', function() {
        _isHovered = true;
        if (_state === STATE.IDLE) setFrame('sleeping');
    });

    img.addEventListener('mouseleave', function() {
        _isHovered = false;
        if (_state === STATE.IDLE) setFrame('idle');
    });

    // Click -> meow only
    img.addEventListener('click', function() {
        const bubble = document.createElement('div');
        bubble.className = 'kitten-meow';
        bubble.textContent = 'meow!';
        container.appendChild(bubble);
        setTimeout(function() { bubble.remove(); }, 500);
    });

    container.appendChild(img);
    document.body.appendChild(container);

    _container = container;
    _img       = img;
    _created   = true;

    // Key events
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

/*
    Public API
*/

function initKitten(resourcePath)
{
    window._kittenResourcePath = resourcePath || '';
    createFloatingKitten();
}

function setKittenEnabled(enabled)
{
    _enabled = enabled;
    if (_container) _container.style.display = enabled ? 'flex' : 'none';
}

/*
    VS Code message bus
*/

window.addEventListener('message', function(event) {
    const msg = event.data;
    if (!msg) return;

    if (msg.type === 'settings') {
        if (msg.kittenResourcePath) initKitten(msg.kittenResourcePath);
        if (typeof msg.kittenEnabled === 'boolean') setKittenEnabled(msg.kittenEnabled);
        return;
    }

    if (msg.type === 'kitten_keystroke') {
        // For external keystrokes (from extension), we need to simulate keydown/keyup
        const hand = msg.hand;
        if (!hand) return;

        // For now, just handle single key events from extension
        // This is a simplified path - extension sends one hand at a time
        if (_activeKeys.size === 0) {
            // Simulate a single key press
            if (hand === 'left') {
                enterState(STATE.LEFT_HIT);
                // Auto-clear after duration
                setTimeout(function() {
                    if (_state === STATE.LEFT_HIT) {
                        enterState(STATE.IDLE);
                    }
                }, HIT_DURATION);
            } else if (hand === 'right') {
                enterState(STATE.RIGHT_HIT);
                setTimeout(function() {
                    if (_state === STATE.RIGHT_HIT) {
                        enterState(STATE.IDLE);
                    }
                }, HIT_DURATION);
            }
        }
    }
});

    `;
}