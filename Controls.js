function initMobileControls() {
    // Detectar dispositivo mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    if (!isMobile) {
        document.querySelector('.mobile-controls').style.display = 'none';
        return;
    }

    mobileControls.enabled = true;

    // Joystick Virtual
    setupJoystick();

    // Look Around (toque na direita)
    setupLookControls();

    // Botões de Ação
    setupActionButtons();

    // Auto-lock ao iniciar
    controls.locked = true;
}

function setupJoystick() {
    const joystick = document.getElementById('mobile-joystick');
    const stick = document.getElementById('joystick-stick');
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxDistance = 35;

    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.joystick.active = true;
    });

    joystick.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!mobileControls.joystick.active) return;

        const touch = e.touches[0];
        const rect = joystick.getBoundingClientRect();

        let dx = touch.clientX - rect.left - centerX;
        let dy = touch.clientY - rect.top - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxDistance;
            dy = Math.sin(angle) * maxDistance;
        }

        stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // Normalizar valores (-1 a 1)
        mobileControls.joystick.x = dx / maxDistance;
        mobileControls.joystick.y = dy / maxDistance;

        // Simular teclas WASD
        keys['KeyW'] = mobileControls.joystick.y < -0.3;
        keys['KeyS'] = mobileControls.joystick.y > 0.3;
        keys['KeyA'] = mobileControls.joystick.x < -0.3;
        keys['KeyD'] = mobileControls.joystick.x > 0.3;
    });

    joystick.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.joystick.active = false;
        mobileControls.joystick.x = 0;
        mobileControls.joystick.y = 0;

        stick.style.transform = 'translate(-50%, -50%)';

        keys['KeyW'] = false;
        keys['KeyS'] = false;
        keys['KeyA'] = false;
        keys['KeyD'] = false;
    });
}

function setupLookControls() {
    const lookArea = document.getElementById('mobile-look');
    let lastTouchX = 0;
    let lastTouchY = 0;

    lookArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        mobileControls.look.active = true;

        // Indicador visual
        showTouchIndicator(touch.clientX, touch.clientY);
    });

    lookArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!mobileControls.look.active) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchX;
        const deltaY = touch.clientY - lastTouchY;

        // Sensibilidade ajustada para mobile
        const sensitivity = 0.003;
        mouse.x -= deltaX * sensitivity;
        mouse.y -= deltaY * sensitivity;
        mouse.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouse.y));

        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    });

    lookArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.look.active = false;
    });
}

function setupActionButtons() {
    // Pular
    const jumpBtn = document.getElementById('mobile-jump');
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['Space'] = true;
        jumpBtn.classList.add('active');
    });
    jumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['Space'] = false;
        jumpBtn.classList.remove('active');
    });

    // Quebrar bloco
    const breakBtn = document.getElementById('mobile-break');
    breakBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMouseDown({ button: 0 });
        breakBtn.classList.add('active');
    });
    breakBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleMouseUp({ button: 0 });
        breakBtn.classList.remove('active');
    });

    // Colocar bloco
    const placeBtn = document.getElementById('mobile-place');
    placeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMouseDown({ button: 2 });
        placeBtn.classList.add('active');
    });
    placeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleMouseUp({ button: 2 });
        placeBtn.classList.remove('active');
    });

    // Modo voo
    const flyBtn = document.getElementById('mobile-fly');
    flyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        player.flying = !player.flying;
        document.getElementById('mode').textContent = player.flying ? 'Voo' : 'Normal';
        flyBtn.classList.toggle('active', player.flying);
    });

    // Inventário
    const invBtn = document.getElementById('mobile-inventory');
    invBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleFullInventory();
    });

    // Sprint
    const sprintBtn = document.getElementById('mobile-sprint');
    sprintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ShiftLeft'] = true;
        sprintBtn.classList.add('active');
    });
    sprintBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ShiftLeft'] = false;
        sprintBtn.classList.remove('active');
    });


    const prevSlotBtn = document.getElementById('mobile-prev-slot');
    if (prevSlotBtn) {
        prevSlotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newSlot = (player.selectedSlot - 1 + player.hotbarSlots) % player.hotbarSlots;
            selectSlot(newSlot);
        });
    }

// Próximo slot
    const nextSlotBtn = document.getElementById('mobile-next-slot');
    if (nextSlotBtn) {
        nextSlotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newSlot = (player.selectedSlot + 1) % player.hotbarSlots;
            selectSlot(newSlot);
        });
    }


}

function showTouchIndicator(x, y) {
    const indicator = document.createElement('div');
    indicator.className = 'touch-indicator';
    indicator.style.left = x + 'px';
    indicator.style.top = y + 'px';
    document.body.appendChild(indicator);

    setTimeout(() => {
        indicator.remove();
    }, 300);
}
