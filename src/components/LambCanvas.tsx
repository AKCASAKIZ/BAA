import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LambCanvasProps {
  isTalking: boolean;
  isThinking: boolean;
  countryId: string;
  propType: 'fez' | 'hapi' | 'kalpak' | 'clover' | 'chef' | 'none';
}

export const LambCanvas: React.FC<LambCanvasProps> = ({
  isTalking,
  isThinking,
  countryId,
  propType,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isTalkingRef = useRef(isTalking);
  const isThinkingRef = useRef(isThinking);
  const propTypeRef = useRef(propType);

  // Sync refs to avoid re-initializing the whole Three.js scene on simple prop updates
  useEffect(() => {
    isTalkingRef.current = isTalking;
  }, [isTalking]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    propTypeRef.current = propType;
  }, [propType]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // Transparent or deep soft color
    scene.background = null;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 6.2);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const keyLight = new THREE.DirectionalLight(0xffefd5, 0.6); // Warm bar orange/yellow light
    keyLight.position.set(-6, 3, 2);
    scene.add(keyLight);

    // 5. Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6ccb2, // Soft peach-cream skin tone
      roughness: 0.6,
      metalness: 0.05,
    });
    
    const darkSkinMaterial = new THREE.MeshStandardMaterial({
      color: 0x7f5539, // Deep dark color for legs/hooves if needed
      roughness: 0.8,
    });

    const woolMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f3f0, // Pure woolly milk white
      roughness: 0.95, // Very matte fluffy wool
      metalness: 0.0,
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeHighlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mouthPinkMaterial = new THREE.MeshStandardMaterial({ color: 0xe5989b, roughness: 0.5 });
    
    // Custom accessory materials
    const fezMaterial = new THREE.MeshStandardMaterial({ color: 0x9e0018, roughness: 0.7 }); // Deep turkish red
    const blackTasselMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const cloverHatMaterial = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.6 }); // Irish emerald green
    const goldBandMaterial = new THREE.MeshStandardMaterial({ color: 0xee9b00, metalness: 0.8, roughness: 0.2 });
    const kalpakMaterial = new THREE.MeshStandardMaterial({ color: 0xfffcf2, roughness: 0.8 }); // Off-white felt
    const kalpakBorderMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }); // Black velvet band

    // 6. Modeling the Lamb
    const lambGroup = new THREE.Group();
    scene.add(lambGroup);

    // Body (ellipse mesh, then decorated with wool spheroids)
    const bodyGeometry = new THREE.SphereGeometry(1.0, 32, 32);
    bodyGeometry.scale(1.25, 1.0, 1.0); // Make it slightly egg-shaped
    const bodyMesh = new THREE.Mesh(bodyGeometry, woolMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    lambGroup.add(bodyMesh);

    // Wool Tufts: add smaller spheres on surface to make it look extremely curly and cloud-like (3D realism)
    const woolTufts: THREE.Mesh[] = [];
    const tuftPositions = [
      [0.8, 0.4, 0.5], [-0.8, 0.4, 0.5], [0.8, -0.4, 0.5], [-0.8, -0.4, 0.5],
      [0.9, 0.2, -0.5], [-0.9, 0.2, -0.5], [0.0, 0.8, 0.2], [0.0, 0.7, -0.6],
      [0.4, 0.6, 0.6], [-0.4, 0.6, 0.6], [0.5, 0.5, -0.7], [-0.5, 0.5, -0.7],
      [-1.1, -0.1, 0.0], [1.1, -0.1, 0.0], [0.0, -0.7, 0.4], [0.0, 0.7, 0.6]
    ];
    
    tuftPositions.forEach(([x, y, z]) => {
      const size = 0.35 + Math.random() * 0.15;
      const tuftGeo = new THREE.SphereGeometry(size, 16, 16);
      const tuft = new THREE.Mesh(tuftGeo, woolMaterial);
      tuft.position.set(x, y, z);
      bodyMesh.add(tuft);
      woolTufts.push(tuft);
    });

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.6, 16);
    const neckMesh = new THREE.Mesh(neckGeo, woolMaterial);
    neckMesh.position.set(0.9, 0.4, 0);
    neckMesh.rotation.z = -0.35;
    lambGroup.add(neckMesh);

    // Head Group (parent group so we can pitch/yaw to look at host)
    const headGroup = new THREE.Group();
    headGroup.position.set(1.15, 0.85, 0);
    lambGroup.add(headGroup);

    // Head Main (peach skin smooth shape)
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    headGeo.scale(1.1, 1.0, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.castShadow = true;
    headMesh.rotation.y = Math.PI / 2; // Face forward along positive X
    headGroup.add(headMesh);

    // Head wool crown (top hair tuft)
    const crownGeo = new THREE.SphereGeometry(0.3, 16, 16);
    crownGeo.scale(1.2, 0.8, 1.2);
    const crownMesh = new THREE.Mesh(crownGeo, woolMaterial);
    crownMesh.position.set(0, 0.42, 0);
    headGroup.add(crownMesh);
    
    // Tiny crown wool tufts
    const crownTuftGeo = new THREE.SphereGeometry(0.14, 8, 8);
    for (let i = 0; i < 5; i++) {
      const cTuft = new THREE.Mesh(crownTuftGeo, woolMaterial);
      cTuft.position.set(
        Math.sin((i / 5) * Math.PI * 2) * 0.22,
        0.44 + Math.random() * 0.05,
        Math.cos((i / 5) * Math.PI * 2) * 0.22
      );
      headGroup.add(cTuft);
    }

    // Eyes - Left and Right
    const eyeGlobalLeft = new THREE.Group();
    eyeGlobalLeft.position.set(0.28, 0.12, 0.35); // Facing positive X (so +Z is left side, -Z is right side relative to head)
    headGroup.add(eyeGlobalLeft);

    const eyeGlobalRight = new THREE.Group();
    eyeGlobalRight.position.set(0.28, 0.12, -0.35);
    headGroup.add(eyeGlobalRight);

    // Eye bases (Whites of the eyes)
    const eyeBaseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const leftEyeBase = new THREE.Mesh(eyeBaseGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const rightEyeBase = new THREE.Mesh(eyeBaseGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeGlobalLeft.add(leftEyeBase);
    eyeGlobalRight.add(rightEyeBase);

    // Pupils (iris)
    const pupilGeo = new THREE.SphereGeometry(0.048, 16, 16);
    pupilGeo.scale(1, 1, 0.4); // Flat pupil
    const leftPupil = new THREE.Mesh(pupilGeo, eyeMaterial);
    leftPupil.position.set(0.04, 0, 0.02);
    leftEyeBase.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, eyeMaterial);
    rightPupil.position.set(0.04, 0, -0.02);
    rightEyeBase.add(rightPupil);

    // Highlight dot to look incredibly sparkly and cute
    const hlGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const leftHighlight = new THREE.Mesh(hlGeo, eyeHighlightMaterial);
    leftHighlight.position.set(0.03, 0.02, 0.02);
    leftPupil.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(hlGeo, eyeHighlightMaterial);
    rightHighlight.position.set(0.03, 0.02, -0.02);
    rightPupil.add(rightHighlight);

    // Floppy Ears (Left & Right)
    const earLeftGroup = new THREE.Group();
    earLeftGroup.position.set(-0.15, 0.15, 0.52);
    headGroup.add(earLeftGroup);

    const earRightGroup = new THREE.Group();
    earRightGroup.position.set(-0.15, 0.15, -0.52);
    headGroup.add(earRightGroup);

    const earGeo = new THREE.BoxGeometry(0.12, 0.4, 0.22);
    earGeo.scale(1.0, 1.0, 0.5); // Flat drop shape
    
    // Add custom pink texture/inner ear
    const earLeftMesh = new THREE.Mesh(earGeo, skinMaterial);
    earLeftMesh.position.set(0, -0.15, 0);
    earLeftGroup.add(earLeftMesh);

    const earRightMesh = new THREE.Mesh(earGeo, skinMaterial);
    earRightMesh.position.set(0, -0.15, 0);
    earRightGroup.add(earRightMesh);

    // Ear wool covers (back of ears)
    const earCoverGeo = new THREE.BoxGeometry(0.14, 0.35, 0.1);
    const leftEarCover = new THREE.Mesh(earCoverGeo, woolMaterial);
    leftEarCover.position.set(-0.02, 0, 0.05);
    earLeftMesh.add(leftEarCover);

    const rightEarCover = new THREE.Mesh(earCoverGeo, woolMaterial);
    rightEarCover.position.set(-0.02, 0, -0.05);
    earRightMesh.add(rightEarCover);

    // Mouth / Jaw (Animating for speaking)
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0.35, -0.22, 0);
    headGroup.add(jawGroup);

    const jawGeo = new THREE.BoxGeometry(0.25, 0.1, 0.28);
    const jawMesh = new THREE.Mesh(jawGeo, skinMaterial);
    jawMesh.position.set(0, -0.02, 0);
    jawGroup.add(jawMesh);

    // Inner mouth pink overlay
    const innerMouthGeo = new THREE.BoxGeometry(0.2, 0.02, 0.22);
    const innerMouth = new THREE.Mesh(innerMouthGeo, mouthPinkMaterial);
    innerMouth.position.set(0, 0.04, 0);
    jawMesh.add(innerMouth);

    // Nose (Sweet little pink nose)
    const noseGeo = new THREE.ConeGeometry(0.065, 0.065, 4);
    noseGeo.rotateX(Math.PI);
    const nose = new THREE.Mesh(noseGeo, mouthPinkMaterial);
    nose.position.set(0.48, -0.05, 0);
    nose.rotation.y = Math.PI / 4;
    headGroup.add(nose);

    // 7. Leg positions
    // Legs: front right, front left, back right, back left
    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.8, 16);
    const hoofGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.15, 16);
    const hoofMesh = new THREE.Mesh(hoofGeo, darkSkinMaterial);

    const legConfigs = [
      { name: 'fl', x: 0.5, z: 0.35 },
      { name: 'fr', x: 0.5, z: -0.35 },
      { name: 'bl', x: -0.5, z: 0.35 },
      { name: 'br', x: -0.5, z: -0.35 }
    ];

    const legs: { group: THREE.Group; name: string }[] = [];

    legConfigs.forEach((lc) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lc.x, -0.8, lc.z);
      
      const legCylinder = new THREE.Mesh(legGeo, skinMaterial);
      legCylinder.position.set(0, 0.2, 0);
      legCylinder.castShadow = true;
      legGroup.add(legCylinder);
      
      const legHoof = hoofMesh.clone();
      legHoof.position.set(0, -0.25, 0);
      legGroup.add(legHoof);
      
      // Upper leg joint wool
      const upperWoolGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const upperWool = new THREE.Mesh(upperWoolGeo, woolMaterial);
      upperWool.position.set(0, 0.45, 0);
      legGroup.add(upperWool);

      lambGroup.add(legGroup);
      legs.push({ group: legGroup, name: lc.name });
    });

    // 8. Dynamic Hats & Props based on Chosen Country
    const decoratorGroup = new THREE.Group();
    headGroup.add(decoratorGroup);

    const rebuildProps = (ptype: string) => {
      // Clear existing children
      while (decoratorGroup.children.length > 0) {
        decoratorGroup.remove(decoratorGroup.children[0]);
      }

      if (ptype === 'fez') {
        // Turkish Fez
        const fezGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.35, 16);
        const fez = new THREE.Mesh(fezGeo, fezMaterial);
        fez.position.set(-0.05, 0.6, 0);
        fez.rotation.z = -0.15;
        fez.castShadow = true;
        decoratorGroup.add(fez);

        // Black tassel crown piece
        const topPieceGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8);
        const topPiece = new THREE.Mesh(topPieceGeo, blackTasselMaterial);
        topPiece.position.set(-0.05, 0.79, 0);
        decoratorGroup.add(topPiece);

        // Tassel strand string
        const strandGeo = new THREE.BoxGeometry(0.12, 0.015, 0.015);
        const strand = new THREE.Mesh(strandGeo, blackTasselMaterial);
        strand.position.set(-0.1, 0.77, 0.05);
        strand.rotation.y = 0.5;
        decoratorGroup.add(strand);
      } 
      else if (ptype === 'kalpak') {
        // Kyrgyz Ak-Kalpak
        const kalpakGeo = new THREE.CylinderGeometry(0.1, 0.28, 0.42, 4);
        const kalpak = new THREE.Mesh(kalpakGeo, kalpakMaterial);
        kalpak.position.set(-0.05, 0.65, 0);
        kalpak.rotation.y = Math.PI / 4; // Turn it to be diamond aligned
        kalpak.castShadow = true;
        decoratorGroup.add(kalpak);

        // Velvet black wing borders
        const wingGeo = new THREE.CylinderGeometry(0.29, 0.3, 0.08, 4);
        const wing = new THREE.Mesh(wingGeo, kalpakBorderMaterial);
        wing.position.set(-0.05, 0.46, 0);
        wing.rotation.y = Math.PI / 4;
        decoratorGroup.add(wing);
      } 
      else if (ptype === 'clover') {
        // Irish Clover Top Hat
        const brimGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.02, 32);
        const brim = new THREE.Mesh(brimGeo, cloverHatMaterial);
        brim.position.set(-0.05, 0.48, 0);
        decoratorGroup.add(brim);

        const hatGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.45, 32);
        const crown = new THREE.Mesh(hatGeo, cloverHatMaterial);
        crown.position.set(-0.05, 0.7, 0);
        crown.castShadow = true;
        decoratorGroup.add(crown);

        // Gold buckle leather band
        const bandGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.08, 32);
        const band = new THREE.Mesh(bandGeo, goldBandMaterial);
        band.position.set(-0.05, 0.52, 0);
        decoratorGroup.add(band);
      }
      else if (ptype === 'hapi') {
        // Japanese Hapi collar - beautifully overlayed neckband
        const neckbandGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16);
        const hapiCollar = new THREE.Mesh(neckbandGeo, new THREE.MeshStandardMaterial({
          color: 0x1d3557, // Samurai Indigo Blue
          roughness: 0.6
        }));
        hapiCollar.position.set(0.92, 0.42, 0);
        hapiCollar.rotation.z = -0.35;
        // Since hapi is on neck, we add it back to lambGroup
        decoratorGroup.add(hapiCollar);
      }
      else if (ptype === 'chef') {
        // Italian Elegant Red Chef scarf / fular around neck
        const scarfGeo = new THREE.CylinderGeometry(0.36, 0.45, 0.12, 16);
        const scarf = new THREE.Mesh(scarfGeo, new THREE.MeshStandardMaterial({
          color: 0xe63946, // Italian Passionate Red
          roughness: 0.8
        }));
        scarf.position.set(0.92, 0.42, 0);
        scarf.rotation.z = -0.35;
        decoratorGroup.add(scarf);

        // Tie knot on the side
        const knotGeo = new THREE.SphereGeometry(0.09, 8, 8);
        const knot = new THREE.Mesh(knotGeo, new THREE.MeshStandardMaterial({ color: 0xe63946 }));
        knot.position.set(0.92, 0.42, 0.35);
        decoratorGroup.add(knot);
      }
    };

    // Rebuild initial decoration
    rebuildProps(propTypeRef.current);

    // Position entire lamb nicely in front of the center
    lambGroup.position.set(-0.4, -0.6, 0);
    // Rotate 3/4 towards camera for visual depth & 3D layout aesthetics
    lambGroup.rotation.y = -Math.PI / 1.7; 

    // Handle mouse movement for natural GAZE tracking
    const targetGaze = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate normalized device coordinates (-1 to 1)
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Limit range to make it natural
      targetGaze.x = Math.max(-1, Math.min(1, x)) * 0.45;
      targetGaze.y = Math.max(-1, Math.min(1, y)) * 0.35;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // 9. Animation parameters
    let animationFrameId: number;
    let clock = new THREE.Clock();
    
    // Blinking trigger timer
    let timeSinceLastBlink = 0;
    let blinkActive = false;
    let blinkProgress = 0;

    let localPropType = propTypeRef.current;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Check if country configuration / hat changed dynamically
      if (propTypeRef.current !== localPropType) {
        localPropType = propTypeRef.current;
        rebuildProps(localPropType);
      }

      // -- A. Idle Breathing Loop (Subtle chest scale & body up-down)
      const breathing = Math.sin(time * 2.2) * 0.015;
      bodyMesh.scale.set(1.25 + breathing, 1.0 + breathing * 1.5, 1.0 + breathing);
      lambGroup.position.y = -0.6 + breathing * 0.6;

      // -- B. Head dynamic lookup & mouse tracking
      // Interpolate for ultra smooth gaze transition
      headGroup.rotation.y = (Math.PI / 2) + THREE.MathUtils.lerp(headGroup.rotation.y - (Math.PI / 2), targetGaze.x, 0.1);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, -targetGaze.y, 0.1);

      // -- C. Blinking simulation
      timeSinceLastBlink += delta;
      if (timeSinceLastBlink > 4.5 && !blinkActive && Math.random() < 0.1) {
        blinkActive = true;
        blinkProgress = 0;
      }
      
      if (blinkActive) {
        blinkProgress += delta * 12; // Speed of blinking
        if (blinkProgress > Math.PI) {
          blinkActive = false;
          blinkProgress = 0;
          timeSinceLastBlink = 0;
          leftEyeBase.scale.y = 1.0;
          rightEyeBase.scale.y = 1.0;
        } else {
          const eyeScale = 1.0 - Math.sin(blinkProgress);
          leftEyeBase.scale.y = Math.max(0.01, eyeScale);
          rightEyeBase.scale.y = Math.max(0.01, eyeScale);
        }
      }

      // -- D. Ear animation based on thinking or idle
      if (isThinkingRef.current) {
        // Drop ears downwards (sad/deep thought posture)
        const thinkEarOsc = Math.sin(time * 4) * 0.05;
        earLeftGroup.rotation.z = -0.7 + thinkEarOsc;
        earRightGroup.rotation.z = 0.7 - thinkEarOsc;
        // Pitch head down slightly
        headGroup.position.y = 0.82 + Math.sin(time * 1.5) * 0.01;
      } else if (isTalkingRef.current) {
        // Wiggle ears cheerfully
        const talkEarOsc = Math.sin(time * 12) * 0.2;
        earLeftGroup.rotation.z = -0.25 + talkEarOsc;
        earRightGroup.rotation.z = 0.25 - talkEarOsc;
        earLeftGroup.rotation.x = talkEarOsc * 0.5;
        earRightGroup.rotation.x = -talkEarOsc * 0.5;
        headGroup.position.y = 0.85 + Math.abs(Math.sin(time * 8)) * 0.04;
      } else {
        // Standard gentle wiggle
        const earIdleOsc = Math.sin(time * 1.5) * 0.08;
        earLeftGroup.rotation.z = -0.3 + earIdleOsc;
        earRightGroup.rotation.z = 0.3 - earIdleOsc;
        earLeftGroup.rotation.x = 0;
        earRightGroup.rotation.x = 0;
        headGroup.position.y = 0.85;
      }

      // -- E. Talking mouth synchronization (Mouth flapping)
      if (isTalkingRef.current) {
        const mouthOsc = Math.abs(Math.sin(time * 15)) * 0.22;
        jawGroup.position.y = -0.22 - mouthOsc;
        jawGroup.rotation.z = mouthOsc * 0.4;
      } else {
        // Idle closed mouth
        jawGroup.position.y = -0.22;
        jawGroup.rotation.z = 0;
      }

      // Renderer render
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    // Begin animation loop
    animate();

    // 10. Handle window resize elegantly
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(container);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[280px] md:min-h-[380px] relative transition-transform duration-500 ease-out"
      style={{ cursor: 'pointer' }}
    />
  );
};
