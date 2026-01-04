class Village {
    constructor(x, y, z, profession) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.profession = profession || this.getRandomProfession();
        this.health = 20 + Math.floor(Math.random() * 5); // Slight health variation
        this.homeX = x;
        this.homeZ = z;
        this.wanderRadius = 8 + Math.random() * 10; // More varied wander radius
        this.targetX = x;
        this.targetZ = z;
        this.speed = 0.012 + (Math.random() - 0.5) * 0.008; // More varied speed
        this.moveTimer = Math.floor(Math.random() * 180); // Random initial timer
        this.animationTime = 0;
        this.idleAnimationTime = 0;
        this.mesh = null;
        this.boundingBox = null;
        this.skinTone = this.getRandomSkinTone();
        this.hairColor = this.getRandomHairColor();
        this.eyeColor = this.getRandomEyeColor();
        this.heightScale = 0.85 + Math.random() * 0.3; // More height variation
        this.bodyScale = 0.9 + Math.random() * 0.2; // Body width variation
        this.clothingColor = this.getClothingColor();
        this.accessoryColor = this.getAccessoryColor();
        this.gender = Math.random() < 0.5 ? 'male' : 'female'; // Gender variation for details
        this.beard = this.gender === 'male' && Math.random() < 0.6; // Beard for males
        this.hairStyle = Math.floor(Math.random() * 3); // Different hair styles
        this.createMesh();
    }

    getRandomProfession() {
        const professions = ['farmer', 'librarian', 'blacksmith', 'priest', 'butcher', 'fisherman', 'cartographer', 'fletcher'];
        return professions[Math.floor(Math.random() * professions.length)];
    }

    getRandomSkinTone() {
        const tones = [0xFFDBAC, 0xE3B98A, 0xD2A679, 0xC08F5E, 0xA0704A, 0x8B5A2B, 0x7B4B2A, 0x6B3E26];
        return tones[Math.floor(Math.random() * tones.length)];
    }

    getRandomHairColor() {
        const colors = [0x4B3621, 0x3B2F1E, 0x2B2315, 0x1B170D, 0x8B4513, 0xA0522D, 0x000000, 0xFFD700];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomEyeColor() {
        const colors = [0x000000, 0x654321, 0x8B4513, 0x228B22, 0x4169E1, 0xA52A2A];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getClothingColor() {
        const professionColors = {
            farmer: [0x8B4513, 0xA0522D, 0xCD853F, 0xDEB887],
            librarian: [0xFFFFFF, 0xF5F5F5, 0xDCDCDC, 0xC0C0C0],
            blacksmith: [0x696969, 0x808080, 0xA9A9A9, 0xBEBEBE],
            priest: [0x800080, 0x9932CC, 0xBA55D3, 0xDA70D6],
            butcher: [0xFFEBCD, 0xFFE4C4, 0xFFDAB9, 0xFFDEAD],
            fisherman: [0x20B2AA, 0x48D1CC, 0x00CED1, 0x5F9EA0],
            cartographer: [0xDAA520, 0xB8860B, 0xCDAD00, 0xEEE8AA],
            fletcher: [0x556B2F, 0x6B8E23, 0x808000, 0x9ACD32]
        };
        const colors = professionColors[this.profession] || [0x8B4513];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getAccessoryColor() {
        return 0xFFD700 + Math.floor(Math.random() * 0x202020); // Goldish variations
    }

    createMesh() {
        const group = new THREE.Group();
        group.scale.set(this.bodyScale, this.heightScale, this.bodyScale); // Apply scales

        // Torso (more realistic: truncated cone)
        const torsoGeo = new THREE.CylinderGeometry(0.28, 0.35, 1.0, 32, 4, false);
        const torsoMat = new THREE.MeshLambertMaterial({ color: this.clothingColor });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 1.0;
        group.add(torso);

        // Clothing layers (e.g., shirt sleeves, pants)
        const shirtGeo = new THREE.CylinderGeometry(0.29, 0.36, 0.8, 32);
        const shirtMat = new THREE.MeshLambertMaterial({ color: this.clothingColor * 1.1 }); // Slightly brighter
        const shirt = new THREE.Mesh(shirtGeo, shirtMat);
        shirt.position.y = 1.1;
        group.add(shirt);

        const pantsGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.6, 32);
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const pants = new THREE.Mesh(pantsGeo, pantsMat);
        pants.position.y = 0.5;
        group.add(pants);

        // Profession-specific clothing and accessories
        this.addProfessionAccessories(group);

        // Head (icosahedron for smoother sphere)
        const headGeo = new THREE.IcosahedronGeometry(0.35, 2);
        const headMat = new THREE.MeshLambertMaterial({ color: this.skinTone });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.75;
        group.add(head);

        // Facial features
        // Eyes (with pupils)
        const eyeGeo = new THREE.SphereGeometry(0.06, 16, 16);
        const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const leftEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
        leftEyeWhite.position.set(-0.14, 1.78, 0.28);
        group.add(leftEyeWhite);
        const rightEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
        rightEyeWhite.position.set(0.14, 1.78, 0.28);
        group.add(rightEyeWhite);

        const pupilGeo = new THREE.SphereGeometry(0.03, 16, 16);
        const pupilMat = new THREE.MeshLambertMaterial({ color: this.eyeColor });
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.14, 1.78, 0.31);
        group.add(leftPupil);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.14, 1.78, 0.31);
        group.add(rightPupil);

        // Nose (prism-like for detail)
        const noseGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.3, 8, 1, false);
        const noseMat = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 1.65, 0.32);
        nose.rotation.x = Math.PI / 2;
        group.add(nose);

        // Mouth (curved cylinder)
        const mouthGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 32, Math.PI);
        const mouthMat = new THREE.MeshLambertMaterial({ color: 0xC71585 });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 1.55, 0.3);
        mouth.rotation.x = Math.PI / 2;
        group.add(mouth);

        // Ears
        const earGeo = new THREE.SphereGeometry(0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const earMat = new THREE.MeshLambertMaterial({ color: this.skinTone });
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.36, 1.75, 0.05);
        leftEar.rotation.y = Math.PI / 2;
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.36, 1.75, 0.05);
        rightEar.rotation.y = -Math.PI / 2;
        group.add(rightEar);

        // Hair variations
        this.addHair(group);

        // Beard if applicable
        if (this.beard) {
            const beardGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1); // Simple for now, can be more detailed
            const beardMat = new THREE.MeshLambertMaterial({ color: this.hairColor });
            const beard = new THREE.Mesh(beardGeo, beardMat);
            beard.position.set(0, 1.5, 0.3);
            group.add(beard);
        }

        // Arms (tapered cylinders with elbows)
        const upperArmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.4, 16);
        const armMat = new THREE.MeshLambertMaterial({ color: this.clothingColor });
        const leftUpperArm = new THREE.Mesh(upperArmGeo, armMat);
        leftUpperArm.position.set(-0.32, 1.4, 0);
        leftUpperArm.userData.isArm = true;
        leftUpperArm.userData.part = 'upper';
        leftUpperArm.userData.side = 'left';
        group.add(leftUpperArm);

        const lowerArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.4, 16);
        const leftLowerArm = new THREE.Mesh(lowerArmGeo, armMat);
        leftLowerArm.position.set(-0.32, 1.0, 0);
        leftLowerArm.userData.isArm = true;
        leftLowerArm.userData.part = 'lower';
        leftLowerArm.userData.side = 'left';
        group.add(leftLowerArm);

        const rightUpperArm = new THREE.Mesh(upperArmGeo, armMat);
        rightUpperArm.position.set(0.32, 1.4, 0);
        rightUpperArm.userData.isArm = true;
        rightUpperArm.userData.part = 'upper';
        rightUpperArm.userData.side = 'right';
        group.add(rightUpperArm);

        const rightLowerArm = new THREE.Mesh(lowerArmGeo, armMat);
        rightLowerArm.position.set(0.32, 1.0, 0);
        rightLowerArm.userData.isArm = true;
        rightLowerArm.userData.part = 'lower';
        rightLowerArm.userData.side = 'right';
        group.add(rightLowerArm);

        // Hands (more detailed: box with fingers)
        const handGeo = new THREE.BoxGeometry(0.12, 0.15, 0.1);
        const handMat = new THREE.MeshLambertMaterial({ color: this.skinTone });
        const leftHand = new THREE.Mesh(handGeo, handMat);
        leftHand.position.set(-0.32, 0.8, 0);
        group.add(leftHand);
        const rightHand = new THREE.Mesh(handGeo, handMat);
        rightHand.position.set(0.32, 0.8, 0);
        group.add(rightHand);

        // Fingers (simple cylinders)
        for (let i = 0; i < 4; i++) {
            const fingerGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
            const fingerMat = new THREE.MeshLambertMaterial({ color: this.skinTone });
            const leftFinger = new THREE.Mesh(fingerGeo, fingerMat);
            leftFinger.position.set(-0.32 + (i - 1.5) * 0.03, 0.7, 0);
            leftFinger.rotation.z = Math.PI / 2;
            group.add(leftFinger);
            const rightFinger = new THREE.Mesh(fingerGeo, fingerMat);
            rightFinger.position.set(0.32 + (i - 1.5) * 0.03, 0.7, 0);
            rightFinger.rotation.z = Math.PI / 2;
            group.add(rightFinger);
        }

        // Legs (tapered with knees)
        const upperLegGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.45, 16);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const leftUpperLeg = new THREE.Mesh(upperLegGeo, legMat);
        leftUpperLeg.position.set(-0.15, 0.7, 0);
        leftUpperLeg.userData.isLeg = true;
        leftUpperLeg.userData.part = 'upper';
        leftUpperLeg.userData.side = 'left';
        group.add(leftUpperLeg);

        const lowerLegGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.45, 16);
        const leftLowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
        leftLowerLeg.position.set(-0.15, 0.25, 0);
        leftLowerLeg.userData.isLeg = true;
        leftLowerLeg.userData.part = 'lower';
        leftLowerLeg.userData.side = 'left';
        group.add(leftLowerLeg);

        const rightUpperLeg = new THREE.Mesh(upperLegGeo, legMat);
        rightUpperLeg.position.set(0.15, 0.7, 0);
        rightUpperLeg.userData.isLeg = true;
        rightUpperLeg.userData.part = 'upper';
        rightUpperLeg.userData.side = 'right';
        group.add(rightUpperLeg);

        const rightLowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
        rightLowerLeg.position.set(0.15, 0.25, 0);
        rightLowerLeg.userData.isLeg = true;
        rightLowerLeg.userData.part = 'lower';
        rightLowerLeg.userData.side = 'right';
        group.add(rightLowerLeg);

        // Feet (detailed shoes)
        const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.35);
        const footMat = new THREE.MeshLambertMaterial({ color: 0x3D2B1F });
        const leftFoot = new THREE.Mesh(footGeo, footMat);
        leftFoot.position.set(-0.15, 0.06, 0.08);
        group.add(leftFoot);
        const rightFoot = new THREE.Mesh(footGeo, footMat);
        rightFoot.position.set(0.15, 0.06, 0.08);
        group.add(rightFoot);

        this.mesh = group;
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.userData.isVillager = true;
        scene.add(this.mesh);
        villagerMeshes.push(this.mesh);
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    addProfessionAccessories(group) {
        switch (this.profession) {
            case 'farmer':
                // Hoe tool
                const hoeHandleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
                const hoeHandleMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
                const hoeHandle = new THREE.Mesh(hoeHandleGeo, hoeHandleMat);
                hoeHandle.position.set(0.35, 1.0, 0.1);
                hoeHandle.rotation.z = Math.PI / 4;
                group.add(hoeHandle);
                const hoeHeadGeo = new THREE.BoxGeometry(0.2, 0.1, 0.05);
                const hoeHeadMat = new THREE.MeshLambertMaterial({ color: 0xA9A9A9 });
                const hoeHead = new THREE.Mesh(hoeHeadGeo, hoeHeadMat);
                hoeHead.position.set(0.45, 0.7, 0.1);
                hoeHead.rotation.z = Math.PI / 4;
                group.add(hoeHead);
                // Apron
                const apronGeo = new THREE.BoxGeometry(0.5, 0.7, 0.04);
                const apronMat = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
                const apron = new THREE.Mesh(apronGeo, apronMat);
                apron.position.set(0, 1.0, 0.25);
                group.add(apron);
                break;
            case 'librarian':
                // Glasses
                const glassesGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 32, Math.PI * 2);
                const glassesMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
                const glasses = new THREE.Mesh(glassesGeo, glassesMat);
                glasses.position.set(0, 1.78, 0.3);
                glasses.rotation.x = Math.PI / 2;
                group.add(glasses);
                // Book
                const bookGeo = new THREE.BoxGeometry(0.25, 0.35, 0.1);
                const bookMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const book = new THREE.Mesh(bookGeo, bookMat);
                book.position.set(-0.35, 1.0, 0.1);
                book.rotation.y = Math.PI / 6;
                group.add(book);
                break;
            case 'blacksmith':
                // Anvil-like accessory or hammer
                const hammerHandleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
                const hammerHandleMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
                const hammerHandle = new THREE.Mesh(hammerHandleGeo, hammerHandleMat);
                hammerHandle.position.set(0.35, 0.9, 0.1);
                hammerHandle.rotation.z = Math.PI / 3;
                group.add(hammerHandle);
                const hammerHeadGeo = new THREE.BoxGeometry(0.18, 0.12, 0.12);
                const hammerHeadMat = new THREE.MeshLambertMaterial({ color: 0xA9A9A9 });
                const hammerHead = new THREE.Mesh(hammerHeadGeo, hammerHeadMat);
                hammerHead.position.set(0.4, 0.65, 0.1);
                group.add(hammerHead);
                // Leather apron
                const blacksmithApronGeo = new THREE.BoxGeometry(0.55, 0.9, 0.05);
                const blacksmithApronMat = new THREE.MeshLambertMaterial({ color: 0x4B3621 });
                const blacksmithApron = new THREE.Mesh(blacksmithApronGeo, blacksmithApronMat);
                blacksmithApron.position.set(0, 0.9, 0.26);
                group.add(blacksmithApron);
                break;
            case 'priest':
                // Robe details
                const robeGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.5, 32);
                const robeMat = new THREE.MeshLambertMaterial({ color: this.clothingColor });
                const robe = new THREE.Mesh(robeGeo, robeMat);
                robe.position.y = 0.8;
                group.add(robe);
                // Cross necklace
                const chainGeo = new THREE.TorusGeometry(0.2, 0.01, 8, 32);
                const chainMat = new THREE.MeshLambertMaterial({ color: this.accessoryColor });
                const chain = new THREE.Mesh(chainGeo, chainMat);
                chain.position.set(0, 1.4, 0.25);
                chain.rotation.x = Math.PI / 2;
                group.add(chain);
                const crossVertGeo = new THREE.BoxGeometry(0.04, 0.2, 0.04);
                const crossVert = new THREE.Mesh(crossVertGeo, chainMat);
                crossVert.position.set(0, 1.2, 0.25);
                group.add(crossVert);
                const crossHorizGeo = new THREE.BoxGeometry(0.12, 0.04, 0.04);
                const crossHoriz = new THREE.Mesh(crossHorizGeo, chainMat);
                crossHoriz.position.set(0, 1.25, 0.25);
                group.add(crossHoriz);
                break;
            case 'butcher':
                // Cleaver
                const cleaverHandleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
                const cleaverHandleMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
                const cleaverHandle = new THREE.Mesh(cleaverHandleGeo, cleaverHandleMat);
                cleaverHandle.position.set(0.35, 1.0, 0.1);
                cleaverHandle.rotation.z = Math.PI / 4;
                group.add(cleaverHandle);
                const cleaverBladeGeo = new THREE.BoxGeometry(0.25, 0.15, 0.02);
                const cleaverBladeMat = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
                const cleaverBlade = new THREE.Mesh(cleaverBladeGeo, cleaverBladeMat);
                cleaverBlade.position.set(0.4, 0.85, 0.1);
                cleaverBlade.rotation.z = Math.PI / 4;
                group.add(cleaverBlade);
                break;
            case 'fisherman':
                // Fishing rod
                const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
                const rodMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
                const rod = new THREE.Mesh(rodGeo, rodMat);
                rod.position.set(0.35, 1.2, 0);
                rod.rotation.z = Math.PI / 3;
                group.add(rod);
                // Hat
                const fishHatGeo = new THREE.ConeGeometry(0.4, 0.4, 32);
                const fishHatMat = new THREE.MeshLambertMaterial({ color: 0x556B2F });
                const fishHat = new THREE.Mesh(fishHatGeo, fishHatMat);
                fishHat.position.y = 2.1;
                group.add(fishHat);
                break;
            case 'cartographer':
                // Map scroll
                const mapGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
                const mapMat = new THREE.MeshLambertMaterial({ color: 0xFAF0E6 });
                const map = new THREE.Mesh(mapGeo, mapMat);
                map.position.set(-0.35, 1.0, 0.1);
                map.rotation.x = Math.PI / 2;
                group.add(map);
                break;
            case 'fletcher':
                // Bow
                const bowGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 32, Math.PI);
                const bowMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const bow = new THREE.Mesh(bowGeo, bowMat);
                bow.position.set(0.35, 1.2, 0);
                bow.rotation.y = Math.PI / 2;
                group.add(bow);
                const stringGeo = new THREE.BoxGeometry(0.01, 0.5, 0.01);
                const stringMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
                const bowString = new THREE.Mesh(stringGeo, stringMat);
                bowString.position.set(0.35, 1.2, 0.15);
                group.add(bowString);
                break;
        }
    }

    addHair(group) {
        let hairGeo, hair;
        const hairMat = new THREE.MeshLambertMaterial({ color: this.hairColor });
        switch (this.hairStyle) {
            case 0: // Short hair
                hairGeo = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
                hair = new THREE.Mesh(hairGeo, hairMat);
                hair.position.y = 1.85;
                group.add(hair);
                break;
            case 1: // Long hair
                hairGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 32);
                hair = new THREE.Mesh(hairGeo, hairMat);
                hair.position.y = 1.6;
                group.add(hair);
                break;
            case 2: // Balding or ponytail
                hairGeo = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, Math.PI / 4, Math.PI / 2);
                hair = new THREE.Mesh(hairGeo, hairMat);
                hair.position.y = 1.85;
                group.add(hair);
                const ponytailGeo = new THREE.CylinderGeometry(0.1, 0.05, 0.5, 16);
                const ponytail = new THREE.Mesh(ponytailGeo, hairMat);
                ponytail.position.set(0, 1.5, -0.3);
                ponytail.rotation.x = Math.PI / 6;
                group.add(ponytail);
                break;
        }
        // Add hat randomly or based on profession
        if (Math.random() < 0.3 || this.profession === 'farmer') {
            const hatGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
            const hatBrimGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
            const hatMat = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
            const hatTop = new THREE.Mesh(hatGeo, hatMat);
            hatTop.position.y = 2.0;
            group.add(hatTop);
            const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
            hatBrim.position.y = 1.9;
            group.add(hatBrim);
        }
    }

    update() {
        this.moveTimer++;
        this.animationTime += 0.05; // Slower animation for realism
        this.idleAnimationTime += 0.02; // For idle animations

        // More intelligent movement: avoid obstacles, prefer paths, etc.
        // For now, add some pathfinding logic if possible, but assume simple for this context
        if (this.moveTimer > 120 + Math.random() * 120 && Math.random() < 0.03) { // Varied timing
            // Choose target intelligently: maybe towards other villagers or structures, but simple random for now
            this.targetX = this.homeX + (Math.random() - 0.5) * this.wanderRadius;
            this.targetZ = this.homeZ + (Math.random() - 0.5) * this.wanderRadius;
            // Check if target is valid (e.g., not in water or blocked), assume getBlock returns type
            const targetBlock = getBlock(Math.floor(this.targetX), Math.floor(this.y), Math.floor(this.targetZ));
            if (targetBlock && targetBlock.type !== 'water') { // Example check
                this.moveTimer = 0;
            }
        }

        const dx = this.targetX - this.x;
        const dz = this.targetZ - this.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.3) {
            const moveStep = this.speed * (1 - 0.2 * Math.random()); // Slight speed jitter for realism
            this.x += (dx / dist) * moveStep;
            this.z += (dz / dist) * moveStep;

            // Gravity and jumping over small obstacles
            const blockBelow = getBlock(Math.floor(this.x), Math.floor(this.y - 0.1), Math.floor(this.z));
            if (!blockBelow) {
                this.y -= 0.02; // Gravity
            } else if (getBlock(Math.floor(this.x + dx / dist), Math.floor(this.y), Math.floor(this.z + dz / dist))) {
                this.y += 0.1; // Jump small blocks
            }

            this.animateWalking();

            if (this.mesh) {
                this.mesh.rotation.y = Math.atan2(-dx, -dz) + (Math.sin(this.animationTime) * 0.05); // Slight head sway
            }
        } else {
            this.animateIdle(); // Idle animation when not moving
        }

        if (this.mesh) {
            this.mesh.position.set(this.x, this.y, this.z);
            this.boundingBox.setFromObject(this.mesh);
        }
    }

    animateWalking() {
        if (!this.mesh) return;
        this.mesh.traverse(child => {
            if (child.userData.isLeg) {
                const legMove = Math.sin(this.animationTime * 5) * 0.5;
                const kneeBend = Math.abs(Math.cos(this.animationTime * 5)) * 0.2;
                if (child.userData.side === 'left') {
                    if (child.userData.part === 'upper') child.rotation.x = legMove;
                    if (child.userData.part === 'lower') child.rotation.x = kneeBend;
                } else {
                    if (child.userData.part === 'upper') child.rotation.x = -legMove;
                    if (child.userData.part === 'lower') child.rotation.x = -kneeBend;
                }
            }
            if (child.userData.isArm) {
                const armMove = Math.sin(this.animationTime * 5) * 0.4;
                const elbowBend = Math.abs(Math.sin(this.animationTime * 5)) * 0.15;
                if (child.userData.side === 'left') {
                    if (child.userData.part === 'upper') child.rotation.x = -armMove;
                    if (child.userData.part === 'lower') child.rotation.x = -elbowBend;
                } else {
                    if (child.userData.part === 'upper') child.rotation.x = armMove;
                    if (child.userData.part === 'lower') child.rotation.x = elbowBend;
                }
            }
        });
    }

    animateIdle() {
        if (!this.mesh) return;
        // Simple breathing or looking around
        this.mesh.scale.y = this.heightScale * (1 + Math.sin(this.idleAnimationTime) * 0.005);
        this.mesh.rotation.y += Math.sin(this.idleAnimationTime * 0.5) * 0.01; // Slight turn
    }

    remove() {
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            scene.remove(this.mesh);
            const index = villagerMeshes.indexOf(this.mesh);
            if (index > -1) villagerMeshes.splice(index, 1);
        }
    }
}

function buildHouse(x, y, z) {
    // Base (5x5)
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            setBlock(x + dx, y - 1, z + dz, 'planks');
        }
    }

    // Paredes
    for (let dy = 0; dy < 4; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
                    if (dy === 1 && dx === 0 && dz === 2) {
                        // Porta
                        removeBlockData(x + dx, y + dy, z + dz);
                    } else {
                        setBlock(x + dx, y + dy, z + dz, 'planks');
                    }
                }
            }
        }
    }

    // Telhado
    for (let dy = 0; dy < 3; dy++) {
        const size = 2 - dy;
        for (let dx = -size; dx <= size; dx++) {
            for (let dz = -size; dz <= size; dz++) {
                setBlock(x + dx, y + 4 + dy, z + dz, 'brick');
            }
        }
    }

    // Janelas
    setBlock(x - 2, y + 2, z, 'glass');
    setBlock(x + 2, y + 2, z, 'glass');
}

function buildImprovedChurch(x, y, z) {
    // Base maior e mais elaborada (9x14)
    for (let dx = -4; dx <= 4; dx++) {
        for (let dz = -7; dz <= 7; dz++) {
            setBlock(x + dx, y - 1, z + dz, 'cobblestone');
        }
    }

    // Escadaria na entrada
    for (let dx = -2; dx <= 2; dx++) {
        setBlock(x + dx, y, z + 8, 'cobblestone');
        setBlock(x + dx, y + 1, z + 9, 'cobblestone');
    }

    // Paredes principais
    for (let dy = 0; dy < 8; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
            for (let dz = -7; dz <= 7; dz++) {
                if (Math.abs(dx) === 4 || Math.abs(dz) === 7) {
                    // Porta principal (dupla e alta)
                    if (dy <= 3 && dx >= -1 && dx <= 1 && dz === 7) {
                        continue;
                    }
                    setBlock(x + dx, y + dy, z + dz, 'quartz');
                }
            }
        }
    }

    // Pilares decorativos nas laterais
    const pillarPositions = [
        { dx: -4, dz: -5 }, { dx: -4, dz: 0 }, { dx: -4, dz: 5 },
        { dx: 4, dz: -5 }, { dx: 4, dz: 0 }, { dx: 4, dz: 5 }
    ];

    pillarPositions.forEach(pos => {
        for (let dy = 0; dy < 8; dy++) {
            setBlock(x + pos.dx, y + dy, z + pos.dz, 'quartz');

            // Detalhe do pilar
            if (dy % 2 === 0) {
                if (pos.dx === -4) {
                    setBlock(x + pos.dx - 1, y + dy, z + pos.dz, 'cobblestone');
                } else {
                    setBlock(x + pos.dx + 1, y + dy, z + pos.dz, 'cobblestone');
                }
            }
        }
        // Topo do pilar
        setBlock(x + pos.dx, y + 8, z + pos.dz, 'cobblestone');
    });

    // Janelas laterais em arco (vitrais)
    const windowPositions = [
        { dx: -4, dz: -3 }, { dx: -4, dz: 3 },
        { dx: 4, dz: -3 }, { dx: 4, dz: 3 }
    ];

    windowPositions.forEach(pos => {
        // Janela em arco (3 blocos de altura)
        setBlock(x + pos.dx, y + 3, z + pos.dz, 'glass');
        setBlock(x + pos.dx, y + 4, z + pos.dz, 'glass');
        setBlock(x + pos.dx, y + 5, z + pos.dz, 'glass');

        // Moldura da janela
        setBlock(x + pos.dx, y + 2, z + pos.dz, 'cobblestone');
        setBlock(x + pos.dx, y + 6, z + pos.dz, 'cobblestone');
    });

    // Janela grande frontal (rosácea)
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = 5; dy <= 7; dy++) {
            if (Math.abs(dx) <= 2 && dy >= 5) {
                setBlock(x + dx, y + dy, z + 7, 'glass');
            }
        }
    }
    // Moldura da rosácea
    for (let dx = -3; dx <= 3; dx++) {
        setBlock(x + dx, y + 4, z + 7, 'cobblestone');
        setBlock(x + dx, y + 8, z + 7, 'cobblestone');
    }

    // Torre do sino (central, mais alta e detalhada)
    for (let dy = 0; dy < 15; dy++) {
        // Base da torre (3x3)
        if (dy < 8) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    if (Math.abs(dx) === 1 || Math.abs(dz) === 1) {
                        setBlock(x + dx, y + 8 + dy, z + dz, 'quartz');
                    }
                }
            }
        } else {
            // Torre estreita no topo
            setBlock(x, y + 8 + dy, z, 'quartz');
            setBlock(x + 1, y + 8 + dy, z, 'quartz');
            setBlock(x - 1, y + 8 + dy, z, 'quartz');
            setBlock(x, y + 8 + dy, z + 1, 'quartz');
            setBlock(x, y + 8 + dy, z - 1, 'quartz');
        }
    }

    // Sino (visível)
    setBlock(x, y + 18, z, 'gold_ore'); // Sino dourado

    // Aberturas da torre do sino
    setBlock(x + 1, y + 17, z, 'glass');
    setBlock(x - 1, y + 17, z, 'glass');
    setBlock(x, y + 17, z + 1, 'glass');
    setBlock(x, y + 17, z - 1, 'glass');

    // Cruz no topo da torre
    for (let dy = 0; dy < 3; dy++) {
        setBlock(x, y + 23 + dy, z, 'gold_ore');
    }
    setBlock(x - 1, y + 24, z, 'gold_ore');
    setBlock(x + 1, y + 24, z, 'gold_ore');

    // Topo da cruz brilhante
    setBlock(x, y + 26, z, 'glowstone');

    // Telhado principal (em V invertido)
    for (let dy = 0; dy < 5; dy++) {
        const width = 4 - dy;
        for (let dx = -width; dx <= width; dx++) {
            for (let dz = -7; dz <= 7; dz++) {
                setBlock(x + dx, y + 8 + dy, z + dz, 'brick');
            }
        }
    }

    // Detalhes do telhado (beirais)
    for (let dz = -7; dz <= 7; dz++) {
        setBlock(x - 5, y + 8, z + dz, 'cobblestone');
        setBlock(x + 5, y + 8, z + dz, 'cobblestone');
    }

    // Interior - Nave central
    for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -6; dz <= 6; dz++) {
            // Piso de pedra decorativo
            if ((dx + dz) % 2 === 0) {
                setBlock(x + dx, y, z + dz, 'quartz');
            } else {
                setBlock(x + dx, y, z + dz, 'cobblestone');
            }
        }
    }

    // Altar
    for (let dx = -2; dx <= 2; dx++) {
        setBlock(x + dx, y + 1, z - 6, 'quartz');
    }
    for (let dx = -1; dx <= 1; dx++) {
        setBlock(x + dx, y + 2, z - 6, 'quartz');
    }
    setBlock(x, y + 3, z - 6, 'gold_ore'); // Cruz dourada no altar

    // Bancos (fileiras)
    for (let row = -4; row <= 2; row += 2) {
        // Banco esquerdo
        for (let dz = 0; dz < 3; dz++) {
            setBlock(x - 2, y + 1, z + row + dz, 'planks');
        }
        // Banco direito
        for (let dz = 0; dz < 3; dz++) {
            setBlock(x + 2, y + 1, z + row + dz, 'planks');
        }
    }

    // Candelabros (lanternas suspensas)
    const chandPos = [
        { dz: -4 }, { dz: 0 }, { dz: 4 }
    ];

    chandPos.forEach(pos => {
        // Corrente
        for (let dy = 1; dy <= 4; dy++) {
            setBlock(x, y + dy + 3, z + pos.dz, 'planks');
        }
        // Lanterna
        setBlock(x, y + 3, z + pos.dz, 'lantern');
        setBlock(x + 1, y + 3, z + pos.dz, 'lantern');
        setBlock(x - 1, y + 3, z + pos.dz, 'lantern');
    });

    // Tochas nas paredes
    setBlock(x - 3, y + 3, z - 5, 'torch');
    setBlock(x + 3, y + 3, z - 5, 'torch');
    setBlock(x - 3, y + 3, z, 'torch');
    setBlock(x + 3, y + 3, z, 'torch');
    setBlock(x - 3, y + 3, z + 5, 'torch');
    setBlock(x + 3, y + 3, z + 5, 'torch');

    // Órgão de tubos (decorativo na parede dos fundos)
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = 2; dy <= 6; dy++) {
            if (Math.abs(dx) === 2 || dy >= 5) {
                setBlock(x + dx, y + dy, z - 7, 'planks');
            }
        }
    }

    // Jardim lateral direito
    for (let dx = 5; dx <= 7; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
            setBlock(x + dx, y, z + dz, 'grass');
            if (Math.random() > 0.7) {
                setBlock(x + dx, y + 1, z + dz, 'leaves');
            }
        }
    }

    // Jardim lateral esquerdo
    for (let dx = -7; dx <= -5; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
            setBlock(x + dx, y, z + dz, 'grass');
            if (Math.random() > 0.7) {
                setBlock(x + dx, y + 1, z + dz, 'leaves');
            }
        }
    }

    // Árvores decorativas ao lado
    const treePosLeft = { dx: -6, dz: 0 };
    for (let dy = 1; dy <= 4; dy++) {
        setBlock(x + treePosLeft.dx, y + dy, z + treePosLeft.dz, 'wood');
    }
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            setBlock(x + treePosLeft.dx + dx, y + 5, z + treePosLeft.dz + dz, 'leaves');
        }
    }

    const treePosRight = { dx: 6, dz: 0 };
    for (let dy = 1; dy <= 4; dy++) {
        setBlock(x + treePosRight.dx, y + dy, z + treePosRight.dz, 'wood');
    }
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            setBlock(x + treePosRight.dx + dx, y + 5, z + treePosRight.dz + dz, 'leaves');
        }
    }

    // Cerca decorativa ao redor do jardim
    for (let dx = -8; dx <= 8; dx++) {
        if (Math.abs(dx) >= 5) {
            setBlock(x + dx, y, z - 4, 'planks');
            setBlock(x + dx, y, z + 4, 'planks');
        }
    }

    // Lanternas de iluminação externa
    setBlock(x - 5, y, z + 8, 'planks');
    setBlock(x - 5, y + 1, z + 8, 'planks');
    setBlock(x - 5, y + 2, z + 8, 'lantern');

    setBlock(x + 5, y, z + 8, 'planks');
    setBlock(x + 5, y + 1, z + 8, 'planks');
    setBlock(x + 5, y + 2, z + 8, 'lantern');

    // Lanternas na torre
    setBlock(x - 2, y + 15, z - 2, 'lantern');
    setBlock(x + 2, y + 15, z - 2, 'lantern');
    setBlock(x - 2, y + 15, z + 2, 'lantern');
    setBlock(x + 2, y + 15, z + 2, 'lantern');
}

function buildLargeHouse(x, y, z) {
    // Base maior (7x7)
    for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
            setBlock(x + dx, y - 1, z + dz, 'planks');
        }
    }

    // Paredes
    for (let dy = 0; dy < 5; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
            for (let dz = -3; dz <= 3; dz++) {
                if (Math.abs(dx) === 3 || Math.abs(dz) === 3) {
                    if (dy === 1 && dx === 0 && dz === 3) {
                        continue; // Porta
                    }
                    setBlock(x + dx, y + dy, z + dz, 'planks');
                }
            }
        }
    }

    // Segundo andar
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            setBlock(x + dx, y + 5, z + dz, 'planks');
        }
    }

    // Janelas do segundo andar
    setBlock(x - 2, y + 6, z, 'glass');
    setBlock(x + 2, y + 6, z, 'glass');
    setBlock(x, y + 6, z - 2, 'glass');

    // Telhado em camadas
    for (let dy = 0; dy < 4; dy++) {
        const size = 3 - dy;
        for (let dx = -size; dx <= size; dx++) {
            for (let dz = -size; dz <= size; dz++) {
                setBlock(x + dx, y + 5 + dy, z + dz, 'brick');
            }
        }
    }

    // Chaminé
    for (let dy = 0; dy < 6; dy++) {
        setBlock(x + 2, y + 5 + dy, z + 2, 'brick');
    }
    setBlock(x + 2, y + 11, z + 2, 'cobblestone');

    // Janelas térreo
    setBlock(x - 3, y + 2, z - 1, 'glass');
    setBlock(x - 3, y + 2, z + 1, 'glass');
    setBlock(x + 3, y + 2, z - 1, 'glass');
    setBlock(x + 3, y + 2, z + 1, 'glass');

    // Jardim da frente
    for (let dx = -2; dx <= 2; dx++) {
        setBlock(x + dx, y, z + 4, 'grass');
        if (Math.random() > 0.7) {
            setBlock(x + dx, y + 1, z + 4, 'leaves');
        }
    }

    // Lanternas na entrada
    setBlock(x - 1, y, z + 3, 'planks');
    setBlock(x - 1, y + 1, z + 3, 'planks');
    setBlock(x - 1, y + 2, z + 3, 'lantern');

    setBlock(x + 1, y, z + 3, 'planks');
    setBlock(x + 1, y + 1, z + 3, 'planks');
    setBlock(x + 1, y + 2, z + 3, 'lantern');
}

function buildDecoratedHouse(x, y, z) {
    buildHouse(x, y, z); // Casa base original

    // Adicionar decoração externa
    // Varanda
    for (let dx = -1; dx <= 1; dx++) {
        setBlock(x + dx, y, z + 3, 'planks');
    }

    // Colunas da varanda
    setBlock(x - 1, y + 1, z + 3, 'planks');
    setBlock(x + 1, y + 1, z + 3, 'planks');

    // Telhado da varanda
    setBlock(x - 1, y + 2, z + 3, 'brick');
    setBlock(x, y + 2, z + 3, 'brick');
    setBlock(x + 1, y + 2, z + 3, 'brick');

    // Jardim lateral
    setBlock(x + 3, y, z - 1, 'dirt');
    setBlock(x + 3, y, z, 'dirt');
    setBlock(x + 3, y, z + 1, 'dirt');

    setBlock(x + 3, y + 1, z - 1, 'leaves');
    setBlock(x + 3, y + 1, z + 1, 'leaves');

    // Cerca decorativa
    setBlock(x + 4, y, z - 2, 'planks');
    setBlock(x + 4, y, z, 'planks');
    setBlock(x + 4, y, z + 2, 'planks');
}

function buildMarketplace(x, y, z) {
    // Plataforma elevada (10x10)
    for (let dx = -5; dx <= 5; dx++) {
        for (let dz = -5; dz <= 5; dz++) {
            setBlock(x + dx, y, z + dz, 'planks');
        }
    }

    // Barracas (4 barracas ao redor)
    const stallPositions = [
        { dx: -3, dz: -3 }, { dx: 3, dz: -3 },
        { dx: -3, dz: 3 }, { dx: 3, dz: 3 }
    ];

    stallPositions.forEach(pos => {
        // Base da barraca
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                if (Math.abs(dx) === 1 || Math.abs(dz) === 1) {
                    setBlock(x + pos.dx + dx, y + 1, z + pos.dz + dz, 'planks');
                }
            }
        }

        // Pilares
        setBlock(x + pos.dx - 1, y + 2, z + pos.dz - 1, 'planks');
        setBlock(x + pos.dx + 1, y + 2, z + pos.dz - 1, 'planks');
        setBlock(x + pos.dx - 1, y + 2, z + pos.dz + 1, 'planks');
        setBlock(x + pos.dx + 1, y + 2, z + pos.dz + 1, 'planks');

        // Telhado
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                if (Math.abs(dx) <= 2 && Math.abs(dz) <= 2) {
                    setBlock(x + pos.dx + dx, y + 3, z + pos.dz + dz, 'planks');
                }
            }
        }

        // Itens na barraca (baús)
        setBlock(x + pos.dx, y + 1, z + pos.dz, 'chest');
    });

    // Lanterna central
    setBlock(x, y + 1, z, 'planks');
    setBlock(x, y + 2, z, 'planks');
    setBlock(x, y + 3, z, 'planks');
    setBlock(x, y + 4, z, 'lantern');
}

function buildInn(x, y, z) {
    // Base grande (8x10)
    for (let dx = -4; dx <= 4; dx++) {
        for (let dz = -5; dz <= 5; dz++) {
            setBlock(x + dx, y - 1, z + dz, 'planks');
        }
    }

    // Paredes
    for (let dy = 0; dy < 6; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
            for (let dz = -5; dz <= 5; dz++) {
                if (Math.abs(dx) === 4 || Math.abs(dz) === 5) {
                    if (dy === 1 && dx === 0 && dz === 5) {
                        continue; // Porta principal
                    }
                    if (dy === 1 && dx === -4 && dz === 0) {
                        continue; // Porta lateral
                    }
                    setBlock(x + dx, y + dy, z + dz, 'planks');
                }
            }
        }
    }

    // Segundo andar
    for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -4; dz <= 4; dz++) {
            setBlock(x + dx, y + 6, z + dz, 'planks');
        }
    }

    // Janelas - primeiro andar
    for (let dz = -3; dz <= 3; dz += 3) {
        setBlock(x - 4, y + 2, z + dz, 'glass');
        setBlock(x + 4, y + 2, z + dz, 'glass');
    }

    // Janelas - segundo andar
    for (let dx = -2; dx <= 2; dx += 2) {
        setBlock(x + dx, y + 7, z - 4, 'glass');
        setBlock(x + dx, y + 7, z + 4, 'glass');
    }

    // Telhado
    for (let dy = 0; dy < 4; dy++) {
        const size = 4 - dy;
        for (let dx = -size; dx <= size; dx++) {
            for (let dz = -5; dz <= 5; dz++) {
                setBlock(x + dx, y + 6 + dy, z + dz, 'brick');
            }
        }
    }

    // Placa de madeira (simulando placa da pousada)
    setBlock(x - 2, y + 3, z + 5, 'planks');
    setBlock(x - 1, y + 3, z + 5, 'planks');
    setBlock(x, y + 3, z + 5, 'planks');
    setBlock(x + 1, y + 3, z + 5, 'planks');
    setBlock(x + 2, y + 3, z + 5, 'planks');

    // Lanternas na entrada
    setBlock(x - 2, y, z + 6, 'planks');
    setBlock(x - 2, y + 1, z + 6, 'planks');
    setBlock(x - 2, y + 2, z + 6, 'lantern');

    setBlock(x + 2, y, z + 6, 'planks');
    setBlock(x + 2, y + 1, z + 6, 'planks');
    setBlock(x + 2, y + 2, z + 6, 'lantern');

    // Mesa e cadeiras dentro (mobília básica)
    setBlock(x - 2, y + 1, z - 2, 'planks'); // Mesa
    setBlock(x - 2, y + 1, z + 2, 'planks');
    setBlock(x + 2, y + 1, z - 2, 'planks');
    setBlock(x + 2, y + 1, z + 2, 'planks');
}

function buildStable(x, y, z) {
    // Base (12x8)
    for (let dx = -6; dx <= 6; dx++) {
        for (let dz = -4; dz <= 4; dz++) {
            setBlock(x + dx, y - 1, z + dz, 'dirt');
        }
    }

    // Paredes laterais (abertas na frente e atrás)
    for (let dy = 0; dy < 4; dy++) {
        for (let dz = -4; dz <= 4; dz++) {
            setBlock(x - 6, y + dy, z + dz, 'planks');
            setBlock(x + 6, y + dy, z + dz, 'planks');
        }
    }

    // Paredes de trás e frente parciais
    for (let dx = -5; dx <= 5; dx++) {
        setBlock(x + dx, y, z - 4, 'planks');
        setBlock(x + dx, y + 1, z - 4, 'planks');

        if (Math.abs(dx) > 2) {
            setBlock(x + dx, y, z + 4, 'planks');
            setBlock(x + dx, y + 1, z + 4, 'planks');
        }
    }

    // Pilares
    for (let dy = 0; dy < 4; dy++) {
        setBlock(x - 5, y + dy, z - 3, 'planks');
        setBlock(x - 5, y + dy, z + 3, 'planks');
        setBlock(x + 5, y + dy, z - 3, 'planks');
        setBlock(x + 5, y + dy, z + 3, 'planks');
    }

    // Telhado
    for (let dy = 0; dy < 3; dy++) {
        const width = 6 - dy;
        for (let dx = -width; dx <= width; dx++) {
            for (let dz = -4; dz <= 4; dz++) {
                setBlock(x + dx, y + 4 + dy, z + dz, 'planks');
            }
        }
    }

    // Baias (compartimentos)
    for (let i = -4; i <= 4; i += 4) {
        for (let dx = -1; dx <= 1; dx++) {
            setBlock(x + dx, y, z + i, 'planks');
        }
        // Comedouros
        setBlock(x - 5, y + 1, z + i, 'planks');
        setBlock(x + 5, y + 1, z + i, 'planks');
    }

    // Porta dupla
    removeBlockData(x - 1, y, z + 4);
    removeBlockData(x - 1, y + 1, z + 4);
    removeBlockData(x + 1, y, z + 4);
    removeBlockData(x + 1, y + 1, z + 4);

    // Lanternas
    setBlock(x - 5, y + 3, z, 'lantern');
    setBlock(x + 5, y + 3, z, 'lantern');
}

function addVillageDecoration(centerX, villageY, centerZ) {
    // Árvores decorativas ao redor
    const treePositions = [
        { x: 20, z: 20 }, { x: -20, z: 20 },
        { x: 20, z: -20 }, { x: -20, z: -20 },
        { x: 25, z: 0 }, { x: -25, z: 0 },
        { x: 0, z: 25 }, { x: 0, z: -25 }
    ];

    treePositions.forEach(pos => {
        const tx = centerX + pos.x;
        const tz = centerZ + pos.z;

        // Tronco
        for (let dy = 0; dy < 5; dy++) {
            setBlock(tx, villageY + 1 + dy, tz, 'wood');
        }

        // Copa
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy <= 2; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) <= 3) {
                        setBlock(tx + dx, villageY + 5 + dy, tz + dz, 'leaves');
                    }
                }
            }
        }
    });

    // Bancos ao redor da fonte
    for (let angle = 0; angle < 360; angle += 90) {
        const rad = angle * Math.PI / 180;
        const bx = Math.floor(centerX + Math.cos(rad) * 6);
        const bz = Math.floor(centerZ + Math.sin(rad) * 6);

        setBlock(bx, villageY, bz, 'planks');
        setBlock(bx - 1, villageY, bz, 'planks');
        setBlock(bx + 1, villageY, bz, 'planks');
    }
}

function updateVillagers() {
    villagers.forEach(villager => {
        if (villager.update) {
            villager.update();
        }
    });
}

function buildVillageFence(x, y, z, radius) {
    for (let angle = 0; angle < 360; angle += 10) {
        const rad = angle * Math.PI / 180;
        const fx = Math.floor(x + Math.cos(rad) * radius);
        const fz = Math.floor(z + Math.sin(rad) * radius);

        setBlock(fx, y, fz, 'planks');
        setBlock(fx, y + 1, fz, 'planks');

        // Postes a cada 45 graus
        if (angle % 45 === 0) {
            setBlock(fx, y + 2, fz, 'planks');
            setBlock(fx, y + 3, fz, 'torch');
        }
    }
}

function createDetailedPaths(centerX, villageY, centerZ) {
    // Caminhos principais em cruz
    for (let i = -30; i <= 30; i++) {
        // Horizontal
        setBlock(centerX + i, villageY, centerZ, 'cobblestone');
        setBlock(centerX + i, villageY, centerZ + 1, 'cobblestone');
        setBlock(centerX + i, villageY, centerZ - 1, 'cobblestone');

        // Bordas decorativas
        if (Math.abs(i) % 3 === 0) {
            setBlock(centerX + i, villageY, centerZ + 2, 'stone');
            setBlock(centerX + i, villageY, centerZ - 2, 'stone');
        }

        // Vertical
        setBlock(centerX, villageY, centerZ + i, 'cobblestone');
        setBlock(centerX + 1, villageY, centerZ + i, 'cobblestone');
        setBlock(centerX - 1, villageY, centerZ + i, 'cobblestone');

        if (Math.abs(i) % 3 === 0) {
            setBlock(centerX + 2, villageY, centerZ + i, 'stone');
            setBlock(centerX - 2, villageY, centerZ + i, 'stone');
        }
    }

    // Lanternas ao longo dos caminhos
    for (let i = -28; i <= 28; i += 7) {
        setBlock(centerX + i, villageY + 1, centerZ + 4, 'planks');
        setBlock(centerX + i, villageY + 2, centerZ + 4, 'lantern');

        setBlock(centerX + i, villageY + 1, centerZ - 4, 'planks');
        setBlock(centerX + i, villageY + 2, centerZ - 4, 'lantern');

        setBlock(centerX + 4, villageY + 1, centerZ + i, 'planks');
        setBlock(centerX + 4, villageY + 2, centerZ + i, 'lantern');

        setBlock(centerX - 4, villageY + 1, centerZ + i, 'planks');
        setBlock(centerX - 4, villageY + 2, centerZ + i, 'lantern');
    }
}

function buildCentralFountain(x, y, z) {
    // Base da fonte (mais elaborada)
    for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= 3) {
                setBlock(x + dx, y - 1, z + dz, 'cobblestone');
            }
        }
    }

    // Borda externa
    for (let angle = 0; angle < 360; angle += 45) {
        const rad = angle * Math.PI / 180;
        const fx = Math.floor(x + Math.cos(rad) * 3);
        const fz = Math.floor(z + Math.sin(rad) * 3);
        setBlock(fx, y, fz, 'stone');
        setBlock(fx, y + 1, fz, 'stone');
    }

    // Borda interna com água
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= 2 && (Math.abs(dx) === 2 || Math.abs(dz) === 2)) {
                setBlock(x + dx, y, z + dz, 'quartz');
                setBlock(x + dx, y + 1, z + dz, 'quartz');
            } else if (dist < 2) {
                setBlock(x + dx, y, z + dz, 'glass'); // Água
            }
        }
    }

    // Coluna central
    for (let dy = 0; dy < 4; dy++) {
        setBlock(x, y + dy, z, 'quartz');
    }

    // Topo decorativo
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            if (dx !== 0 || dz !== 0) {
                setBlock(x + dx, y + 4, z + dz, 'glowstone');
            }
        }
    }
    setBlock(x, y + 5, z, 'glowstone');

    // Jatos de água decorativos
    for (let angle = 0; angle < 360; angle += 90) {
        const rad = angle * Math.PI / 180;
        const wx = Math.floor(x + Math.cos(rad) * 1.5);
        const wz = Math.floor(z + Math.sin(rad) * 1.5);
        setBlock(wx, y + 2, wz, 'glass');
        setBlock(wx, y + 3, wz, 'glass');
    }
}

function buildGardens(centerX, villageY, centerZ) {
    const gardenPositions = [
        { x: 7, z: 7 }, { x: -7, z: 7 },
        { x: 7, z: -7 }, { x: -7, z: -7 }
    ];

    gardenPositions.forEach(pos => {
        const gx = centerX + pos.x;
        const gz = centerZ + pos.z;

        // Canteiro
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                setBlock(gx + dx, villageY, gz + dz, 'dirt');

                // Flores e plantas
                if (Math.random() > 0.6) {
                    const plants = ['leaves', 'mushroom_red', 'mushroom_brown'];
                    setBlock(gx + dx, villageY + 1, gz + dz, plants[Math.floor(Math.random() * plants.length)]);
                }
            }
        }

        // Cerca ao redor
        for (let dx = -3; dx <= 3; dx++) {
            setBlock(gx + dx, villageY, gz - 3, 'planks');
            setBlock(gx + dx, villageY, gz + 3, 'planks');
        }
        for (let dz = -2; dz <= 2; dz++) {
            setBlock(gx - 3, villageY, gz + dz, 'planks');
            setBlock(gx + 3, villageY, gz + dz, 'planks');
        }

        // Árvore decorativa
        setBlock(gx, villageY, gz, 'dirt');
        for (let dy = 1; dy <= 3; dy++) {
            setBlock(gx, villageY + dy, gz, 'wood');
        }
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                setBlock(gx + dx, villageY + 4, gz + dz, 'leaves');
            }
        }
    });
}

function generateVillage(centerX, centerZ) {
    const villageY = getHeight(centerX, centerZ) + 1;

    // Limpar e nivelar área maior
    for (let x = -35; x <= 35; x++) {
        for (let z = -35; z <= 35; z++) {
            const wx = centerX + x;
            const wz = centerZ + z;
            const wy = getHeight(wx, wz);

            for (let y = wy; y < villageY; y++) {
                setBlock(wx, y, wz, 'dirt');
            }
            setBlock(wx, villageY, wz, 'grass');

            for (let y = villageY + 1; y < villageY + 20; y++) {
                removeBlockData(wx, y, wz);
            }
        }
    }

    // Cerca ao redor da vila
    buildVillageFence(centerX, villageY, centerZ, 32);

    // Caminhos principais
    createDetailedPaths(centerX, villageY, centerZ);

    // Praça central com fonte
    buildCentralFountain(centerX, villageY + 1, centerZ);

    // Jardins ao redor da fonte
    buildGardens(centerX, villageY, centerZ);

    // Construções residenciais e comerciais
    const buildings = [
        // Casas grandes
        { x: 0, z: 18, type: 'large_house', profession: 'farmer' },
        { x: 18, z: 0, type: 'large_house', profession: 'librarian' },
        { x: -18, z: 0, type: 'large_house', profession: 'blacksmith' },
        { x: 0, z: -18, type: 'large_house', profession: 'priest' },

        // Casas médias
        { x: 12, z: 12, type: 'house', profession: 'butcher' },
        { x: -12, z: -12, type: 'house', profession: 'fisherman' },
        { x: -12, z: 12, type: 'house', profession: 'shepherd' },
        { x: 12, z: -12, type: 'house', profession: 'fletcher' },

        // Construções especiais
        { x: -15, z: 15, type: 'church' },
        { x: 22, z: -12, type: 'farm' },
        { x: -22, z: -12, type: 'tower' },
        { x: 15, z: -20, type: 'library' },
        { x: -25, z: 5, type: 'market' },
        { x: 25, z: 5, type: 'inn' },
        { x: 5, z: 25, type: 'stable' }
    ];

    buildings.forEach(building => {
        const bx = centerX + building.x;
        const bz = centerZ + building.z;

        switch(building.type) {
            case 'large_house':
                buildLargeHouse(bx, villageY + 1, bz);
                if (building.profession) {
                    const villager = new Village(bx, villageY + 2, bz, building.profession);
                    villagers.push(villager);
                }
                break;
            case 'house':
                buildDecoratedHouse(bx, villageY + 1, bz);
                if (building.profession) {
                    const villager = new Village(bx, villageY + 2, bz, building.profession);
                    villagers.push(villager);
                }
                break;
            case 'church':
                buildImprovedChurch(bx, villageY + 1, bz);
                break;
            case 'farm':
                buildDetailedFarm(bx, villageY + 1, bz);
                break;
            case 'tower':
                buildWatchTower(bx, villageY + 1, bz);
                break;
            case 'library':
                buildGrandLibrary(bx, villageY + 1, bz);
                break;
            case 'market':
                buildMarketplace(bx, villageY + 1, bz);
                break;
            case 'inn':
                buildInn(bx, villageY + 1, bz);
                break;
            case 'stable':
                buildStable(bx, villageY + 1, bz);
                break;
        }
    });

    // Adicionar vegetação decorativa
    addVillageDecoration(centerX, villageY, centerZ);

    villages.push({ x: centerX, z: centerZ });
}


