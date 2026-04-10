import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground({ theme }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountNode.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const materialA = new THREE.MeshPhysicalMaterial({
      color: theme === "dark" ? 0x38bdf8 : 0x0ea5e9,
      roughness: 0.2,
      metalness: 0.25,
      transparent: true,
      opacity: theme === "dark" ? 0.34 : 0.16,
      transmission: 0.15,
    });

    const materialB = new THREE.MeshPhysicalMaterial({
      color: theme === "dark" ? 0xf97316 : 0xec4899,
      roughness: 0.3,
      metalness: 0.24,
      transparent: true,
      opacity: theme === "dark" ? 0.2 : 0.08,
    });

    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 12), materialA);
    sphere.position.set(-3, 1.3, -2);
    group.add(sphere);

    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.28, 128, 18), materialB);
    torus.position.set(3.8, -1.8, -4);
    group.add(torus);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 110;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.045,
        color: theme === "dark" ? 0xe2e8f0 : 0x0f172a,
        transparent: true,
        opacity: theme === "dark" ? 0.28 : 0.08,
      })
    );
    scene.add(particles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    const pointLight = new THREE.PointLight(
      theme === "dark" ? 0x67e8f9 : 0xffffff,
      16,
      100
    );
    pointLight.position.set(2, 4, 8);
    scene.add(ambientLight, pointLight);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    let animationFrameId;

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);
      sphere.rotation.x += 0.0025;
      sphere.rotation.y += 0.0035;
      torus.rotation.x -= 0.003;
      torus.rotation.y += 0.0022;
      group.rotation.z += 0.0008;
      particles.rotation.y -= 0.0007;
      renderer.render(scene, camera);
    };

    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrameId);
      mountNode.removeChild(renderer.domElement);
      particleGeometry.dispose();
      sphere.geometry.dispose();
      torus.geometry.dispose();
      materialA.dispose();
      materialB.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-light opacity-35 dark:bg-mesh-dark dark:opacity-40" />
      <div className="hero-grid absolute inset-0 opacity-20 dark:opacity-10" />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
