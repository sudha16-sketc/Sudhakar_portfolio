import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import FloatingModel from "./FloatingModel";

 function ThreeScene() {
  return (
    <Canvas
    dpr={[1, 1.5]}
    frameloop="always"
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
      }}
      gl={{ alpha: true }} className="Canvas"
    >
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <Environment preset="city" />

      <FloatingModel />
    </Canvas>
  );
}

export default ThreeScene;