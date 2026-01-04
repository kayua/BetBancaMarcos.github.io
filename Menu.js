// Carregar configurações salvas
function loadSettings() {
    const saved = localStorage.getItem('minecraftSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(gameSettings, parsed);
            applySettings();
            updateSettingsUI();
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
    }
}

// Salvar configurações
function saveSettings() {
    localStorage.setItem('minecraftSettings', JSON.stringify(gameSettings));
    applySettings();
    showNotification('✅ Configurações salvas com sucesso!', 'success');
}

// Restaurar padrão
function resetSettings() {
    if (confirm('Deseja restaurar todas as configurações para o padrão?')) {
        localStorage.removeItem('minecraftSettings');
        location.reload();
    }
}

// Aplicar configurações ao jogo
function applySettings() {
    // Gráficos
    if (gameSettings.graphics.shadows) {
        renderer.shadowMap.enabled = true;
    } else {
        renderer.shadowMap.enabled = false;
    }

    if (gameSettings.graphics.fog) {
        scene.fog = new THREE.Fog(0x87CEEB, 60, 120);
    } else {
        scene.fog = null;
    }

    // Distância de renderização
    if (typeof RENDER_DISTANCE !== 'undefined') {
        // Atualizar chunks se mudou
        const newDistance = parseInt(gameSettings.graphics.renderDistance);
        if (newDistance !== RENDER_DISTANCE) {
            // Recarregar chunks
            updateVisibleChunks();
        }
    }

    // Dificuldade
    switch(gameSettings.gameplay.difficulty) {
        case 'peaceful':
            // Remover todos os inimigos
            enemies.forEach(e => e.remove());
            enemies = [];
            break;
        case 'easy':
            // Reduzir dano
            enemyTypes.zombie.damage = 2;
            enemyTypes.skeleton.damage = 1;
            break;
        case 'normal':
            // Dano padrão
            enemyTypes.zombie.damage = 3;
            enemyTypes.skeleton.damage = 2;
            break;
        case 'hard':
            // Aumentar dano
            enemyTypes.zombie.damage = 5;
            enemyTypes.skeleton.damage = 4;
            break;
    }

    // Modo criativo
    if (gameSettings.gameplay.creative) {
        player.flying = true;
        playerHealth = MAX_HEALTH;
        // Dar itens ilimitados
        for (let type in blockTypes) {
            addToInventory(type, 64);
        }
    }
}

// Atualizar interface de configurações
function updateSettingsUI() {
    // Gráficos
    document.getElementById('render-distance').value = gameSettings.graphics.renderDistance;
    document.getElementById('render-distance-value').textContent = gameSettings.graphics.renderDistance;

    updateSwitchState('antialiasing', gameSettings.graphics.antialiasing);
    updateSwitchState('shadows', gameSettings.graphics.shadows);
    updateSwitchState('fog', gameSettings.graphics.fog);

    document.getElementById('particles-select').value = gameSettings.graphics.particles;
    document.getElementById('fps-select').value = gameSettings.graphics.fpsLimit;

    // Gameplay
    document.getElementById('difficulty-select').value = gameSettings.gameplay.difficulty;
    updateSwitchState('creative', gameSettings.gameplay.creative);
    updateSwitchState('autojump', gameSettings.gameplay.autoJump);

    document.getElementById('mob-spawn').value = gameSettings.gameplay.mobSpawn;
    document.getElementById('mob-spawn-value').textContent = gameSettings.gameplay.mobSpawn + '%';

    document.getElementById('health-regen').value = gameSettings.gameplay.healthRegen;
    document.getElementById('health-regen-value').textContent = gameSettings.gameplay.healthRegen;

    // Controles
    document.getElementById('mouse-sensitivity').value = gameSettings.controls.mouseSensitivity;
    document.getElementById('mouse-sensitivity-value').textContent = gameSettings.controls.mouseSensitivity;

    updateSwitchState('invertY', gameSettings.controls.invertY);

    document.getElementById('touch-sensitivity').value = gameSettings.controls.touchSensitivity;
    document.getElementById('touch-sensitivity-value').textContent = gameSettings.controls.touchSensitivity;

    // Áudio
    document.getElementById('master-volume').value = gameSettings.audio.masterVolume;
    document.getElementById('master-volume-value').textContent = gameSettings.audio.masterVolume + '%';

    document.getElementById('sfx-volume').value = gameSettings.audio.sfxVolume;
    document.getElementById('sfx-volume-value').textContent = gameSettings.audio.sfxVolume + '%';

    document.getElementById('music-volume').value = gameSettings.audio.musicVolume;
    document.getElementById('music-volume-value').textContent = gameSettings.audio.musicVolume + '%';

    document.getElementById('ambient-volume').value = gameSettings.audio.ambientVolume;
    document.getElementById('ambient-volume-value').textContent = gameSettings.audio.ambientVolume + '%';
}

// Atualizar estado do switch
function updateSwitchState(id, active) {
    const switchEl = document.getElementById(id + '-switch');
    if (switchEl) {
        if (active) {
            switchEl.classList.add('active');
        } else {
            switchEl.classList.remove('active');
        }
    }
}

function updateSetting(key, value) {
    const parts = key.split('.');
    if (parts.length === 1) {
        // Encontrar categoria
        for (let category in gameSettings) {
            if (gameSettings[category].hasOwnProperty(key)) {
                gameSettings[category][key] = value;
                break;
            }
        }
    }

    // Atualizar valores exibidos
    const valueEl = document.getElementById(key.toLowerCase().replace(/([A-Z])/g, '-$1') + '-value');
    if (valueEl) {
        if (key.includes('Volume') || key.includes('Spawn')) {
            valueEl.textContent = value + '%';
        } else {
            valueEl.textContent = value;
        }
    }

    // Aplicar em tempo real
    applySettings();
}


function toggleSwitch(id) {
    const switchEl = document.getElementById(id + '-switch');
    const isActive = switchEl.classList.contains('active');

    if (isActive) {
        switchEl.classList.remove('active');
    } else {
        switchEl.classList.add('active');
    }

    // Atualizar configuração
    for (let category in gameSettings) {
        if (gameSettings[category].hasOwnProperty(id)) {
            gameSettings[category][id] = !isActive;
            break;
        }
    }

    applySettings();
}

// Trocar tab
function switchTab(tabName) {
    // Desativar todas as tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.settings-content').forEach(content => {
        content.classList.remove('active');
    });

    // Ativar tab selecionada
    event.target.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}

// Abrir configurações
function openSettings() {
    document.getElementById('settings-menu').classList.add('open');
    updateSettingsUI();
    updateStatsDisplay();

    // Atualizar stats periodicamente
    if (!window.statsInterval) {
        window.statsInterval = setInterval(updateStatsDisplay, 1000);
    }
}

// Fechar configurações
function closeSettings() {
    document.getElementById('settings-menu').classList.remove('open');

    if (window.statsInterval) {
        clearInterval(window.statsInterval);
        window.statsInterval = null;
    }
}

// Atualizar exibição de estatísticas
function updateStatsDisplay() {
    const fps = parseInt(document.getElementById('fps').textContent) || 60;
    document.getElementById('stat-fps').textContent = fps;

    const chunks = Object.keys(chunks).length;
    document.getElementById('stat-chunks').textContent = chunks;

    const totalEntities = animals.length + enemies.length + villagers.length;
    document.getElementById('stat-entities').textContent = totalEntities;

    if (performance.memory) {
        const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(0);
        document.getElementById('stat-memory').textContent = memoryMB + 'MB';
    }
}

function exportGameData() {
    const data = {
        world: worldData,
        player: {
            position: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            },
            inventory: player.inventory,
            health: playerHealth
        },
        settings: gameSettings,
        timestamp: Date.now()
    };

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `minecraft-world-${Date.now()}.json`;
    a.click();

    showNotification('✅ Mundo exportado com sucesso!', 'success');
}

function importGameData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (confirm('Importar este mundo irá substituir o mundo atual. Continuar?')) {
                    worldData = data.world;
                    player.inventory = data.player.inventory;
                    playerHealth = data.player.health;

                    camera.position.set(
                        data.player.position.x,
                        data.player.position.y,
                        data.player.position.z
                    );

                    if (data.settings) {
                        Object.assign(gameSettings, data.settings);
                    }

                    // Recarregar chunks
                    chunks = {};
                    chunkMeshes = {};
                    updateVisibleChunks();

                    showNotification('✅ Mundo importado com sucesso!', 'success');
                    closeSettings();
                }
            } catch (e) {
                showNotification('❌ Erro ao importar mundo: ' + e.message, 'error');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

function resetGameData() {
    if (confirm('ATENÇÃO: Isto irá apagar TODO o progresso do jogo! Continuar?')) {
        if (confirm('Tem certeza absoluta? Esta ação não pode ser desfeita!')) {
            localStorage.clear();
            location.reload();
        }
    }
}


