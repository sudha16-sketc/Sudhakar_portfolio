import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";

export default function FloatingModel() {
  const model = useGLTF("/models/katana.glb");

  const ref = useRef();

  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;

      const progress = max > 0 ? window.scrollY / max : 0;
      setScroll(progress);
    };

    updateScroll();

    window.addEventListener("scroll", updateScroll);

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.elapsedTime;

    // Floating animation
    ref.current.position.y = Math.sin(t * 2) * 0.4;

    // Scroll movement
    ref.current.position.x = Math.sin(scroll * Math.PI * 2) * 2;

    ref.current.position.z = Math.cos(scroll * Math.PI) * 1.2;

    // Rotation
    ref.current.rotation.y += 0.02;
    ref.current.rotation.x += 0.003;
  });

  return <primitive ref={ref} object={model.scene} scale={2} />;
}
