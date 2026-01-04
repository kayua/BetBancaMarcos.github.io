
class Animal {
    constructor(type, x, y, z) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        this.health = animalTypes[type].health;
        this.targetX = x;
        this.targetZ = z;
        this.speed = animalTypes[type].speed;
        this.mesh = null;
        this.direction = new THREE.Vector3(0, 0, 1);
        this.velocity = new THREE.Vector3();
        this.boundingBox = null;

        // Sistema de comportamento inteligente
        this.state = 'idle'; // idle, wandering, grazing, fleeing, hunting, socializing
        this.stateTimer = 0;
        this.alertness = 0;
        this.hunger = 0;
        this.energy = 100;
        this.fear = 0;

        // Animação
        this.animationTime = 0;
        this.headRotation = 0;
        this.legPhase = 0;
        this.jumpPhase = 0;
        this.breathingPhase = 0;

        // IA e percepção
        this.nearbyAnimals = [];
        this.detectionRadius = 15;
        this.fleeRadius = 8;
        this.socialRadius = 5;

        // Memória de posições visitadas
        this.visitedPositions = [];
        this.maxMemory = 10;

        this.createMesh();
    }

// VACA REALISTA - GEOMETRIA SIMPLIFICADA E LIMPA
    createCowMesh() {
        const group = new THREE.Group();

        // ==================== MATERIAIS ====================
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 30,
            specular: 0x333333,
            side: THREE.DoubleSide
        });

        const spotMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 20
        });

        const pinkMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFB6C1,
            shininess: 40
        });

        const hoofMaterial = new THREE.MeshPhongMaterial({
            color: 0x2F2F2F,
            shininess: 10
        });

        // ==================== CORPO PRINCIPAL ====================
        // Torso - corpo cilíndrico principal
        const torsoGeometry = new THREE.CylinderGeometry(0.55, 0.6, 2.0, 16);
        const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        torso.rotation.z = Math.PI / 2;
        torso.position.set(0, 0.9, 0);
        torso.castShadow = true;
        torso.receiveShadow = true;
        group.add(torso);

        // Peito frontal
        const chestGeometry = new THREE.SphereGeometry(0.6, 16, 12);
        const chest = new THREE.Mesh(chestGeometry, bodyMaterial);
        chest.scale.set(0.8, 0.9, 0.95);
        chest.position.set(0.85, 0.9, 0);
        chest.castShadow = true;
        group.add(chest);

        // Traseira
        const hindGeometry = new THREE.SphereGeometry(0.62, 16, 12);
        const hind = new THREE.Mesh(hindGeometry, bodyMaterial);
        hind.scale.set(0.75, 0.85, 1.0);
        hind.position.set(-1.0, 0.9, 0);
        hind.castShadow = true;
        group.add(hind);

        // Barriga inferior
        const bellyGeometry = new THREE.SphereGeometry(0.4, 16, 12);
        const belly = new THREE.Mesh(bellyGeometry, bodyMaterial);
        belly.scale.set(1.7, 0.6, 1.1);
        belly.position.set(-0.05, 0.45, 0);
        belly.castShadow = true;
        group.add(belly);

        // ==================== MANCHAS ====================
        const spots = [
            { x: 0.4, y: 1.2, z: 0.3, scale: [0.26, 0.22, 0.05] },
            { x: -0.3, y: 1.15, z: -0.35, scale: [0.28, 0.24, 0.05] },
            { x: 0.2, y: 1.0, z: 0.45, scale: [0.2, 0.18, 0.05] },
            { x: -0.6, y: 1.1, z: 0.18, scale: [0.3, 0.26, 0.05] },
            { x: 0.55, y: 0.8, z: -0.28, scale: [0.22, 0.2, 0.05] }
        ];

        spots.forEach(spot => {
            const spotGeometry = new THREE.SphereGeometry(1, 12, 10);
            const spotMesh = new THREE.Mesh(spotGeometry, spotMaterial);
            spotMesh.scale.set(...spot.scale);
            spotMesh.position.set(spot.x, spot.y, spot.z);
            spotMesh.castShadow = true;
            group.add(spotMesh);
        });

        // ==================== PESCOÇO ====================
        const neckGeometry = new THREE.CylinderGeometry(0.32, 0.38, 0.7, 12);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.set(1.1, 1.15, 0);
        neck.rotation.z = -Math.PI / 7;
        neck.castShadow = true;
        group.add(neck);

        // ==================== CABEÇA ====================
        // Cabeça principal
        const headGeometry = new THREE.BoxGeometry(0.45, 0.5, 0.6);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(1.6, 1.6, 0);
        head.castShadow = true;
        group.add(head);

        // Topo arredondado
        const crownGeometry = new THREE.SphereGeometry(0.28, 14, 10);
        const crown = new THREE.Mesh(crownGeometry, bodyMaterial);
        crown.scale.set(0.8, 0.85, 1.1);
        crown.position.set(1.6, 1.82, 0);
        group.add(crown);

        // Focinho
        const muzzleGeometry = new THREE.CylinderGeometry(0.26, 0.3, 0.35, 14);
        const muzzle = new THREE.Mesh(muzzleGeometry, pinkMaterial);
        muzzle.rotation.z = Math.PI / 2;
        muzzle.position.set(1.88, 1.52, 0);
        muzzle.castShadow = true;
        group.add(muzzle);

        // Ponta do focinho
        const noseTipGeometry = new THREE.SphereGeometry(0.3, 12, 10);
        const noseTip = new THREE.Mesh(noseTipGeometry, pinkMaterial);
        noseTip.scale.set(0.6, 0.8, 0.9);
        noseTip.position.set(2.03, 1.52, 0);
        group.add(noseTip);

        // Narinas
        [-0.11, 0.11].forEach(z => {
            const nostrilGeometry = new THREE.SphereGeometry(0.045, 10, 8);
            const nostril = new THREE.Mesh(nostrilGeometry, new THREE.MeshPhongMaterial({
                color: 0x0a0a0a,
                shininess: 60
            }));
            nostril.scale.set(0.9, 0.6, 0.8);
            nostril.position.set(2.1, 1.52, z);
            group.add(nostril);
        });

        // ==================== OLHOS ====================
        [-0.23, 0.23].forEach(z => {
            // Olho branco
            const eyeballGeometry = new THREE.SphereGeometry(0.08, 12, 10);
            const eyeball = new THREE.Mesh(eyeballGeometry, new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                shininess: 80
            }));
            eyeball.position.set(1.78, 1.7, z);
            group.add(eyeball);

            // Íris
            const irisGeometry = new THREE.CircleGeometry(0.04, 14);
            const iris = new THREE.Mesh(irisGeometry, new THREE.MeshPhongMaterial({
                color: 0x4a3520,
                shininess: 100
            }));
            iris.position.set(1.855, 1.7, z);
            iris.rotation.y = Math.PI / 2;
            group.add(iris);

            // Pupila
            const pupilGeometry = new THREE.CircleGeometry(0.02, 14);
            const pupil = new THREE.Mesh(pupilGeometry, new THREE.MeshPhongMaterial({
                color: 0x000000,
                shininess: 120
            }));
            pupil.position.set(1.86, 1.7, z);
            pupil.rotation.y = Math.PI / 2;
            group.add(pupil);

            // Reflexo
            const reflectGeometry = new THREE.SphereGeometry(0.012, 8, 6);
            const reflect = new THREE.Mesh(reflectGeometry, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
            reflect.position.set(1.865, 1.73, z + (z > 0 ? 0.025 : -0.025));
            group.add(reflect);
        });

        // ==================== ORELHAS ====================
        [-0.37, 0.37].forEach(z => {
            // Orelha externa
            const earGeometry = new THREE.ConeGeometry(0.11, 0.32, 12);
            const ear = new THREE.Mesh(earGeometry, bodyMaterial);
            ear.position.set(1.52, 1.92, z);
            ear.rotation.x = Math.PI / 4.5;
            ear.rotation.z = z < 0 ? -Math.PI / 7 : Math.PI / 7;
            ear.castShadow = true;
            group.add(ear);

            // Orelha interna rosa
            const innerEarGeometry = new THREE.ConeGeometry(0.07, 0.26, 10);
            const innerEar = new THREE.Mesh(innerEarGeometry, pinkMaterial);
            innerEar.position.set(1.53, 1.92, z);
            innerEar.rotation.x = Math.PI / 4.5;
            innerEar.rotation.z = z < 0 ? -Math.PI / 7 : Math.PI / 7;
            group.add(innerEar);
        });

        // ==================== CHIFRES ====================
        [-0.23, 0.23].forEach(z => {
            const hornGeometry = new THREE.ConeGeometry(0.055, 0.38, 10);
            const horn = new THREE.Mesh(hornGeometry, new THREE.MeshPhongMaterial({
                color: 0xC9A670,
                shininess: 50
            }));
            horn.position.set(1.58, 2.02, z);
            horn.rotation.x = z < 0 ? -Math.PI / 16 : Math.PI / 16;
            horn.rotation.z = z < 0 ? -Math.PI / 14 : Math.PI / 14;
            horn.castShadow = true;
            group.add(horn);
        });

        // ==================== PERNAS ====================
        const legs = [
            { x: 0.7, z: 0.45 },
            { x: 0.7, z: -0.45 },
            { x: -0.8, z: 0.45 },
            { x: -0.8, z: -0.45 }
        ];

        legs.forEach(leg => {
            // Parte superior (coxa)
            const upperLegGeometry = new THREE.CylinderGeometry(0.16, 0.14, 0.48, 12);
            const upperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
            upperLeg.position.set(leg.x, 0.62, leg.z);
            upperLeg.castShadow = true;
            group.add(upperLeg);

            // Joelho
            const kneeGeometry = new THREE.SphereGeometry(0.13, 10, 8);
            const knee = new THREE.Mesh(kneeGeometry, bodyMaterial);
            knee.position.set(leg.x, 0.38, leg.z);
            group.add(knee);

            // Parte inferior (canela)
            const lowerLegGeometry = new THREE.CylinderGeometry(0.11, 0.1, 0.4, 12);
            const lowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
            lowerLeg.position.set(leg.x, 0.16, leg.z);
            lowerLeg.castShadow = true;
            group.add(lowerLeg);

            // Tornozelo
            const ankleGeometry = new THREE.SphereGeometry(0.1, 10, 8);
            const ankle = new THREE.Mesh(ankleGeometry, bodyMaterial);
            ankle.position.set(leg.x, -0.01, leg.z);
            group.add(ankle);

            // Casco
            const hoofGeometry = new THREE.CylinderGeometry(0.095, 0.11, 0.11, 12);
            const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
            hoof.position.set(leg.x, -0.08, leg.z);
            hoof.castShadow = true;
            group.add(hoof);

            // Base do casco
            const hoofBottomGeometry = new THREE.BoxGeometry(0.11, 0.035, 0.14);
            const hoofBottom = new THREE.Mesh(hoofBottomGeometry, hoofMaterial);
            hoofBottom.position.set(leg.x, -0.145, leg.z);
            group.add(hoofBottom);
        });

        // ==================== CAUDA ====================
        // Segmento 1 (base)
        const tailSegment1Geometry = new THREE.CylinderGeometry(0.075, 0.065, 0.28, 8);
        const tailSegment1 = new THREE.Mesh(tailSegment1Geometry, bodyMaterial);
        tailSegment1.position.set(-1.25, 1.05, 0);
        tailSegment1.rotation.x = Math.PI / 3.8;
        tailSegment1.castShadow = true;
        group.add(tailSegment1);

        // Segmento 2
        const tailSegment2Geometry = new THREE.CylinderGeometry(0.055, 0.045, 0.3, 8);
        const tailSegment2 = new THREE.Mesh(tailSegment2Geometry, bodyMaterial);
        tailSegment2.position.set(-1.34, 0.84, -0.18);
        tailSegment2.rotation.x = Math.PI / 3.5;
        group.add(tailSegment2);

        // Segmento 3
        const tailSegment3Geometry = new THREE.CylinderGeometry(0.035, 0.025, 0.32, 8);
        const tailSegment3 = new THREE.Mesh(tailSegment3Geometry, bodyMaterial);
        tailSegment3.position.set(-1.41, 0.62, -0.38);
        tailSegment3.rotation.x = Math.PI / 3.8;
        group.add(tailSegment3);

        // Tufo da cauda
        const tailTufGeometry = new THREE.SphereGeometry(0.1, 10, 8);
        const tailTuf = new THREE.Mesh(tailTufGeometry, spotMaterial);
        tailTuf.scale.set(0.65, 1.15, 0.65);
        tailTuf.position.set(-1.46, 0.42, -0.56);
        group.add(tailTuf);

        // ==================== ÚBERE ====================
        // Úbere principal
        const udderGeometry = new THREE.SphereGeometry(0.3, 14, 12);
        const udder = new THREE.Mesh(udderGeometry, pinkMaterial);
        udder.scale.set(1.25, 0.7, 1.05);
        udder.position.set(-0.35, 0.34, 0);
        udder.castShadow = true;
        group.add(udder);

        // Tetas
        const teats = [
            { x: -0.22, z: 0.15 },
            { x: -0.22, z: -0.15 },
            { x: -0.48, z: 0.15 },
            { x: -0.48, z: -0.15 }
        ];

        teats.forEach(teat => {
            // Teta
            const teatGeometry = new THREE.CylinderGeometry(0.038, 0.034, 0.14, 10);
            const teatMesh = new THREE.Mesh(teatGeometry, pinkMaterial);
            teatMesh.position.set(teat.x, 0.19, teat.z);
            teatMesh.castShadow = true;
            group.add(teatMesh);

            // Ponta da teta
            const teatTipGeometry = new THREE.SphereGeometry(0.034, 8, 6);
            const teatTip = new THREE.Mesh(teatTipGeometry, new THREE.MeshPhongMaterial({
                color: 0xFF9999,
                shininess: 45
            }));
            teatTip.position.set(teat.x, 0.12, teat.z);
            group.add(teatTip);
        });

        // Ajuste de posição final
        group.position.y = 0.17;

        return group;
    }

    createPigMesh() {
        const group = new THREE.Group();

        // Corpo roliço
        const bodyGeometry = new THREE.SphereGeometry(0.75, 14, 14);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.5, 1.1, 1.3);
        body.position.y = 0.75;
        group.add(body);

        // Barriga grande
        const bellyGeometry = new THREE.SphereGeometry(0.65, 12, 12);
        const bellyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFC0CB });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.scale.set(1.3, 0.9, 1.1);
        belly.position.set(0, 0.55, 0);
        group.add(belly);

        // Pescoço grosso
        const neckGeometry = new THREE.CylinderGeometry(0.32, 0.38, 0.35, 10);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.set(0, 0.85, 0.75);
        neck.rotation.x = Math.PI / 12;
        group.add(neck);

        // Cabeça arredondada
        const headGeometry = new THREE.SphereGeometry(0.38, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(0.9, 0.8, 1);
        head.position.set(0, 0.92, 1.05);
        head.userData.isHead = true;
        group.add(head);

        // Focinho grande e achatado
        const snoutGeometry = new THREE.CylinderGeometry(0.32, 0.28, 0.4, 12);
        const snoutMaterial = new THREE.MeshLambertMaterial({ color: 0xFF9999 });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(0, 0.88, 1.4);
        snout.rotation.x = Math.PI / 2;
        group.add(snout);

        // Narinas características
        [[0.14, -0.14]].forEach(xPos => {
            [xPos[0], xPos[1]].forEach(x => {
                const nostrilGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 8);
                const nostrilMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const nostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
                nostril.position.set(x, 0.88, 1.58);
                nostril.rotation.x = Math.PI / 2;
                group.add(nostril);
            });
        });

        // Olhos pequenos
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.09, 10, 10);
        const eyeWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [0.32, -0.32].forEach(xPos => {
            const eye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
            eye.position.set(xPos, 1.0, 1.2);
            group.add(eye);
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.set(xPos * 1.05, 1.0, 1.26);
            pupil.userData.isPupil = true;
            group.add(pupil);
        });

        // Orelhas caídas
        const earGeometry = new THREE.SphereGeometry(0.15, 10, 10);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        [1, -1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.scale.set(0.6, 1.2, 0.4);
            ear.position.set(side * 0.38, 1.1, 0.95);
            ear.rotation.z = side * Math.PI / 6;
            ear.rotation.x = -Math.PI / 6;
            ear.userData.isEar = true;
            group.add(ear);
        });

        // Pernas curtas e robustas
        const legGeometry = new THREE.CylinderGeometry(0.13, 0.11, 0.55, 10);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const legPositions = [
            { x: 0.48, y: 0.275, z: 0.55 },
            { x: -0.48, y: 0.275, z: 0.55 },
            { x: 0.48, y: 0.275, z: -0.55 },
            { x: -0.48, y: 0.275, z: -0.55 }
        ];
        legPositions.forEach((pos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, pos.y, pos.z);
            leg.userData.originalY = pos.y;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const hoofGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const hoofMaterial = new THREE.MeshLambertMaterial({ color: 0xFF9999 });
            const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
            hoof.scale.set(1, 0.5, 1);
            hoof.position.set(pos.x, 0.03, pos.z);
            group.add(hoof);
        });

        // Cauda encaracolada realista
        const tailPoints = [];
        for (let i = 0; i <= 15; i++) {
            const t = i / 15;
            const angle = t * Math.PI * 3;
            const radius = 0.18 * (1 - t * 0.3);
            tailPoints.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                t * 0.6,
                Math.sin(angle) * radius
            ));
        }
        const tailCurve = new THREE.CatmullRomCurve3(tailPoints);
        const tailGeometry = new THREE.TubeGeometry(tailCurve, 25, 0.045, 8, false);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.85, -1.0);
        tail.userData.isTail = true;
        group.add(tail);

        return group;
    }

    // OVELHA FOFINHA
    createSheepMesh() {
        const group = new THREE.Group();

        // Corpo principal de lã
        const bodyGeometry = new THREE.SphereGeometry(0.8, 12, 12);
        const woolMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 });
        const body = new THREE.Mesh(bodyGeometry, woolMaterial);
        body.scale.set(1.6, 1.3, 1.9);
        body.position.y = 0.95;
        group.add(body);

        // Camadas de lã para textura
        const woolClusters = [
            { x: 0.5, y: 1.35, z: 0.5, s: 0.4 },
            { x: -0.5, y: 1.35, z: 0.5, s: 0.4 },
            { x: 0.5, y: 1.35, z: -0.5, s: 0.4 },
            { x: -0.5, y: 1.35, z: -0.5, s: 0.4 },
            { x: 0, y: 1.5, z: 0, s: 0.45 },
            { x: 0.35, y: 1.0, z: 0.8, s: 0.35 },
            { x: -0.35, y: 1.0, z: 0.8, s: 0.35 },
            { x: 0.35, y: 1.0, z: -0.8, s: 0.35 },
            { x: -0.35, y: 1.0, z: -0.8, s: 0.35 },
            { x: 0, y: 1.1, z: 1.0, s: 0.3 },
            { x: 0, y: 1.1, z: -1.0, s: 0.3 }
        ];
        woolClusters.forEach(cluster => {
            const woolGeometry = new THREE.SphereGeometry(cluster.s, 10, 10);
            const wool = new THREE.Mesh(woolGeometry, woolMaterial);
            wool.position.set(cluster.x, cluster.y, cluster.z);
            group.add(wool);
        });

        // Cabeça preta/cinza
        const headGeometry = new THREE.SphereGeometry(0.35, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(0.85, 0.9, 1);
        head.position.set(0, 1.05, 1.25);
        head.userData.isHead = true;
        group.add(head);

        // Focinho
        const snoutGeometry = new THREE.SphereGeometry(0.22, 10, 10);
        const snout = new THREE.Mesh(snoutGeometry, headMaterial);
        snout.scale.set(0.8, 0.7, 1);
        snout.position.set(0, 0.95, 1.55);
        group.add(snout);

        // Olhos grandes e expressivos
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.14, 10, 10);
        const eyeWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [0.28, -0.28].forEach(xPos => {
            const eye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
            eye.position.set(xPos, 1.1, 1.5);
            group.add(eye);
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.set(xPos * 1.05, 1.1, 1.58);
            pupil.userData.isPupil = true;
            group.add(pupil);
        });

        // Orelhas
        const earGeometry = new THREE.SphereGeometry(0.12, 10, 10);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        [1, -1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.scale.set(0.6, 1.5, 0.4);
            ear.position.set(side * 0.32, 1.25, 1.15);
            ear.rotation.z = side * Math.PI / 5;
            ear.userData.isEar = true;
            group.add(ear);
        });

        // Pernas pretas
        const legGeometry = new THREE.CylinderGeometry(0.14, 0.12, 0.85, 10);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const legPositions = [
            { x: 0.48, y: 0.425, z: 0.65 },
            { x: -0.48, y: 0.425, z: 0.65 },
            { x: 0.48, y: 0.425, z: -0.65 },
            { x: -0.48, y: 0.425, z: -0.65 }
        ];
        legPositions.forEach((pos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, pos.y, pos.z);
            leg.userData.originalY = pos.y;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const hoofGeometry = new THREE.CylinderGeometry(0.13, 0.11, 0.1, 8);
            const hoofMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
            hoof.position.set(pos.x, 0.05, pos.z);
            group.add(hoof);
        });

        // Rabinho pequeno
        const tailGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.scale.set(0.8, 1.2, 0.8);
        tail.position.set(0, 1.0, -1.3);
        tail.userData.isTail = true;
        group.add(tail);

        return group;
    }

    createChickenMesh() {
        const group = new THREE.Group();
        const bodyGeometry = new THREE.SphereGeometry(0.42, 12, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 1.3, 1.1);
        body.position.y = 0.52;
        group.add(body);
        const neckGeometry = new THREE.CylinderGeometry(0.13, 0.16, 0.35, 10);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.set(0, 0.72, 0.28);
        neck.rotation.x = Math.PI / 7;
        group.add(neck);
        const headGeometry = new THREE.SphereGeometry(0.2, 10, 10);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.92, 0.38);
        head.userData.isHead = true;
        group.add(head);
        const beakGeometry = new THREE.ConeGeometry(0.09, 0.18, 8);
        const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 0.88, 0.52);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);
        const crestGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const crestMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const crest = new THREE.Mesh(crestGeometry, crestMaterial);
        crest.scale.set(0.4, 1.2, 0.6);
        crest.position.set(0, 1.05, 0.32);
        group.add(crest);
        const wattleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const wattleMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const wattle = new THREE.Mesh(wattleGeometry, wattleMaterial);
        wattle.scale.set(0.8, 1.5, 0.6);
        wattle.position.set(0, 0.8, 0.48);
        group.add(wattle);
        [0.17, -0.17].forEach(xPos => {
            const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(xPos, 0.95, 0.48);
            eye.userData.isPupil = true;
            group.add(eye);
        });
        const wingGeometry = new THREE.SphereGeometry(0.22, 10, 10);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 });
        [1, -1].forEach(side => {
            const wing = new THREE.Mesh(wingGeometry, wingMaterial);
            wing.scale.set(0.4, 1.2, 1.5);
            wing.position.set(side * 0.38, 0.58, 0);
            wing.rotation.z = side * Math.PI / 10;
            wing.userData.isWing = true;
            wing.userData.side = side > 0 ? 'right' : 'left';
            group.add(wing);
        });
        const legGeometry = new THREE.CylinderGeometry(0.045, 0.045, 0.38, 6);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
        [0.14, -0.14].forEach((xPos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(xPos, 0.19, 0);
            leg.userData.originalY = 0.19;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const footGeometry = new THREE.BoxGeometry(0.14, 0.02, 0.18);
            const foot = new THREE.Mesh(footGeometry, legMaterial);
            foot.position.set(xPos, 0.01, 0.06);
            group.add(foot);
        });
        const tailGeometry = new THREE.SphereGeometry(0.18, 10, 10);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.scale.set(0.6, 1.5, 0.5);
        tail.position.set(0, 0.68, -0.48);
        tail.rotation.x = -Math.PI / 5;
        tail.userData.isTail = true;
        group.add(tail);
        return group;
    }

    // CAVALO REALISTA
    createHorseMesh() {
        const group = new THREE.Group();

        // Corpo atlético
        const bodyGeometry = new THREE.SphereGeometry(0.65, 14, 14);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.5, 1.2, 2.2);
        body.position.y = 1.3;
        group.add(body);

        // Peito musculoso
        const chestGeometry = new THREE.SphereGeometry(0.55, 12, 12);
        const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.scale.set(0.9, 1.1, 0.8);
        chest.position.set(0, 1.3, 1.0);
        group.add(chest);

        // Pescoço longo e elegante
        const neckCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.3, 1.2),
            new THREE.Vector3(0, 1.6, 1.35),
            new THREE.Vector3(0, 1.85, 1.45),
            new THREE.Vector3(0, 2.05, 1.55)
        ]);
        const neckGeometry = new THREE.TubeGeometry(neckCurve, 12, 0.28, 10, false);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        group.add(neck);

        // Cabeça alongada
        const headGeometry = new THREE.SphereGeometry(0.32, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(0.75, 0.85, 1.4);
        head.position.set(0, 2.1, 1.65);
        head.userData.isHead = true;
        group.add(head);

        // Focinho
        const snoutGeometry = new THREE.SphereGeometry(0.25, 10, 10);
        const snoutMaterial = new THREE.MeshLambertMaterial({ color: 0xA0522D });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.scale.set(0.7, 0.8, 1);
        snout.position.set(0, 1.95, 2.05);
        group.add(snout);

        // Narinas
        [0.14, -0.14].forEach(xPos => {
            const nostrilGeometry = new THREE.SphereGeometry(0.07, 8, 8);
            const nostrilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const nostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
            nostril.scale.set(1, 0.7, 0.5);
            nostril.position.set(xPos, 1.95, 2.25);
            group.add(nostril);
        });

        // Olhos grandes
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.1, 10, 10);
        const eyeWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pupilGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [0.26, -0.26].forEach(xPos => {
            const eye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
            eye.position.set(xPos, 2.15, 1.85);
            group.add(eye);
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.set(xPos * 1.05, 2.15, 1.92);
            pupil.userData.isPupil = true;
            pupil.userData.originalX = xPos * 1.05;
            group.add(pupil);
        });

        // Orelhas pontudas e móveis
        const earGeometry = new THREE.ConeGeometry(0.14, 0.28, 8);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        [1, -1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.position.set(side * 0.22, 2.42, 1.55);
            ear.rotation.z = side * -Math.PI / 10;
            ear.rotation.x = Math.PI / 12;
            ear.userData.isEar = true;
            group.add(ear);
        });

        // Crina detalhada
        const maneSegments = 7;
        for (let i = 0; i < maneSegments; i++) {
            const maneGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const maneMaterial = new THREE.MeshLambertMaterial({ color: 0x2F1B0F });
            const mane = new THREE.Mesh(maneGeometry, maneMaterial);
            mane.scale.set(0.5, 1.5, 0.6);
            const t = i / maneSegments;
            mane.position.set(0, 2.35 - t * 0.95, 1.45 - t * 0.25);
            mane.rotation.x = -Math.PI / 8;
            group.add(mane);
        }

        // Pernas longas e fortes
        const legGeometry = new THREE.CylinderGeometry(0.16, 0.13, 1.4, 10);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const hoofGeometry = new THREE.CylinderGeometry(0.14, 0.12, 0.18, 8);
        const hoofMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const legPositions = [
            { x: 0.5, y: 0.7, z: 0.8 },
            { x: -0.5, y: 0.7, z: 0.8 },
            { x: 0.5, y: 0.7, z: -0.8 },
            { x: -0.5, y: 0.7, z: -0.8 }
        ];
        legPositions.forEach((pos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, pos.y, pos.z);
            leg.userData.originalY = pos.y;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
            hoof.position.set(pos.x, 0.09, pos.z);
            group.add(hoof);
        });

        // Cauda longa e fluida
        const tailSegments = 6;
        for (let i = 0; i < tailSegments; i++) {
            const radius = 0.07 - i * 0.008;
            const tailGeometry = new THREE.CylinderGeometry(radius, radius + 0.01, 0.38, 8);
            const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x2F1B0F });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 1.5 - i * 0.32, -1.1 - i * 0.18);
            tail.rotation.x = Math.PI / 7 + i * 0.2;
            tail.userData.isTail = true;
            tail.userData.segment = i;
            group.add(tail);
        }

        return group;
    }

    // COELHO FOFO E ÁGIL
    createRabbitMesh() {
        const group = new THREE.Group();

        // Corpo compacto e fofo
        const bodyGeometry = new THREE.SphereGeometry(0.38, 12, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.3, 1.1, 1.4);
        body.position.y = 0.45;
        group.add(body);

        // Camada de pelo extra
        const furGeometry = new THREE.SphereGeometry(0.4, 10, 10);
        const furMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
        const fur = new THREE.Mesh(furGeometry, furMaterial);
        fur.scale.set(1.25, 1.05, 1.35);
        fur.position.y = 0.47;
        group.add(fur);

        // Cabeça arredondada
        const headGeometry = new THREE.SphereGeometry(0.28, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(1, 1.05, 1.1);
        head.position.set(0, 0.62, 0.38);
        head.userData.isHead = true;
        group.add(head);

        // Focinho fofo
        const snoutGeometry = new THREE.SphereGeometry(0.14, 10, 10);
        const snoutMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.scale.set(1.1, 0.8, 1);
        snout.position.set(0, 0.54, 0.58);
        group.add(snout);

        // Narizinho rosa
        const noseGeometry = new THREE.SphereGeometry(0.045, 8, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.56, 0.68);
        group.add(nose);

        // Olhos grandes e expressivos
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.09, 10, 10);
        const eyeWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [0.17, -0.17].forEach(xPos => {
            const eye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
            eye.position.set(xPos, 0.66, 0.53);
            group.add(eye);
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.set(xPos * 1.05, 0.66, 0.59);
            pupil.userData.isPupil = true;
            pupil.userData.originalX = xPos * 1.05;
            group.add(pupil);
        });

        // Orelhas longas e expressivas
        const earGeometry = new THREE.SphereGeometry(0.12, 10, 10);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        const earInnerGeometry = new THREE.SphereGeometry(0.08, 10, 10);
        const earInnerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        [1, -1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.scale.set(0.5, 2.5, 0.4);
            ear.position.set(side * 0.14, 0.95, 0.32);
            ear.rotation.z = side * -Math.PI / 15;
            ear.rotation.x = -Math.PI / 18;
            ear.userData.isEar = true;
            group.add(ear);
            const earInner = new THREE.Mesh(earInnerGeometry, earInnerMaterial);
            earInner.scale.set(0.4, 2.2, 0.3);
            earInner.position.set(side * 0.14, 0.95, 0.34);
            earInner.rotation.z = side * -Math.PI / 15;
            earInner.rotation.x = -Math.PI / 18;
            group.add(earInner);
        });

        // Bigodes detalhados
        const whiskerGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.28, 4);
        const whiskerMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const whiskerPositions = [
            { x: 0.17, y: 0.58, z: 0.61, rot: 0.35 },
            { x: 0.14, y: 0.54, z: 0.63, rot: 0.18 },
            { x: 0.16, y: 0.51, z: 0.62, rot: 0.25 },
            { x: -0.17, y: 0.58, z: 0.61, rot: -0.35 },
            { x: -0.14, y: 0.54, z: 0.63, rot: -0.18 },
            { x: -0.16, y: 0.51, z: 0.62, rot: -0.25 }
        ];
        whiskerPositions.forEach(pos => {
            const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
            whisker.position.set(pos.x, pos.y, pos.z);
            whisker.rotation.y = Math.PI / 2;
            whisker.rotation.z = pos.rot;
            group.add(whisker);
        });

        // Pernas traseiras poderosas
        const backLegGeometry = new THREE.CylinderGeometry(0.09, 0.11, 0.28, 10);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        [0.2, -0.2].forEach((xPos, idx) => {
            const leg = new THREE.Mesh(backLegGeometry, legMaterial);
            leg.position.set(xPos, 0.14, -0.18);
            leg.userData.originalY = 0.14;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const footGeometry = new THREE.SphereGeometry(0.11, 8, 8);
            const foot = new THREE.Mesh(footGeometry, legMaterial);
            foot.scale.set(1, 0.5, 1.5);
            foot.position.set(xPos, 0.04, -0.12);
            group.add(foot);
        });

        // Pernas dianteiras
        const frontLegGeometry = new THREE.CylinderGeometry(0.055, 0.065, 0.22, 8);
        [0.17, -0.17].forEach((xPos, idx) => {
            const leg = new THREE.Mesh(frontLegGeometry, legMaterial);
            leg.position.set(xPos, 0.11, 0.28);
            leg.userData.originalY = 0.11;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx + 2;
            group.add(leg);
            const pawGeometry = new THREE.SphereGeometry(0.07, 8, 8);
            const paw = new THREE.Mesh(pawGeometry, legMaterial);
            paw.scale.set(1, 0.5, 1.2);
            paw.position.set(xPos, 0.02, 0.3);
            group.add(paw);
        });

        // Rabinho pompom
        const tailGeometry = new THREE.SphereGeometry(0.14, 10, 10);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.scale.set(0.9, 1.1, 0.9);
        tail.position.set(0, 0.5, -0.45);
        tail.userData.isTail = true;
        group.add(tail);

        return group;
    }

    // LOBO FEROZ
    createWolfMesh() {
        const group = new THREE.Group();

        // Corpo musculoso
        const bodyGeometry = new THREE.SphereGeometry(0.5, 14, 14);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.5, 1.1, 2.2);
        body.position.y = 0.9;
        group.add(body);

        // Pelagem densa
        const furPositions = [
            { x: 0, y: 1.15, z: 0, sx: 1.55, sy: 0.3, sz: 2.25 },
            { x: 0, y: 0.95, z: -0.7, sx: 1.45, sy: 0.25, sz: 0.8 }
        ];
        furPositions.forEach(fur => {
            const furGeometry = new THREE.SphereGeometry(0.5, 12, 12);
            const furMaterial = new THREE.MeshLambertMaterial({ color: 0x909090 });
            const furMesh = new THREE.Mesh(furGeometry, furMaterial);
            furMesh.scale.set(fur.sx, fur.sy, fur.sz);
            furMesh.position.set(fur.x, fur.y, fur.z);
            group.add(furMesh);
        });

        // Peito claro
        const chestGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const chestMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.scale.set(1.1, 0.9, 0.8);
        chest.position.set(0, 0.75, 0.7);
        group.add(chest);

        // Pescoço forte
        const neckGeometry = new THREE.CylinderGeometry(0.28, 0.34, 0.45, 10);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.set(0, 1.05, 0.92);
        neck.rotation.x = Math.PI / 9;
        group.add(neck);

        // Cabeça
        const headGeometry = new THREE.SphereGeometry(0.35, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(1, 0.9, 1.3);
        head.position.set(0, 1.18, 1.25);
        head.userData.isHead = true;
        group.add(head);

        // Focinho alongado
        const snoutGeometry = new THREE.SphereGeometry(0.25, 10, 10);
        const snoutMaterial = new THREE.MeshLambertMaterial({ color: 0x909090 });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.scale.set(0.8, 0.7, 1.3);
        snout.position.set(0, 1.05, 1.62);
        group.add(snout);

        // Nariz preto
        const noseGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.scale.set(1.2, 0.8, 0.8);
        nose.position.set(0, 1.05, 1.88);
        group.add(nose);

        // Olhos amarelos intimidadores
        const eyeGeometry = new THREE.SphereGeometry(0.09, 10, 10);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [0.23, -0.23].forEach(xPos => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(xPos, 1.22, 1.5);
            group.add(eye);
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.set(xPos * 1.05, 1.22, 1.57);
            pupil.userData.isPupil = true;
            pupil.userData.originalX = xPos * 1.05;
            group.add(pupil);
        });

        // Orelhas pontudas alertas
        const earGeometry = new THREE.ConeGeometry(0.16, 0.32, 8);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        [1, -1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.position.set(side * 0.28, 1.48, 1.18);
            ear.rotation.z = side * -Math.PI / 12;
            ear.rotation.x = Math.PI / 12;
            ear.userData.isEar = true;
            group.add(ear);
        });

        // Dentes afiados
        const toothGeometry = new THREE.ConeGeometry(0.05, 0.15, 6);
        const toothMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const toothPositions = [
            { x: 0.18, y: 0.98, z: 1.8 },
            { x: -0.18, y: 0.98, z: 1.8 },
            { x: 0.1, y: 0.98, z: 1.83 },
            { x: -0.1, y: 0.98, z: 1.83 }
        ];
        toothPositions.forEach(pos => {
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(pos.x, pos.y, pos.z);
            tooth.rotation.x = Math.PI;
            group.add(tooth);
        });

        // Pernas fortes
        const legGeometry = new THREE.CylinderGeometry(0.13, 0.11, 1.0, 10);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const legPositions = [
            { x: 0.42, y: 0.5, z: 0.6 },
            { x: -0.42, y: 0.5, z: 0.6 },
            { x: 0.42, y: 0.5, z: -0.6 },
            { x: -0.42, y: 0.5, z: -0.6 }
        ];
        legPositions.forEach((pos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, pos.y, pos.z);
            leg.userData.originalY = pos.y;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const pawGeometry = new THREE.SphereGeometry(0.13, 8, 8);
            const pawMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
            const paw = new THREE.Mesh(pawGeometry, pawMaterial);
            paw.scale.set(1, 0.5, 1.2);
            paw.position.set(pos.x, 0.05, pos.z);
            group.add(paw);
        });

        // Cauda espessa
        const tailSegments = 4;
        for (let i = 0; i < tailSegments; i++) {
            const radius = 0.12 - i * 0.02;
            const tailGeometry = new THREE.CylinderGeometry(radius, radius + 0.015, 0.42, 10);
            const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 1.0 - i * 0.28, -1.0 - i * 0.28);
            tail.rotation.x = Math.PI / 6 + i * 0.22;
            tail.userData.isTail = true;
            tail.userData.segment = i;
            group.add(tail);
        }

        // Ponta da cauda clara
        const tailTipGeometry = new THREE.SphereGeometry(0.14, 10, 10);
        const tailTipMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
        const tailTip = new THREE.Mesh(tailTipGeometry, tailTipMaterial);
        tailTip.scale.set(0.9, 1.2, 0.9);
        tailTip.position.set(0, 0.3, -1.8);
        group.add(tailTip);

        return group;
    }

    // GATO ÁGIL
    createCatMesh() {
        const group = new THREE.Group();

        // Corpo esguio e elegante
        const bodyGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.4, 0.9, 1.8);
        body.position.y = 0.55;
        group.add(body);

        // Listras características
        const stripePositions = [
            { x: 0, y: 0.67, z: 0.35, w: 1.42, h: 0.12, d: 0.18 },
            { x: 0, y: 0.67, z: 0.05, w: 1.42, h: 0.12, d: 0.18 },
            { x: 0, y: 0.67, z: -0.25, w: 1.42, h: 0.12, d: 0.18 },
            { x: 0, y: 0.67, z: -0.55, w: 1.42, h: 0.12, d: 0.18 }
        ];
        stripePositions.forEach(stripe => {
            const stripeGeometry = new THREE.BoxGeometry(stripe.w, stripe.h, stripe.d);
            const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const stripeMesh = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripeMesh.position.set(stripe.x, stripe.y, stripe.z);
            group.add(stripeMesh);
        });

        // Peito branco
        const chestGeometry = new THREE.SphereGeometry(0.28, 10, 10);
        const chestMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.scale.set(1, 1, 0.8);
        chest.position.set(0, 0.48, 0.5);
        group.add(chest);

        // Pescoço
        const neckGeometry = new THREE.CylinderGeometry(0.19, 0.22, 0.28, 10);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.set(0, 0.68, 0.6);
        neck.rotation.x = Math.PI / 12;
        group.add(neck);

        // Cabeça redonda
        const headGeometry = new THREE.SphereGeometry(0.27, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(1.05, 1, 1.05);
        head.position.set(0, 0.82, 0.7);
        head.userData.isHead = true;
        group.add(head);

        // Focinho branco
        const snoutGeometry = new THREE.SphereGeometry(0.17, 10, 10);
        const snoutMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.scale.set(1.3, 0.85, 1.05);
        snout.position.set(0, 0.74, 0.92);
        group.add(snout);

        // Narizinho rosa
        const noseGeometry = new THREE.SphereGeometry(0.045, 8, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.76, 1.02);
        group.add(nose);

        // Olhos felinos expressivos
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.11, 10, 10);
        const eyeWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        [0.17, -0.17].forEach(xPos => {
            const eye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
            eye.position.set(xPos, 0.85, 0.87);
            group.add(eye);
        });

        // Pupilas verticais características
        const pupilGeometry = new THREE.BoxGeometry(0.02, 0.09, 0.02);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        [0.19, -0.19].forEach(xPos => {
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.set(xPos, 0.85, 0.95);
            pupil.userData.isPupil = true;
            pupil.userData.originalX = xPos;
            group.add(pupil);
        });

        // Orelhas triangulares
        const earGeometry = new THREE.ConeGeometry(0.13, 0.24, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
        const earInnerGeometry = new THREE.ConeGeometry(0.08, 0.18, 4);
        const earInnerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        [1, -1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.position.set(side * 0.2, 1.02, 0.68);
            ear.rotation.z = side * -Math.PI / 10;
            ear.userData.isEar = true;
            group.add(ear);
            const earInner = new THREE.Mesh(earInnerGeometry, earInnerMaterial);
            earInner.position.set(side * 0.2, 1.0, 0.7);
            earInner.rotation.z = side * -Math.PI / 10;
            group.add(earInner);
        });

        // Bigodes longos e expressivos
        const whiskerGeometry = new THREE.CylinderGeometry(0.006, 0.006, 0.35, 4);
        const whiskerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const whiskerPositions = [
            { x: 0.2, y: 0.78, z: 0.95, rot: 0.45 },
            { x: 0.17, y: 0.74, z: 0.98, rot: 0.25 },
            { x: 0.2, y: 0.7, z: 0.96, rot: 0.35 },
            { x: -0.2, y: 0.78, z: 0.95, rot: -0.45 },
            { x: -0.17, y: 0.74, z: 0.98, rot: -0.25 },
            { x: -0.2, y: 0.7, z: 0.96, rot: -0.35 }
        ];
        whiskerPositions.forEach(pos => {
            const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
            whisker.position.set(pos.x, pos.y, pos.z);
            whisker.rotation.y = Math.PI / 2;
            whisker.rotation.z = pos.rot;
            group.add(whisker);
        });

        // Pernas ágeis
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 10);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
        const legPositions = [
            { x: 0.28, y: 0.275, z: 0.42 },
            { x: -0.28, y: 0.275, z: 0.42 },
            { x: 0.28, y: 0.275, z: -0.42 },
            { x: -0.28, y: 0.275, z: -0.42 }
        ];
        legPositions.forEach((pos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, pos.y, pos.z);
            leg.userData.originalY = pos.y;
            leg.userData.isLeg = true;
            leg.userData.legIndex = idx;
            group.add(leg);
            const pawGeometry = new THREE.SphereGeometry(0.09, 8, 8);
            const pawMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const paw = new THREE.Mesh(pawGeometry, pawMaterial);
            paw.scale.set(1, 0.5, 1);
            paw.position.set(pos.x, 0.02, pos.z);
            group.add(paw);
        });

        // Cauda longa e flexível
        const tailSegments = 6;
        for (let i = 0; i < tailSegments; i++) {
            const radius = 0.09 - i * 0.011;
            const tailGeometry = new THREE.CylinderGeometry(radius, radius + 0.01, 0.28, 10);
            const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0.65 - i * 0.06, -0.65 - i * 0.22);
            tail.rotation.x = Math.PI / 14 + i * 0.18;
            tail.userData.isTail = true;
            tail.userData.segment = i;
            group.add(tail);
            // Listras na cauda
            if (i % 2 === 0) {
                const stripeGeometry = new THREE.CylinderGeometry(radius + 0.005, radius + 0.015, 0.14, 10);
                const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.position.set(0, 0.65 - i * 0.06, -0.65 - i * 0.22);
                stripe.rotation.x = Math.PI / 14 + i * 0.18;
                group.add(stripe);
            }
        }

        // Ponta da cauda
        const tailTipGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const tailTipMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const tailTip = new THREE.Mesh(tailTipGeometry, tailTipMaterial);
        tailTip.scale.set(0.9, 1.2, 0.9);
        tailTip.position.set(0, 0.3, -1.8);
        group.add(tailTip);

        return group;
    }

    createMesh() {
        const meshCreators = {
            'cow': () => this.createCowMesh(),
            'pig': () => this.createPigMesh(),
            'sheep': () => this.createSheepMesh(),
            'chicken': () => this.createChickenMesh(),
            'horse': () => this.createHorseMesh(),
            'rabbit': () => this.createRabbitMesh(),
            'wolf': () => this.createWolfMesh(),
            'cat': () => this.createCatMesh()
        };
        this.mesh = meshCreators[this.type] ? meshCreators[this.type]() : this.createDefaultMesh();
        this.mesh.position.set(this.x, this.y, this.z);
        scene.add(this.mesh);
        animalMeshes.push(this.mesh);
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    createDefaultMesh() {
        const animalType = animalTypes[this.type];
        const geometry = new THREE.BoxGeometry(
            animalType.size.width,
            animalType.size.height,
            animalType.size.depth
        );
        const material = new THREE.MeshLambertMaterial({ color: animalType.color });
        return new THREE.Mesh(geometry, material);
    }

    // SISTEMA DE IA INTELIGENTE
    updateBehavior() {
        this.stateTimer++;
        this.detectNearbyAnimals();

        // Atualizar valores internos
        this.hunger = Math.min(100, this.hunger + 0.05);
        this.energy = Math.max(0, this.energy - (this.state === 'fleeing' ? 0.3 : 0.05));
        this.fear = Math.max(0, this.fear - 0.1);

        // Decisão de comportamento baseada em estado
        switch(this.state) {
            case 'idle':
                this.behaviorIdle();
                break;
            case 'wandering':
                this.behaviorWander();
                break;
            case 'grazing':
                this.behaviorGraze();
                break;
            case 'fleeing':
                this.behaviorFlee();
                break;
            case 'socializing':
                this.behaviorSocialize();
                break;
        }

        // Transições de estado
        this.checkStateTransitions();
    }

    detectNearbyAnimals() {
        this.nearbyAnimals = [];
        if (typeof animals !== 'undefined') {
            animals.forEach(other => {
                if (other !== this) {
                    const dx = other.x - this.x;
                    const dz = other.z - this.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    if (distance < this.detectionRadius) {
                        this.nearbyAnimals.push({ animal: other, distance: distance, dx: dx, dz: dz });
                    }
                }
            });
        }
    }

    behaviorIdle() {
        if (this.stateTimer > 60 + Math.random() * 120) {
            this.setState(Math.random() < 0.7 ? 'wandering' : 'grazing');
        }
    }

    behaviorWander() {
        if (!this.hasTarget() || this.stateTimer > 100) {
            this.setRandomTarget(8);
            this.stateTimer = 0;
        }
        this.moveToTarget();
        if (this.reachedTarget()) {
            this.visitedPositions.push({x: this.targetX, z: this.targetZ});
            if (this.visitedPositions.length > this.maxMemory) {
                this.visitedPositions.shift();
            }
            this.setState(Math.random() < 0.4 ? 'idle' : 'grazing');
        }
    }

    behaviorGraze() {
        // Animação de pastagem (abaixar cabeça)
        if (this.stateTimer > 80 + Math.random() * 100) {
            this.hunger = Math.max(0, this.hunger - 30);
            this.energy = Math.min(100, this.energy + 10);
            this.setState('idle');
        }
    }

    behaviorFlee() {
        // Fugir de predadores
        const threat = this.findNearestThreat();
        if (threat) {
            const fleeX = this.x - threat.dx * 2;
            const fleeZ = this.z - threat.dz * 2;
            this.setTarget(fleeX, fleeZ);
            this.moveToTarget(this.speed * 1.8);
        } else {
            this.setState('idle');
        }
        if (this.stateTimer > 100 || this.fear < 20) {
            this.setState('idle');
        }
    }

    behaviorSocialize() {
        // Animais de rebanho se aproximam
        const sameSpecies = this.nearbyAnimals.filter(n => n.animal.type === this.type);
        if (sameSpecies.length > 0) {
            const nearest = sameSpecies[0];
            if (nearest.distance > 2) {
                this.setTarget(nearest.animal.x, nearest.animal.z);
                this.moveToTarget(this.speed * 0.7);
            }
        }
        if (this.stateTimer > 150) {
            this.setState('idle');
        }
    }

    checkStateTransitions() {
        // Detectar predadores
        const predators = this.nearbyAnimals.filter(n => (n.animal.type === 'wolf' || n.animal.type === 'cat') && n.distance < this.fleeRadius );
        if (predators.length > 0 && this.state !== 'fleeing') {
            this.fear = 100;
            this.setState('fleeing');
            return;
        }

        // Comportamento social para animais de rebanho
        if (['cow', 'sheep', 'pig'].includes(this.type)) {
            const sameSpecies = this.nearbyAnimals.filter(n => n.animal.type === this.type && n.distance < this.socialRadius );
            if (sameSpecies.length > 0 && Math.random() < 0.01 && this.state === 'idle') {
                this.setState('socializing');
                return;
            }
        }

        // Fome
        if (this.hunger > 70 && this.state === 'idle' && Math.random() < 0.02) {
            this.setState('grazing');
        }

        // Cansaço
        if (this.energy < 30 && this.state !== 'idle') {
            this.setState('idle');
        }
    }

    setState(newState) {
        this.state = newState;
        this.stateTimer = 0;
    }

    setRandomTarget(radius) {
        let valid = false;
        let targetX, targetZ;
        while (!valid) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius + 2;
            targetX = this.x + Math.cos(angle) * distance;
            targetZ = this.z + Math.sin(angle) * distance;

            // Check if target is on valid terrain
            const blockBelowTarget = getBlock(Math.floor(targetX), Math.floor(getHeight(targetX, targetZ)), Math.floor(targetZ));
            if (blockBelowTarget && (blockBelowTarget.type === 'grass' || blockBelowTarget.type === 'dirt')) {
                // Avoid recently visited positions
                const tooCloseToVisited = this.visitedPositions.some(pos => {
                    const dx = pos.x - targetX;
                    const dz = pos.z - targetZ;
                    return Math.sqrt(dx * dx + dz * dz) < 2;
                });
                if (!tooCloseToVisited) {
                    valid = true;
                }
            }
        }
        this.targetX = targetX;
        this.targetZ = targetZ;
    }

    setTarget(x, z) {
        this.targetX = x;
        this.targetZ = z;
    }

    hasTarget() {
        return this.targetX !== undefined && this.targetZ !== undefined;
    }

    reachedTarget() {
        const dx = this.targetX - this.x;
        const dz = this.targetZ - this.z;
        return Math.sqrt(dx * dx + dz * dz) < 0.5;
    }

    checkCollision(newX, newZ) {
        const tempBox = this.boundingBox.clone();
        tempBox.translate(new THREE.Vector3(newX - this.x, 0, newZ - this.z));
        for (let other of animals) {
            if (other !== this && other.boundingBox.intersectsBox(tempBox)) {
                return true;
            }
        }
        return false;
    }

    moveToTarget(speedMultiplier = 1) {
        const dx = this.targetX - this.x;
        const dz = this.targetZ - this.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance > 0.5) {
            const moveSpeed = this.speed * speedMultiplier;
            const stepX = (dx / distance) * moveSpeed;
            const stepZ = (dz / distance) * moveSpeed;
            const newX = this.x + stepX;
            const newZ = this.z + stepZ;

            // Check collision
            if (this.checkCollision(newX, newZ)) {
                // Adjust direction slightly to avoid collision
                const angleOffset = (Math.random() - 0.5) * Math.PI / 2;
                const newDx = dx * Math.cos(angleOffset) - dz * Math.sin(angleOffset);
                const newDz = dx * Math.sin(angleOffset) + dz * Math.cos(angleOffset);
                this.targetX = this.x + newDx;
                this.targetZ = this.z + newDz;
                return;
            }

            this.x = newX;
            this.z = newZ;

            // Update y to follow terrain
            if (typeof getHeight === 'function') {
                this.y = getHeight(this.x, this.z) + 1; // Assuming +1 offset for animal height
            }

            // Verificar terreno
            if (typeof getBlock === 'function') {
                const blockBelow = getBlock(Math.floor(this.x), Math.floor(this.y - 1), Math.floor(this.z));
                if (!blockBelow || (blockBelow.type !== 'grass' && blockBelow.type !== 'dirt')) {
                    this.x -= stepX;
                    this.z -= stepZ;
                    this.y = getHeight(this.x, this.z) + 1;
                    this.setState('idle');
                    return;
                }
            }

            this.direction.set(dx, 0, dz).normalize();
        }
    }

    findNearestThreat() {
        const threats = this.nearbyAnimals.filter(n => n.animal.type === 'wolf' || n.animal.type === 'cat' );
        return threats.length > 0 ? threats.sort((a, b) => a.distance - b.distance)[0] : null;
    }

    update() {
        this.animationTime += 0.1;

        // Sistema de IA
        this.updateBehavior();

        // Animações especiais por tipo
        if (this.type === 'rabbit' && this.state === 'fleeing') {
            this.jumpPhase += 0.25;
            const jumpHeight = Math.abs(Math.sin(this.jumpPhase)) * 0.4;
            if (typeof getHeight === 'function') {
                this.y = getHeight(this.x, this.z) + 1 + jumpHeight;
            }
        } else {
            // For all animals, ensure y follows terrain
            if (typeof getHeight === 'function') {
                this.y = getHeight(this.x, this.z) + 1;
            }
        }

        // Atualizar mesh
        if (this.mesh) {
            this.mesh.position.set(this.x, this.y, this.z);

            // Rotação suave
            if (this.state !== 'idle') {
                const targetRotation = Math.atan2(-this.direction.x, -this.direction.z);
                const currentRotation = this.mesh.rotation.y;
                const rotationDiff = targetRotation - currentRotation;
                // Normalizar diferença de ângulo
                let normalizedDiff = rotationDiff;
                while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
                while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
                this.mesh.rotation.y += normalizedDiff * 0.15;
            }

            // Animações
            this.animateAdvanced();

            // Atualizar bounding box
            if (this.boundingBox) {
                this.boundingBox.setFromObject(this.mesh);
            }
        }
    }

    animateAdvanced() {
        if (!this.mesh) return;

        // Respiração
        const breathScale = 1 + Math.sin(this.animationTime * 2) * 0.018;
        this.mesh.scale.set(breathScale, breathScale, breathScale);

        // Pernas
        this.mesh.traverse(child => {
            if (child.userData.isLeg) {
                const isMoving = this.state === 'wandering' || this.state === 'fleeing';
                const speed = this.state === 'fleeing' ? 14 : this.type === 'chicken' ? 12 : 8;
                const amplitude = this.state === 'fleeing' ? 0.15 : 0.1;
                if (isMoving) {
                    const phase = child.userData.legIndex % 2 === 0 ? 0 : Math.PI;
                    const legMove = Math.sin(this.animationTime * speed + phase) * amplitude;
                    child.position.y = child.userData.originalY + legMove;
                } else {
                    child.position.y += (child.userData.originalY - child.position.y) * 0.1;
                }
            }

            // Cabeça
            if (child.userData.isHead) {
                if (this.state === 'grazing') {
                    child.rotation.x = Math.sin(this.animationTime * 0.5) * 0.3 - 0.5;
                } else if (this.state === 'fleeing') {
                    child.rotation.y = Math.sin(this.animationTime * 4) * 0.4;
                } else {
                    child.rotation.y = Math.sin(this.animationTime * 0.5) * 0.2;
                    child.rotation.x = Math.sin(this.animationTime * 0.3) * 0.1;
                }
            }

            // Pupilas seguem direção
            if (child.userData.isPupil && this.state !== 'idle') {
                const lookOffset = this.direction.x * 0.02;
                child.position.x += (lookOffset - (child.position.x - child.userData.originalX || 0)) * 0.1;
            }

            // Cauda
            if (child.userData.isTail) {
                const segment = child.userData.segment || 0;
                const swingSpeed = this.state === 'fleeing' ? 8 : 4;
                const swingAmount = this.type === 'cat' ? 0.6 : 0.4;
                child.rotation.z = Math.sin(this.animationTime * swingSpeed + segment * 0.5) * swingAmount;
            }

            // Asas (galinhas)
            if (child.userData.isWing) {
                const flapAmount = this.state === 'fleeing' ? 0.5 : (this.state === 'wandering' ? 0.3 : 0.08);
                const flapSpeed = this.state === 'fleeing' ? 18 : 6;
                const flap = Math.sin(this.animationTime * flapSpeed) * flapAmount;
                if (child.userData.side === 'right') {
                    child.rotation.z = Math.PI / 10 + flap;
                } else {
                    child.rotation.z = -Math.PI / 10 - flap;
                }
            }

            // Orelhas
            if (child.userData.isEar) {
                const twitch = Math.random() < 0.02 ? Math.random() * 0.3 : 0;
                child.rotation.x += twitch;
            }
        });
    }

    remove() {
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            scene.remove(this.mesh);
            const index = animalMeshes.indexOf(this.mesh);
            if (index > -1) animalMeshes.splice(index, 1);
        }
    }

    damage(amount) {
        this.health -= amount;
        this.fear = 100;
        this.setState('fleeing');
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.material) {
                    const originalColor = child.material.color.clone();
                    child.material.color.set(0xFF0000);
                    setTimeout(() => {
                        if (child.material) {
                            child.material.color.copy(originalColor);
                        }
                    }, 100);
                }
            });
        }
        if (this.health <= 0) {
            this.dropItems();
            this.remove();
            const animalIndex = animals.indexOf(this);
            if (animalIndex > -1) animals.splice(animalIndex, 1);
            return true;
        }
        return false;
    }

    dropItems() {
        const animalType = animalTypes[this.type];
        if (animalType && animalType.drops) {
            animalType.drops.forEach(drop => {
                const count = Math.floor(Math.random() * (animalType.dropCount.max - animalType.dropCount.min + 1)) + animalType.dropCount.min;
                if (count > 0 && typeof addToInventory === 'function') {
                    addToInventory(drop, count);
                }
            });
        }
    }
}

function updateAnimals() {
    animals.forEach(animal => {
        if (animal.update) {
            animal.update();
        }
    });
    document.getElementById('animals-count').textContent = animals.length;
}

// MODIFIQUE a função spawnAnimals assim:
function spawnAnimals(chunkX, chunkZ) {
    const sx = chunkX * CHUNK_SIZE;
    const sz = chunkZ * CHUNK_SIZE;
    const biome = hash(chunkX * 0.1, chunkZ * 0.1);

    // 🔥 VERIFICAÇÃO DE LIMITE GLOBAL
    if (animals.length >= MAX_ANIMALS) {
        return; // Não spawna mais animais se já atingiu o limite
    }

    let animalCount = 0;
    if (biome > 0.85) {
        animalCount = Math.floor(Math.random() * 0.10) + 1;
    } else if (biome > 0.7) {
        animalCount = Math.floor(Math.random() * 0.10) + 1;
    } else {
        animalCount = Math.floor(Math.random() * 0.10) + 1;
    }

    // 🔥 REDUÇÃO ADICIONAL: Apenas spawnar animais em 50% dos chunks
    if (Math.random() > 0.5) {
        return;
    }

    for (let i = 0; i < animalCount; i++) {
        // Verificar limite novamente dentro do loop
        if (animals.length >= MAX_ANIMALS) {
            break;
        }
        const x = sx + Math.random() * CHUNK_SIZE;
        const z = sz + Math.random() * CHUNK_SIZE;
        const y = getHeight(x, z) + 1;
        const blockBelow = getBlock(Math.floor(x), Math.floor(y - 1), Math.floor(z));
        if (blockBelow && (blockBelow.type === 'grass' || blockBelow.type === 'dirt')) {
            let type;
            if (biome > 0.85) {
                const rand = Math.random();
                type = rand < 0.3 ? 'wolf' : rand < 0.6 ? 'rabbit' : 'sheep';
            } else if (biome > 0.7) {
                const rand = Math.random();
                type = rand < 0.4 ? 'chicken' : rand < 0.7 ? 'pig' : 'cow';
            } else {
                const rand = Math.random();
                if (rand < 0.15) type = 'cow';
                else if (rand < 0.3) type = 'pig';
                else if (rand < 0.45) type = 'sheep';
                else if (rand < 0.6) type = 'chicken';
                else if (rand < 0.7) type = 'horse';
                else if (rand < 0.85) type = 'rabbit';
                else if (rand < 0.92) type = 'cat';
                else type = 'wolf';
            }
            const animal = new Animal(type, x, y, z);
            animals.push(animal);
        }
    }
}
