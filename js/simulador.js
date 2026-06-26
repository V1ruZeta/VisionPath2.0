/* =============================================================
   VISIONPATH — simulador.js
   Lógica completa del simulador de sensor ultrasónico
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ── Elementos del DOM ──────────────────────────────────────
    const slider        = document.getElementById('distanceSlider');
    const distanceValue = document.getElementById('distanceValue');
    const statusBox     = document.getElementById('statusBox');
    const vibLevel      = document.getElementById('vibrationLevel');
    const sensorMsg     = document.getElementById('sensorMessage');
    const stickIcon     = document.querySelector('.stick-icon');
    const obstacle      = document.querySelector('.obstacle');
    const vDots         = document.querySelectorAll('.vdot');
    const distLine      = document.querySelector('.distance-line');
    const distLabelSc   = document.querySelector('.distance-label-scene');
    const waves         = document.querySelectorAll('.wave');

    if (!slider) return;

    // ── Constantes de zonas ─────────────────────────────────────
    const ZONES = {
        safe:    { min: 60,  max: 100, label: '🟢 Zona Segura',           msg: 'El usuario puede desplazarse con normalidad.', color: 'safe' },
        warning: { min: 30,  max: 59,  label: '🟡 Precaución — Obstáculo Cercano', msg: 'Vibración moderada. Reduzca la velocidad.', color: 'warning' },
        danger:  { min: 5,   max: 29,  label: '🔴 Peligro — ¡Obstáculo Inmediato!', msg: 'Vibración intensa. Deténgase de inmediato.', color: 'danger' },
    };

    // ── Estado de la animación de vibración ────────────────────
    let vibInterval = null;
    let activeDots  = 0;

    // ── Función principal: actualizar todo al mover el slider ──
    function updateSimulator(rawValue) {
        const dist  = parseInt(rawValue, 10);
        const pct   = ((dist - 5) / 95) * 100; // 0–100% (5cm → 100cm)

        // Determinar zona
        let zone;
        if      (dist >= 60) zone = ZONES.safe;
        else if (dist >= 30) zone = ZONES.warning;
        else                 zone = ZONES.danger;

        // ── 1. Número de distancia ──
        distanceValue.textContent = dist;
        distanceValue.className   = 'value ' + zone.color;

        // ── 2. Status box ──
        statusBox.textContent = zone.label;
        statusBox.className   = 'status-box ' + zone.color;

        // ── 3. Mensaje del sensor ──
        sensorMsg.textContent = zone.msg;

        // ── 4. Barra de vibración (inversa: más cerca = más vibración) ──
        const vibPct = Math.max(0, Math.min(100, 100 - pct));
        vibLevel.style.width = vibPct + '%';

        if (zone.color === 'safe') {
            vibLevel.style.background = 'linear-gradient(90deg, #22c55e, #38bdf8)';
        } else if (zone.color === 'warning') {
            vibLevel.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        } else {
            vibLevel.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }

        // ── 5. Puntos de vibración (dots) ──
        const totalDots = vDots.length;
        activeDots = Math.round((vibPct / 100) * totalDots);
        vDots.forEach((dot, i) => {
            dot.className = 'vdot';
            if (i < activeDots) {
                dot.classList.add('active-' + zone.color);
            }
        });

        // ── 6. Animación del bastón ──
        if (stickIcon) {
            stickIcon.className = 'stick-icon';
            if (zone.color === 'warning') {
                stickIcon.classList.add('vibrating');
            } else if (zone.color === 'danger') {
                stickIcon.classList.add('vibrating-strong');
            }
        }

        // ── 7. Posición del obstáculo en la escena ──
        if (obstacle) {
            const minRight = 10;
            const maxRight = 60;
            // Más cercano = más a la izquierda (menor right%)
            const rightPct = maxRight - (pct * (maxRight - minRight) / 100);
            obstacle.style.right = rightPct + '%';

            // Color del obstáculo según peligrosidad
            if (zone.color === 'danger') {
                obstacle.style.filter = 'drop-shadow(0 0 14px rgba(239,68,68,0.9))';
            } else if (zone.color === 'warning') {
                obstacle.style.filter = 'drop-shadow(0 0 10px rgba(245,158,11,0.7))';
            } else {
                obstacle.style.filter = 'drop-shadow(0 0 4px rgba(56,189,248,0.2))';
            }
        }

        // ── 8. Línea de distancia en la escena ──
        updateDistanceLine(dist, zone.color);

        // ── 9. Velocidad de las ondas del sensor ──
        updateWaveSpeed(zone.color);
    }

    // ── Línea de distancia visual ──────────────────────────────
    function updateDistanceLine(dist, color) {
        if (!distLine || !distLabelSc || !obstacle || !stickIcon) return;

        const scene       = document.querySelector('.simulation-scene');
        if (!scene) return;

        const sceneW      = scene.offsetWidth;
        const stickLeft   = sceneW * 0.12 + 50;
        const pct         = ((dist - 5) / 95);
        const minRight    = sceneW * 0.10;
        const maxRight    = sceneW * 0.60;
        const obsRight    = maxRight - pct * (maxRight - minRight);
        const obsLeft     = sceneW - obsRight - 20;

        const lineLeft    = stickLeft;
        const lineWidth   = Math.max(0, obsLeft - lineLeft);

        distLine.style.left  = lineLeft + 'px';
        distLine.style.width = lineWidth + 'px';

        // Color de la línea
        const lineColors = { safe: 'rgba(34,197,94,0.3)', warning: 'rgba(245,158,11,0.3)', danger: 'rgba(239,68,68,0.4)' };
        distLine.style.borderColor = lineColors[color] || 'rgba(56,189,248,0.3)';

        // Label en el centro de la línea
        distLabelSc.style.left  = (lineLeft + lineWidth / 2) + 'px';
        distLabelSc.style.transform = 'translateX(-50%)';
        distLabelSc.textContent = dist + ' cm';
    }

    // ── Velocidad de las ondas del sensor ──────────────────────
    function updateWaveSpeed(zone) {
        const durations = { safe: '2s', warning: '1.1s', danger: '0.55s' };
        const dur = durations[zone] || '2s';
        waves.forEach(w => {
            w.style.animationDuration = dur;
        });
    }

    // ── Evento del slider ──────────────────────────────────────
    slider.addEventListener('input', () => {
        updateSimulator(slider.value);
    });

    // ── Animación automática de demo al cargar ─────────────────
    let autoMode    = false;
    let autoDir     = -1;
    let autoVal     = 100;
    let autoTimer   = null;

    function runAutoDemo() {
        autoVal += autoDir * 0.8;
        if (autoVal <= 5)   { autoVal = 5;   autoDir = 1; }
        if (autoVal >= 100) { autoVal = 100;  autoDir = -1; }
        slider.value = autoVal;
        updateSimulator(autoVal);
    }

    const autoBtn = document.getElementById('autoBtn');
    if (autoBtn) {
        autoBtn.addEventListener('click', () => {
            autoMode = !autoMode;
            if (autoMode) {
                autoBtn.textContent = '⏹ Detener demo';
                autoBtn.classList.add('btn-secondary');
                autoBtn.classList.remove('btn-primary');
                autoTimer = setInterval(runAutoDemo, 30);
            } else {
                clearInterval(autoTimer);
                autoBtn.textContent = '▶ Demo automática';
                autoBtn.classList.add('btn-primary');
                autoBtn.classList.remove('btn-secondary');
            }
        });
    }

    // ── Botón de reset ─────────────────────────────────────────
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (autoMode && autoTimer) {
                clearInterval(autoTimer);
                autoMode = false;
                if (autoBtn) {
                    autoBtn.textContent = '▶ Demo automática';
                    autoBtn.classList.add('btn-primary');
                    autoBtn.classList.remove('btn-secondary');
                }
            }
            slider.value = 100;
            updateSimulator(100);
        });
    }

    // ── Inicializar ────────────────────────────────────────────
    updateSimulator(slider.value);

    // Actualizar línea al redimensionar
    window.addEventListener('resize', () => {
        updateSimulator(slider.value);
    }, { passive: true });

});
