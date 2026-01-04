class PlayerCharacter {
    constructor() {
        this.group = new THREE.Group();
        this.animations = {
            idle: { time: 0, speed: 0.5 },
            walk: { time: 0, speed: 2 },
            jump: { time: 0, speed: 1.5 },
            run: { time: 0, speed: 3 }
        };
        this.currentAnimation = 'idle';
        this.createRealisticModel();
    }

    createRealisticModel() {
        // Cabeça com mais detalhes
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFDBAC,
            flatShading: false
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.75;
        head.castShadow = true;
        head.receiveShadow = true;
        this.head = head;
        this.group.add(head);

        // Cabelo/Chapéu
        const hairGeometry = new THREE.BoxGeometry(0.52, 0.15, 0.52);
        const hairMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 2.05;
        hair.castShadow = true;
        this.group.add(hair);

        // Pescoço
        const neckGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = 1.4;
        neck.castShadow = true;
        this.group.add(neck);

        // Corpo com mais forma
        const torsoGeometry = new THREE.BoxGeometry(0.7, 0.9, 0.35);
        const torsoMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 0.95;
        torso.castShadow = true;
        torso.receiveShadow = true;
        this.group.add(torso);

        // Cintura
        const waistGeometry = new THREE.BoxGeometry(0.65, 0.15, 0.33);
        const waistMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
        const waist = new THREE.Mesh(waistGeometry, waistMaterial);
        waist.position.y = 0.48;
        waist.castShadow = true;
        this.group.add(waist);

        // Braço esquerdo (ombro + antebraço)
        const shoulderGeometry = new THREE.CylinderGeometry(0.12, 0.11, 0.4, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });

        this.leftShoulder = new THREE.Mesh(shoulderGeometry, armMaterial);
        this.leftShoulder.position.set(-0.45, 1.15, 0);
        this.leftShoulder.castShadow = true;
        this.group.add(this.leftShoulder);

        const forearmGeometry = new THREE.CylinderGeometry(0.1, 0.09, 0.45, 8);
        const skinMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });

        this.leftForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
        this.leftForearm.position.set(-0.45, 0.65, 0);
        this.leftForearm.castShadow = true;
        this.group.add(this.leftForearm);

        // Mão esquerda
        const handGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        this.leftHand = new THREE.Mesh(handGeometry, skinMaterial);
        this.leftHand.position.set(-0.45, 0.35, 0);
        this.leftHand.castShadow = true;
        this.group.add(this.leftHand);

        // Braço direito (ombro + antebraço)
        this.rightShoulder = new THREE.Mesh(shoulderGeometry, armMaterial);
        this.rightShoulder.position.set(0.45, 1.15, 0);
        this.rightShoulder.castShadow = true;
        this.group.add(this.rightShoulder);

        this.rightForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
        this.rightForearm.position.set(0.45, 0.65, 0);
        this.rightForearm.castShadow = true;
        this.group.add(this.rightForearm);

        // Mão direita
        this.rightHand = new THREE.Mesh(handGeometry, skinMaterial);
        this.rightHand.position.set(0.45, 0.35, 0);
        this.rightHand.castShadow = true;
        this.group.add(this.rightHand);

        // Pernas (coxa + canela)
        const thighGeometry = new THREE.CylinderGeometry(0.14, 0.13, 0.5, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });

        this.leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.leftThigh.position.set(-0.18, 0.15, 0);
        this.leftThigh.castShadow = true;
        this.group.add(this.leftThigh);

        const calfGeometry = new THREE.CylinderGeometry(0.12, 0.11, 0.5, 8);

        this.leftCalf = new THREE.Mesh(calfGeometry, legMaterial);
        this.leftCalf.position.set(-0.18, -0.35, 0);
        this.leftCalf.castShadow = true;
        this.group.add(this.leftCalf);

        // Pé esquerdo
        const footGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
        const shoeMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        this.leftFoot = new THREE.Mesh(footGeometry, shoeMaterial);
        this.leftFoot.position.set(-0.18, -0.65, 0.05);
        this.leftFoot.castShadow = true;
        this.group.add(this.leftFoot);

        // Perna direita
        this.rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.rightThigh.position.set(0.18, 0.15, 0);
        this.rightThigh.castShadow = true;
        this.group.add(this.rightThigh);

        this.rightCalf = new THREE.Mesh(calfGeometry, legMaterial);
        this.rightCalf.position.set(0.18, -0.35, 0);
        this.rightCalf.castShadow = true;
        this.group.add(this.rightCalf);

        // Pé direito
        this.rightFoot = new THREE.Mesh(footGeometry, shoeMaterial);
        this.rightFoot.position.set(0.18, -0.65, 0.05);
        this.rightFoot.castShadow = true;
        this.group.add(this.rightFoot);

        // Olhos com brilho
        const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1E90FF });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 1.8, 0.25);
        this.group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 1.8, 0.25);
        this.group.add(rightEye);

        // Pupilas
        const pupilGeometry = new THREE.SphereGeometry(0.02, 6, 6);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.12, 1.8, 0.27);
        this.group.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.12, 1.8, 0.27);
        this.group.add(rightPupil);

        // Sombra circular embaixo
        const shadowGeometry = new THREE.CircleGeometry(0.4, 16);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -0.69;
        this.group.add(shadow);
    }

    updateAnimation(deltaTime, isMoving, isJumping, isRunning) {
        const animType = isJumping ? 'jump' : isRunning ? 'run' : isMoving ? 'walk' : 'idle';
        const anim = this.animations[animType];
        anim.time += deltaTime * anim.speed;

        if (isJumping) {
            this.updateJumpAnimation(anim.time);
        } else if (isRunning) {
            this.updateRunAnimation(anim.time);
        } else if (isMoving) {
            this.updateWalkAnimation(anim.time);
        } else {
            this.updateIdleAnimation(anim.time);
        }
    }

    updateIdleAnimation(time) {
        const breath = Math.sin(time) * 0.015;
        this.group.position.y = breath;

        // Respiração sutil
        this.group.scale.y = 1 + Math.sin(time * 1.5) * 0.01;

        // Movimento sutil dos braços
        this.leftShoulder.rotation.x = Math.sin(time * 0.5) * 0.05;
        this.rightShoulder.rotation.x = Math.sin(time * 0.5 + Math.PI) * 0.05;

        // Cabeça olhando levemente
        this.head.rotation.y = Math.sin(time * 0.3) * 0.1;
    }

    updateWalkAnimation(time) {
        const legSwing = Math.sin(time) * 0.6;
        const armSwing = Math.sin(time + Math.PI) * 0.4;
        const bob = Math.sin(time * 2) * 0.04;

        this.group.position.y = bob;

        // Balanço natural das pernas
        this.leftThigh.rotation.x = legSwing;
        this.rightThigh.rotation.x = -legSwing;

        // Canelas seguem as coxas com delay
        this.leftCalf.rotation.x = Math.max(0, legSwing * 0.5);
        this.rightCalf.rotation.x = Math.max(0, -legSwing * 0.5);

        // Pés com movimento natural
        this.leftFoot.rotation.x = legSwing * 0.3;
        this.rightFoot.rotation.x = -legSwing * 0.3;

        // Braços balançando oposto às pernas
        this.leftShoulder.rotation.x = armSwing;
        this.rightShoulder.rotation.x = -armSwing;

        this.leftForearm.rotation.x = armSwing * 0.5;
        this.rightForearm.rotation.x = -armSwing * 0.5;

        // Rotação sutil do tronco
        this.group.rotation.z = Math.sin(time) * 0.03;

        // Cabeça balança levemente
        this.head.rotation.x = bob * 0.5;
    }

    updateRunAnimation(time) {
        const legSwing = Math.sin(time) * 0.9;
        const armSwing = Math.sin(time + Math.PI) * 0.7;
        const bob = Math.sin(time * 2) * 0.08;

        this.group.position.y = bob;

        // Inclinação do corpo para frente ao correr
        this.group.rotation.x = -0.1;

        // Movimento exagerado das pernas
        this.leftThigh.rotation.x = legSwing;
        this.rightThigh.rotation.x = -legSwing;

        this.leftCalf.rotation.x = Math.max(0, legSwing * 0.8);
        this.rightCalf.rotation.x = Math.max(0, -legSwing * 0.8);

        // Braços mais dinâmicos
        this.leftShoulder.rotation.x = armSwing;
        this.rightShoulder.rotation.x = -armSwing;

        this.leftForearm.rotation.x = armSwing * 0.6;
        this.rightForearm.rotation.x = -armSwing * 0.6;

        // Rotação do tronco mais pronunciada
        this.group.rotation.z = Math.sin(time) * 0.05;
    }

    updateJumpAnimation(time) {
        const jumpPhase = Math.min(time, Math.PI);
        const jumpHeight = Math.sin(jumpPhase) * 0.3;

        this.group.position.y = jumpHeight;

        // Braços para cima
        this.leftShoulder.rotation.x = -0.8 - jumpHeight;
        this.rightShoulder.rotation.x = -0.8 - jumpHeight;

        this.leftForearm.rotation.x = -0.3;
        this.rightForearm.rotation.x = -0.3;

        // Pernas dobradas
        this.leftThigh.rotation.x = 0.6 + jumpHeight * 0.5;
        this.rightThigh.rotation.x = 0.6 + jumpHeight * 0.5;

        this.leftCalf.rotation.x = -0.8 - jumpHeight;
        this.rightCalf.rotation.x = -0.8 - jumpHeight;

        // Cabeça para trás
        this.head.rotation.x = -0.2;
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    setRotation(y) {
        this.group.rotation.y = y;
    }
}
