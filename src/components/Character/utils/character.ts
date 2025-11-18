import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        // For local development, we can try to load the encrypted model
        // but provide a clear error message if it fails
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        loader.load(
          blobUrl,
          async (gltf) => {
            const character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            // Position the character
            character.position.set(0, 0, 0);
            character.rotation.set(0, 0, 0);
            character.scale.set(1, 1, 1);
            
            // Set up character animations and timelines
            setCharTimeline(character, camera);
            setAllTimeline();
            
            // Adjust foot positions if they exist
            const footR = character.getObjectByName("footR");
            const footL = character.getObjectByName("footL");
            
            if (footR) footR.position.y = 0;
            if (footL) footL.position.y = 0;
            
            // Center the character
            const box = new THREE.Box3().setFromObject(character);
            const center = box.getCenter(new THREE.Vector3());
            character.position.sub(center);
            
            // Clean up
            dracoLoader.dispose();
            resolve(gltf);
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        console.error("Failed to load encrypted 3D model. This is likely due to Web Crypto API restrictions in non-secure contexts.", err);
        console.info("To fix this issue:");
        console.info("1. Serve the site over HTTPS, or");
        console.info("2. Use a local development server that supports secure contexts, or");
        console.info("3. Place the unencrypted model file in the models directory");
        
        // Reject with a clearer error message
        reject(new Error("Failed to load 3D character model. Web Crypto API is not available in this context. See console for solutions."));
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;