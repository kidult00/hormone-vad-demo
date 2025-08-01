import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

// 定义情绪数据类型
interface EmotionData {
  emotion: string;
  valence: number;
  arousal: number;
  dominance: number;
}

// 定义当前VAD状态类型
interface VADState {
  valence: number;
  arousal: number;
  dominance: number;
}

// 情绪点组件
const EmotionPoint: React.FC<{ data: EmotionData; currentVAD: VADState; pointSize: number }> = ({ data, currentVAD, pointSize }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  // 判断是否为当前选中的点
  const isSelected = (
    Math.abs(data.valence - currentVAD.valence) < 0.01 &&
    Math.abs(data.arousal - currentVAD.arousal) < 0.01 &&
    Math.abs(data.dominance - currentVAD.dominance) < 0.01
  );
  
  // 为选中的点使用不同的颜色
  const color = isSelected ? '#ff0000' : '#4caf50';
  
  return (
    <group position={[data.valence, data.arousal, data.dominance]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[isSelected ? pointSize * 1.5 : pointSize, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 使用drei的Text组件显示情绪名称 */}
      <Text
        position={[0, pointSize * 2, 0]}
        fontSize={pointSize * 1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {data.emotion}
      </Text>
    </group>
  );
};

// 坐标轴组件
const Axes: React.FC = () => {
  return (
    <group>
      {/* X轴 (Valence) */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), 2, 0xff0000]} />
      <Text position={[1.1, 0, 0]} fontSize={0.1} color="red">Valence</Text>
      
      {/* Y轴 (Arousal) */}
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0), 2, 0x00ff00]} />
      <Text position={[0, 1.1, 0]} fontSize={0.1} color="green">Arousal</Text>
      
      {/* Z轴 (Dominance) */}
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1), 2, 0x0000ff]} />
      <Text position={[0, 0, 1.1]} fontSize={0.1} color="blue">Dominance</Text>
    </group>
  );
};

// 3D情绪分布图页面
const Emotion3DPage: React.FC<{ currentVAD: VADState }> = ({ currentVAD }) => {
  const navigate = useNavigate();
  
  const { showAxes, pointSize } = useControls('3D Chart', {
    showAxes: true,
    pointSize: { value: 0.05, min: 0.01, max: 0.2, step: 0.01 }
  });
  
  // 加载情绪数据
  const [emotionData, setEmotionData] = React.useState<EmotionData[]>([]);
  
  React.useEffect(() => {
    fetch('/data/vad3d.json')
      .then(response => response.json())
      .then(data => setEmotionData(data))
      .catch(error => console.error('Error loading emotion data:', error));
  }, []);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 返回按钮 */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
        <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
          <ChevronLeft size={16} />
          返回 2D
        </Button>
      </div>
      
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* 渲染情绪点 */}
        {emotionData.map((emotion) => (
          <EmotionPoint 
            key={emotion.emotion} 
            data={emotion} 
            currentVAD={currentVAD}
            pointSize={pointSize}
          />
        ))}
        
        {/* 渲染坐标轴 */}
        {showAxes && <Axes />}
        
        {/* 添加轨道控制 */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default Emotion3DPage;