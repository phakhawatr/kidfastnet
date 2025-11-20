import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon, Star, Orbit, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Text, Html } from "@react-three/drei";
import * as THREE from "three";

type ExperimentType = "menu" | "solar-system" | "planets" | "stars" | "moon-phases";

// Orbit path component
function OrbitPath({ radius }: { radius: number }) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: "#4A90E2", 
    opacity: 0.6, 
    transparent: true,
    linewidth: 2
  });
  const line = new THREE.LineLoop(lineGeometry, lineMaterial);
  
  return <primitive object={line} />;
}

// Planet component for 3D solar system with info tooltip
function Planet({ 
  radius, 
  distance, 
  color, 
  speed, 
  name,
  size,
  distanceFromSun,
  facts,
  isPaused
}: { 
  radius: number; 
  distance: number; 
  color: string; 
  speed: number; 
  name: string;
  size: string;
  distanceFromSun: string;
  facts: string;
  isPaused: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (groupRef.current && !isPaused) {
      const time = clock.getElapsedTime();
      groupRef.current.position.x = Math.cos(time * speed) * distance;
      groupRef.current.position.z = Math.sin(time * speed) * distance;
    }
    if (meshRef.current && !isPaused) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.5 : 0.3} />
      </mesh>
      <Text
        position={[0, radius + 0.5, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {hovered && (
        <Html distanceFactor={10} position={[0, radius + 1.2, 0]}>
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg min-w-[200px] animate-scale-in">
            <h4 className="font-bold text-sm mb-1">{name}</h4>
            <p className="text-xs text-muted-foreground mb-1">Size: {size}</p>
            <p className="text-xs text-muted-foreground mb-1">Distance: {distanceFromSun} million km</p>
            <p className="text-xs text-muted-foreground">{facts}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Star component for Stars & Galaxies 3D visualization
function Star3D({ 
  type, 
  color, 
  size, 
  position,
  animate = false,
  isPaused = false
}: { 
  type: string; 
  color: string; 
  size: number; 
  position: [number, number, number];
  animate?: boolean;
  isPaused?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame(({ clock }) => {
    if (meshRef.current && animate && !isPaused) {
      // Pulsing animation for stars
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.8}
        toneMapped={false}
      />
      {/* Glow effect */}
      <pointLight color={color} intensity={2} distance={size * 5} />
    </mesh>
  );
}

// Sun component
function SunSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#FF3333" />
      <pointLight intensity={2} distance={50} />
    </mesh>
  );
}

// 3D Moon Phase Scene component
interface MoonPhaseSceneProps {
  currentPhase: number;
  isPaused?: boolean;
}

const MoonPhaseScene: React.FC<MoonPhaseSceneProps> = ({ currentPhase, isPaused = false }) => {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (moonRef.current && !isPaused) {
      moonRef.current.rotation.y += 0.002;
    }
  });

  // Moon phase shadow calculation
  const moonPhaseAngle = (currentPhase / 8) * Math.PI * 2;

  return (
    <group>
      <mesh ref={moonRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
      {/* Shadow visualization for moon phase */}
      <mesh position={[Math.cos(moonPhaseAngle) * 1.5, 0, Math.sin(moonPhaseAngle) * 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

const AstronomyLabApp = () => {
  const { t } = useTranslation("astronomylab");
  const navigate = useNavigate();
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentType>("menu");
  const [selectedPlanet, setSelectedPlanet] = useState<string>("earth");
  const [selectedStar, setSelectedStar] = useState<string>("sun");
  const [moonPhase, setMoonPhase] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [showStarsQuiz, setShowStarsQuiz] = useState(false);
  const [starsCurrentQuestion, setStarsCurrentQuestion] = useState(0);
  const [starsSelectedAnswer, setStarsSelectedAnswer] = useState<number | null>(null);
  const [starsScore, setStarsScore] = useState(0);
  const [starsQuizCompleted, setStarsQuizCompleted] = useState(false);
  const [starsAnsweredCorrectly, setStarsAnsweredCorrectly] = useState<boolean | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isPausedStars, setIsPausedStars] = useState(false);
  const [isFullscreenStars, setIsFullscreenStars] = useState(false);
  const starsCanvasRef = useRef<HTMLDivElement>(null);
  const [isPausedMoon, setIsPausedMoon] = useState(false);
  const [isFullscreenMoon, setIsFullscreenMoon] = useState(false);
  const moonCanvasRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!canvasContainerRef.current) return;
    
    if (!isFullscreen) {
      if (canvasContainerRef.current.requestFullscreen) {
        canvasContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const toggleFullscreenStars = () => {
    if (!starsCanvasRef.current) return;
    
    if (!isFullscreenStars) {
      if (starsCanvasRef.current.requestFullscreen) {
        starsCanvasRef.current.requestFullscreen();
      }
      setIsFullscreenStars(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreenStars(false);
    }
  };

  const toggleFullscreenMoon = () => {
    if (!moonCanvasRef.current) return;
    
    if (!isFullscreenMoon) {
      if (moonCanvasRef.current.requestFullscreen) {
        moonCanvasRef.current.requestFullscreen();
      }
      setIsFullscreenMoon(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreenMoon(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const planets = [
    { 
      id: "mercury", 
      name: t("experiments.planets.list.mercury"), 
      size: t("experiments.planets.mercury.size"),
      distance: "57.9", 
      color: "#B8B8B8", 
      emoji: "☿️",
      facts: t("experiments.planets.mercury.facts")
    },
    { 
      id: "venus", 
      name: t("experiments.planets.list.venus"), 
      size: t("experiments.planets.venus.size"),
      distance: "108.2", 
      color: "#FFD700", 
      emoji: "♀️",
      facts: t("experiments.planets.venus.facts")
    },
    { 
      id: "earth", 
      name: t("experiments.planets.list.earth"), 
      size: t("experiments.planets.earth.size"),
      distance: "149.6", 
      color: "#1E90FF", 
      emoji: "🌍",
      facts: t("experiments.planets.earth.facts")
    },
    { 
      id: "mars", 
      name: t("experiments.planets.list.mars"), 
      size: t("experiments.planets.mars.size"),
      distance: "227.9", 
      color: "#FF4500", 
      emoji: "♂️",
      facts: t("experiments.planets.mars.facts")
    },
    { 
      id: "jupiter", 
      name: t("experiments.planets.list.jupiter"), 
      size: t("experiments.planets.jupiter.size"),
      distance: "778.5", 
      color: "#FFA500", 
      emoji: "♃",
      facts: t("experiments.planets.jupiter.facts")
    },
    { 
      id: "saturn", 
      name: t("experiments.planets.list.saturn"), 
      size: t("experiments.planets.saturn.size"),
      distance: "1434", 
      color: "#F4E4C1", 
      emoji: "♄",
      facts: t("experiments.planets.saturn.facts")
    },
    { 
      id: "uranus", 
      name: t("experiments.planets.list.uranus"), 
      size: t("experiments.planets.uranus.size"),
      distance: "2871", 
      color: "#00CED1", 
      emoji: "♅",
      facts: t("experiments.planets.uranus.facts")
    },
    { 
      id: "neptune", 
      name: t("experiments.planets.list.neptune"), 
      size: t("experiments.planets.neptune.size"),
      distance: "4495", 
      color: "#4169E1", 
      emoji: "♆",
      facts: t("experiments.planets.neptune.facts")
    },
  ];

  const quizQuestions = [
    { 
      question: t("experiments.solar_system.quiz.q1.question"), 
      options: [
        t("experiments.solar_system.quiz.q1.a"),
        t("experiments.solar_system.quiz.q1.b"),
        t("experiments.solar_system.quiz.q1.c"),
        t("experiments.solar_system.quiz.q1.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.solar_system.quiz.q2.question"), 
      options: [
        t("experiments.solar_system.quiz.q2.a"),
        t("experiments.solar_system.quiz.q2.b"),
        t("experiments.solar_system.quiz.q2.c"),
        t("experiments.solar_system.quiz.q2.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.solar_system.quiz.q3.question"), 
      options: [
        t("experiments.solar_system.quiz.q3.a"),
        t("experiments.solar_system.quiz.q3.b"),
        t("experiments.solar_system.quiz.q3.c"),
        t("experiments.solar_system.quiz.q3.d")
      ], 
      correct: 0 
    },
    { 
      question: t("experiments.solar_system.quiz.q4.question"), 
      options: [
        t("experiments.solar_system.quiz.q4.a"),
        t("experiments.solar_system.quiz.q4.b"),
        t("experiments.solar_system.quiz.q4.c"),
        t("experiments.solar_system.quiz.q4.d")
      ], 
      correct: 2 
    },
    { 
      question: t("experiments.solar_system.quiz.q5.question"), 
      options: [
        t("experiments.solar_system.quiz.q5.a"),
        t("experiments.solar_system.quiz.q5.b"),
        t("experiments.solar_system.quiz.q5.c"),
        t("experiments.solar_system.quiz.q5.d")
      ], 
      correct: 0 
    },
    { 
      question: t("experiments.solar_system.quiz.q6.question"), 
      options: [
        t("experiments.solar_system.quiz.q6.a"),
        t("experiments.solar_system.quiz.q6.b"),
        t("experiments.solar_system.quiz.q6.c"),
        t("experiments.solar_system.quiz.q6.d")
      ], 
      correct: 3 
    },
    { 
      question: t("experiments.solar_system.quiz.q7.question"), 
      options: [
        t("experiments.solar_system.quiz.q7.a"),
        t("experiments.solar_system.quiz.q7.b"),
        t("experiments.solar_system.quiz.q7.c"),
        t("experiments.solar_system.quiz.q7.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.solar_system.quiz.q8.question"), 
      options: [
        t("experiments.solar_system.quiz.q8.a"),
        t("experiments.solar_system.quiz.q8.b"),
        t("experiments.solar_system.quiz.q8.c"),
        t("experiments.solar_system.quiz.q8.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.solar_system.quiz.q9.question"), 
      options: [
        t("experiments.solar_system.quiz.q9.a"),
        t("experiments.solar_system.quiz.q9.b"),
        t("experiments.solar_system.quiz.q9.c"),
        t("experiments.solar_system.quiz.q9.d")
      ], 
      correct: 0 
    },
    { 
      question: t("experiments.solar_system.quiz.q10.question"), 
      options: [
        t("experiments.solar_system.quiz.q10.a"),
        t("experiments.solar_system.quiz.q10.b"),
        t("experiments.solar_system.quiz.q10.c"),
        t("experiments.solar_system.quiz.q10.d")
      ], 
      correct: 2 
    }
  ];

  const stars = [
    { id: "sun", type: "yellow_dwarf", emoji: "☀️", color: "#FFD700", size: 1.5, lifeStage: 0 },
    { id: "red_giant", type: "red_giant", emoji: "🔴", color: "#FF4500", size: 3, lifeStage: 1 },
    { id: "white_dwarf", type: "white_dwarf", emoji: "⚪", color: "#FFFFFF", size: 0.8, lifeStage: 2 },
    { id: "neutron_star", type: "neutron_star", emoji: "💫", color: "#00BFFF", size: 0.5, lifeStage: 3 },
    { id: "black_hole", type: "black_hole", emoji: "⚫", color: "#000000", size: 1, lifeStage: 4 },
  ];

  const starsQuizQuestions = [
    { 
      question: t("experiments.stars.quiz.q1.question"), 
      options: [
        t("experiments.stars.quiz.q1.a"),
        t("experiments.stars.quiz.q1.b"),
        t("experiments.stars.quiz.q1.c"),
        t("experiments.stars.quiz.q1.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.stars.quiz.q2.question"), 
      options: [
        t("experiments.stars.quiz.q2.a"),
        t("experiments.stars.quiz.q2.b"),
        t("experiments.stars.quiz.q2.c"),
        t("experiments.stars.quiz.q2.d")
      ], 
      correct: 0 
    },
    { 
      question: t("experiments.stars.quiz.q3.question"), 
      options: [
        t("experiments.stars.quiz.q3.a"),
        t("experiments.stars.quiz.q3.b"),
        t("experiments.stars.quiz.q3.c"),
        t("experiments.stars.quiz.q3.d")
      ], 
      correct: 2 
    },
    { 
      question: t("experiments.stars.quiz.q4.question"), 
      options: [
        t("experiments.stars.quiz.q4.a"),
        t("experiments.stars.quiz.q4.b"),
        t("experiments.stars.quiz.q4.c"),
        t("experiments.stars.quiz.q4.d")
      ], 
      correct: 3 
    },
    { 
      question: t("experiments.stars.quiz.q5.question"), 
      options: [
        t("experiments.stars.quiz.q5.a"),
        t("experiments.stars.quiz.q5.b"),
        t("experiments.stars.quiz.q5.c"),
        t("experiments.stars.quiz.q5.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.stars.quiz.q6.question"), 
      options: [
        t("experiments.stars.quiz.q6.a"),
        t("experiments.stars.quiz.q6.b"),
        t("experiments.stars.quiz.q6.c"),
        t("experiments.stars.quiz.q6.d")
      ], 
      correct: 2 
    },
    { 
      question: t("experiments.stars.quiz.q7.question"), 
      options: [
        t("experiments.stars.quiz.q7.a"),
        t("experiments.stars.quiz.q7.b"),
        t("experiments.stars.quiz.q7.c"),
        t("experiments.stars.quiz.q7.d")
      ], 
      correct: 1 
    },
    { 
      question: t("experiments.stars.quiz.q8.question"), 
      options: [
        t("experiments.stars.quiz.q8.a"),
        t("experiments.stars.quiz.q8.b"),
        t("experiments.stars.quiz.q8.c"),
        t("experiments.stars.quiz.q8.d")
      ], 
      correct: 0 
    },
    { 
      question: t("experiments.stars.quiz.q9.question"), 
      options: [
        t("experiments.stars.quiz.q9.a"),
        t("experiments.stars.quiz.q9.b"),
        t("experiments.stars.quiz.q9.c"),
        t("experiments.stars.quiz.q9.d")
      ], 
      correct: 3 
    },
    { 
      question: t("experiments.stars.quiz.q10.question"), 
      options: [
        t("experiments.stars.quiz.q10.a"),
        t("experiments.stars.quiz.q10.b"),
        t("experiments.stars.quiz.q10.c"),
        t("experiments.stars.quiz.q10.d")
      ], 
      correct: 1 
    }
  ];

  const moonPhases = [
    { phase: 0, name: "new_moon", emoji: "🌑" },
    { phase: 1, name: "waxing_crescent", emoji: "🌒" },
    { phase: 2, name: "first_quarter", emoji: "🌓" },
    { phase: 3, name: "waxing_gibbous", emoji: "🌔" },
    { phase: 4, name: "full_moon", emoji: "🌕" },
    { phase: 5, name: "waning_gibbous", emoji: "🌖" },
    { phase: 6, name: "last_quarter", emoji: "🌗" },
    { phase: 7, name: "waning_crescent", emoji: "🌘" },
  ];

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("solar-system")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
            <Orbit className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.solar_system.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.solar_system.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("planets")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full">
            <Sun className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.planets.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.planets.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("stars")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full">
            <Star className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.stars.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.stars.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("moon-phases")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-gray-400 to-slate-400 rounded-full">
            <Moon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.moon_phases.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.moon_phases.description")}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSolarSystem = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.solar_system.interactive")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("experiments.solar_system.controls")}</p>
        <div ref={canvasContainerRef} className="relative w-full h-[500px] bg-gradient-to-b from-black to-indigo-950 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} />
            <OrbitControls enableZoom={true} enablePan={true} />
            
            {/* Sun */}
            <SunSphere />
            
            {/* Orbit Paths */}
            <OrbitPath radius={3} />
            <OrbitPath radius={4.5} />
            <OrbitPath radius={6} />
            <OrbitPath radius={7.5} />
            <OrbitPath radius={10} />
            <OrbitPath radius={13} />
            <OrbitPath radius={16} />
            <OrbitPath radius={18} />
            
            {/* Planets */}
            <Planet 
              radius={0.2} 
              distance={3} 
              color="#B8B8B8" 
              speed={0.4} 
              name="Mercury"
              size={planets[0].size}
              distanceFromSun={planets[0].distance}
              facts={planets[0].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.3} 
              distance={4.5} 
              color="#FFD700" 
              speed={0.3} 
              name="Venus"
              size={planets[1].size}
              distanceFromSun={planets[1].distance}
              facts={planets[1].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.35} 
              distance={6} 
              color="#1E90FF" 
              speed={0.25} 
              name="Earth"
              size={planets[2].size}
              distanceFromSun={planets[2].distance}
              facts={planets[2].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.25} 
              distance={7.5} 
              color="#FF4500" 
              speed={0.2} 
              name="Mars"
              size={planets[3].size}
              distanceFromSun={planets[3].distance}
              facts={planets[3].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.8} 
              distance={10} 
              color="#FFA500" 
              speed={0.1} 
              name="Jupiter"
              size={planets[4].size}
              distanceFromSun={planets[4].distance}
              facts={planets[4].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.7} 
              distance={13} 
              color="#F4E4C1" 
              speed={0.08} 
              name="Saturn"
              size={planets[5].size}
              distanceFromSun={planets[5].distance}
              facts={planets[5].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.5} 
              distance={16} 
              color="#00CED1" 
              speed={0.06} 
              name="Uranus"
              size={planets[6].size}
              distanceFromSun={planets[6].distance}
              facts={planets[6].facts}
              isPaused={isPaused}
            />
            <Planet 
              radius={0.48} 
              distance={18} 
              color="#4169E1" 
              speed={0.05} 
              name="Neptune"
              size={planets[7].size}
              distanceFromSun={planets[7].distance}
              facts={planets[7].facts}
              isPaused={isPaused}
            />
            
            <OrbitControls enableZoom={true} enablePan={true} />
          </Canvas>
          
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-background/80 hover:bg-background backdrop-blur-sm p-2 rounded-lg transition-all z-10"
            title={isFullscreen ? t("experiments.solar_system.exit_fullscreen") : t("experiments.solar_system.enter_fullscreen")}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="mt-4 flex gap-2 justify-center">
          <Button 
            onClick={() => setIsPaused(!isPaused)} 
            variant="outline" 
            size="icon"
            title={isPaused ? t("experiments.solar_system.play") : t("experiments.solar_system.pause")}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <p className="font-semibold">{t("experiments.solar_system.tip_title")}</p>
        <p className="text-sm">{t("experiments.solar_system.tip")}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">{t("experiments.solar_system.about_title")}</h3>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>{t("experiments.solar_system.about_paragraph_1")}</p>
          <p>{t("experiments.solar_system.about_paragraph_2")}</p>
          <p>{t("experiments.solar_system.about_paragraph_3")}</p>
          <p>{t("experiments.solar_system.about_paragraph_4")}</p>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">{t("experiments.solar_system.composition_title")}</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>{t("experiments.solar_system.composition_sun")}</li>
            <li>{t("experiments.solar_system.composition_planets")}</li>
            <li>{t("experiments.solar_system.composition_moons")}</li>
            <li>{t("experiments.solar_system.composition_asteroids")}</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6">{t("experiments.solar_system.planets_detail_title")}</h3>
        <div className="space-y-6">
          {[
            {
              name: t("experiments.planets.list.mercury"),
              color: "#B8B8B8",
              imageUrl: "https://png.pngtree.com/png-clipart/20240416/original/pngtree-beautiful-planet-mercury-png-image_14861433.png",
              diameter: "4,879 km",
              mass: "3.30 × 10²³ kg",
              distance: "57.9 " + t("experiments.planets.million_km"),
              orbitalPeriod: "88 " + t("experiments.solar_system.earth_days"),
              description: t("experiments.planets.mercury.detail"),
              features: [t("experiments.planets.mercury.f1"), t("experiments.planets.mercury.f2"), t("experiments.planets.mercury.f3")]
            },
            {
              name: t("experiments.planets.list.venus"),
              color: "#FFA500",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/800px-Venus-real_color.jpg",
              diameter: "12,104 km",
              mass: "4.87 × 10²⁴ kg",
              distance: "108.2 " + t("experiments.planets.million_km"),
              orbitalPeriod: "225 " + t("experiments.solar_system.earth_days"),
              description: t("experiments.planets.venus.detail"),
              features: [t("experiments.planets.venus.f1"), t("experiments.planets.venus.f2"), t("experiments.planets.venus.f3")]
            },
            {
              name: t("experiments.planets.list.earth"),
              color: "#4169E1",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/800px-The_Earth_seen_from_Apollo_17.jpg",
              diameter: "12,742 km",
              mass: "5.97 × 10²⁴ kg",
              distance: "149.6 " + t("experiments.planets.million_km"),
              orbitalPeriod: "365.25 " + t("experiments.solar_system.earth_days"),
              description: t("experiments.planets.earth.detail"),
              features: [t("experiments.planets.earth.f1"), t("experiments.planets.earth.f2"), t("experiments.planets.earth.f3")]
            },
            {
              name: t("experiments.planets.list.mars"),
              color: "#DC143C",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/800px-OSIRIS_Mars_true_color.jpg",
              diameter: "6,779 km",
              mass: "6.42 × 10²³ kg",
              distance: "227.9 " + t("experiments.planets.million_km"),
              orbitalPeriod: "687 " + t("experiments.solar_system.earth_days"),
              description: t("experiments.planets.mars.detail"),
              features: [t("experiments.planets.mars.f1"), t("experiments.planets.mars.f2"), t("experiments.planets.mars.f3")]
            },
            {
              name: t("experiments.planets.list.jupiter"),
              color: "#DAA520",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/800px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg",
              diameter: "139,820 km",
              mass: "1.90 × 10²⁷ kg",
              distance: "778.5 " + t("experiments.planets.million_km"),
              orbitalPeriod: "11.9 " + t("experiments.solar_system.earth_years"),
              description: t("experiments.planets.jupiter.detail"),
              features: [t("experiments.planets.jupiter.f1"), t("experiments.planets.jupiter.f2"), t("experiments.planets.jupiter.f3")]
            },
            {
              name: t("experiments.planets.list.saturn"),
              color: "#F4A460",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/800px-Saturn_during_Equinox.jpg",
              diameter: "116,460 km",
              mass: "5.68 × 10²⁶ kg",
              distance: "1,434 " + t("experiments.planets.million_km"),
              orbitalPeriod: "29.5 " + t("experiments.solar_system.earth_years"),
              description: t("experiments.planets.saturn.detail"),
              features: [t("experiments.planets.saturn.f1"), t("experiments.planets.saturn.f2"), t("experiments.planets.saturn.f3")]
            },
            {
              name: t("experiments.planets.list.uranus"),
              color: "#40E0D0",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/800px-Uranus2.jpg",
              diameter: "50,724 km",
              mass: "8.68 × 10²⁵ kg",
              distance: "2,871 " + t("experiments.planets.million_km"),
              orbitalPeriod: "84 " + t("experiments.solar_system.earth_years"),
              description: t("experiments.planets.uranus.detail"),
              features: [t("experiments.planets.uranus.f1"), t("experiments.planets.uranus.f2"), t("experiments.planets.uranus.f3")]
            },
            {
              name: t("experiments.planets.list.neptune"),
              color: "#1E90FF",
              imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/800px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg",
              diameter: "49,244 km",
              mass: "1.02 × 10²⁶ kg",
              distance: "4,495 " + t("experiments.planets.million_km"),
              orbitalPeriod: "164.8 " + t("experiments.solar_system.earth_years"),
              description: t("experiments.planets.neptune.detail"),
              features: [t("experiments.planets.neptune.f1"), t("experiments.planets.neptune.f2"), t("experiments.planets.neptune.f3")]
            }
          ].map((planet) => (
            <div key={planet.name} className="border-b last:border-b-0 pb-6 last:pb-0 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src={planet.imageUrl} 
                    alt={planet.name}
                    className="w-full md:w-48 h-48 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                      e.currentTarget.alt = `${planet.name} - รูปภาพไม่สามารถแสดงได้`;
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span style={{ color: planet.color }}>●</span>
                    {planet.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <strong>{t("experiments.planets.diameter")}:</strong> {planet.diameter}
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <strong>{t("experiments.planets.mass")}:</strong> {planet.mass}
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <strong>{t("experiments.planets.distance")}:</strong> {planet.distance}
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <strong>{t("experiments.planets.orbital_period")}:</strong> {planet.orbitalPeriod}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-2">{planet.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {planet.features.map((feature, i) => (
                      <Badge key={i} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button 
          onClick={() => {
            setShowQuiz(true);
            setCurrentQuestion(0);
            setScore(0);
            setQuizCompleted(false);
            setSelectedAnswer(null);
            setAnsweredCorrectly(null);
          }} 
          className="mt-6 w-full"
        >
          {t("experiments.solar_system.start_quiz")}
        </Button>
      </Card>

      {showQuiz && renderQuiz()}
    </div>
  );

  const renderPlanets = () => {
    const planet = planets.find(p => p.id === selectedPlanet);
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.planets.select")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {planets.map((p) => (
              <Button
                key={p.id}
                variant={selectedPlanet === p.id ? "default" : "outline"}
                onClick={() => setSelectedPlanet(p.id)}
                className="h-auto py-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-xs">{p.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {planet && (
          <Card className="p-6 animate-scale-in">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl animate-pulse`}
                     style={{ backgroundColor: planet.color }}>
                  {planet.emoji}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">{planet.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-1">{t("experiments.planets.size")}</p>
                    <p className="text-xs">{t(`experiments.planets.${planet.id}.size`)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-1">{t("experiments.planets.distance")}</p>
                    <p className="text-xs">{planet.distance} {t("experiments.planets.million_km")}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-1">{t("experiments.planets.facts")}</p>
                    <p className="text-xs">{t(`experiments.planets.${planet.id}.facts`)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderStars = () => {
    const star = stars.find(s => s.id === selectedStar);

    const starsDetailInfo = [
      {
        name: t("experiments.stars.types.sun"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/800px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg",
        size: "1,392,700 km",
        temperature: "5,778 K",
        mass: "1.989 × 10³⁰ kg",
        age: "4.6 " + t("experiments.stars.billion_years"),
        description: t("experiments.stars.sun.detail"),
        features: [
          t("experiments.stars.sun.f1"),
          t("experiments.stars.sun.f2"),
          t("experiments.stars.sun.f3")
        ]
      },
      {
        name: t("experiments.stars.types.red_giant"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Artist%27s_impression_of_the_red_supergiant_star_Antares.jpg/800px-Artist%27s_impression_of_the_red_supergiant_star_Antares.jpg",
        size: "100-1,000 × " + t("experiments.stars.sun_size"),
        temperature: "3,000-4,000 K",
        mass: "0.3-8 × " + t("experiments.stars.sun_mass"),
        age: "1-10 " + t("experiments.stars.billion_years"),
        description: t("experiments.stars.red_giant.detail"),
        features: [
          t("experiments.stars.red_giant.f1"),
          t("experiments.stars.red_giant.f2"),
          t("experiments.stars.red_giant.f3")
        ]
      },
      {
        name: t("experiments.stars.types.white_dwarf"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sirius_A_and_B_artwork.jpg/800px-Sirius_A_and_B_artwork.jpg",
        size: "~" + t("experiments.stars.earth_size"),
        temperature: "8,000-40,000 K",
        mass: "~0.6 × " + t("experiments.stars.sun_mass"),
        age: ">1 " + t("experiments.stars.billion_years"),
        description: t("experiments.stars.white_dwarf.detail"),
        features: [
          t("experiments.stars.white_dwarf.f1"),
          t("experiments.stars.white_dwarf.f2"),
          t("experiments.stars.white_dwarf.f3")
        ]
      },
      {
        name: t("experiments.stars.types.neutron_star"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Artist%27s_impression_of_a_magnetar.jpg/800px-Artist%27s_impression_of_a_magnetar.jpg",
        size: "20-30 km",
        temperature: "600,000 K",
        mass: "1.4 × " + t("experiments.stars.sun_mass"),
        age: t("experiments.stars.varies"),
        description: t("experiments.stars.neutron_star.detail"),
        features: [
          t("experiments.stars.neutron_star.f1"),
          t("experiments.stars.neutron_star.f2"),
          t("experiments.stars.neutron_star.f3")
        ]
      },
      {
        name: t("experiments.stars.types.black_hole"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/800px-Black_hole_-_Messier_87_crop_max_res.jpg",
        size: t("experiments.stars.schwarzschild_radius"),
        temperature: t("experiments.stars.near_zero"),
        mass: ">3 × " + t("experiments.stars.sun_mass"),
        age: t("experiments.stars.varies"),
        description: t("experiments.stars.black_hole.detail"),
        features: [
          t("experiments.stars.black_hole.f1"),
          t("experiments.stars.black_hole.f2"),
          t("experiments.stars.black_hole.f3")
        ]
      }
    ];
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.stars.visualization_title")}</h3>
          <div ref={starsCanvasRef} className="relative w-full h-[400px] bg-gradient-to-b from-black via-purple-950 to-black rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.1} />
              
              {/* Star life cycle visualization */}
              <Star3D 
                type="sun" 
                color="#FFD700" 
                size={0.8} 
                position={[-6, 1, 0]} 
                animate={selectedStar === "sun"}
                isPaused={isPausedStars}
              />
              <Star3D 
                type="red_giant" 
                color="#FF4500" 
                size={1.5} 
                position={[-3, 1, 0]} 
                animate={selectedStar === "red_giant"}
                isPaused={isPausedStars}
              />
              <Star3D 
                type="white_dwarf" 
                color="#FFFFFF" 
                size={0.4} 
                position={[0, 1, 0]} 
                animate={selectedStar === "white_dwarf"}
                isPaused={isPausedStars}
              />
              <Star3D 
                type="neutron_star" 
                color="#00BFFF" 
                size={0.25} 
                position={[3, 1, 0]} 
                animate={selectedStar === "neutron_star"}
                isPaused={isPausedStars}
              />
              <Star3D 
                type="black_hole" 
                color="#000000" 
                size={0.5} 
                position={[6, 1, 0]} 
                animate={selectedStar === "black_hole"}
                isPaused={isPausedStars}
              />
              
              <OrbitControls enableZoom={true} enablePan={true} />
            </Canvas>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">{t("experiments.stars.controls")}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.stars.select")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stars.map((s) => (
              <Button
                key={s.id}
                variant={selectedStar === s.id ? "default" : "outline"}
                onClick={() => setSelectedStar(s.id)}
                className="h-auto py-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs">{t(`experiments.stars.types.${s.id}.name`)}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {star && (
          <Card className="p-6 animate-scale-in">
            <div className="text-center mb-4">
              <span className="text-8xl inline-block animate-pulse">{star.emoji}</span>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">{t(`experiments.stars.types.${star.id}.name`)}</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">{t("experiments.stars.description")}</p>
                <p className="text-sm">{t(`experiments.stars.types.${star.id}.description`)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">{t("experiments.stars.characteristics")}</p>
                <p className="text-sm">{t(`experiments.stars.types.${star.id}.characteristics`)}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-muted">
          <p className="font-semibold">{t("experiments.stars.tip_title")}</p>
          <p className="text-sm">{t("experiments.stars.tip")}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t("experiments.stars.lifecycle_title")}</h3>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>{t("experiments.stars.lifecycle_paragraph_1")}</p>
            <p>{t("experiments.stars.lifecycle_paragraph_2")}</p>
            <p>{t("experiments.stars.lifecycle_paragraph_3")}</p>
          </div>
          <Button 
            onClick={() => {
              setShowStarsQuiz(true);
              setStarsCurrentQuestion(0);
              setStarsScore(0);
              setStarsQuizCompleted(false);
              setStarsSelectedAnswer(null);
              setStarsAnsweredCorrectly(null);
            }} 
            className="mt-6 w-full"
          >
            {t("experiments.stars.start_quiz")}
          </Button>
        </Card>

        {showStarsQuiz && renderStarsQuiz()}
      </div>
    );
  };

  const renderMoonPhases = () => {
    const currentPhase = moonPhases[moonPhase];

    const moonPhasesDetailInfo = [
      {
        name: t("experiments.moon_phases.phases.new_moon"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/New_Moon.jpg/800px-New_Moon.jpg",
        duration: "1 " + t("experiments.moon_phases.day"),
        visibility: t("experiments.moon_phases.not_visible"),
        description: t("experiments.moon_phases.new_moon.detail"),
        features: [
          t("experiments.moon_phases.new_moon.f1"),
          t("experiments.moon_phases.new_moon.f2"),
          t("experiments.moon_phases.new_moon.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.waxing_crescent"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Waxing_Crescent_Moon.jpg/800px-Waxing_Crescent_Moon.jpg",
        duration: "6-7 " + t("experiments.moon_phases.days"),
        visibility: t("experiments.moon_phases.evening"),
        description: t("experiments.moon_phases.waxing_crescent.detail"),
        features: [
          t("experiments.moon_phases.waxing_crescent.f1"),
          t("experiments.moon_phases.waxing_crescent.f2"),
          t("experiments.moon_phases.waxing_crescent.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.first_quarter"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/First_Quarter_Moon_25_Oct_2007.jpg/800px-First_Quarter_Moon_25_Oct_2007.jpg",
        duration: "1 " + t("experiments.moon_phases.day"),
        visibility: t("experiments.moon_phases.afternoon_evening"),
        description: t("experiments.moon_phases.first_quarter.detail"),
        features: [
          t("experiments.moon_phases.first_quarter.f1"),
          t("experiments.moon_phases.first_quarter.f2"),
          t("experiments.moon_phases.first_quarter.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.waxing_gibbous"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Waxing_gibbous_moon.jpg/800px-Waxing_gibbous_moon.jpg",
        duration: "6-7 " + t("experiments.moon_phases.days"),
        visibility: t("experiments.moon_phases.evening_night"),
        description: t("experiments.moon_phases.waxing_gibbous.detail"),
        features: [
          t("experiments.moon_phases.waxing_gibbous.f1"),
          t("experiments.moon_phases.waxing_gibbous.f2"),
          t("experiments.moon_phases.waxing_gibbous.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.full_moon"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Full_Moon_Luc_Viatour.jpg/800px-Full_Moon_Luc_Viatour.jpg",
        duration: "1 " + t("experiments.moon_phases.day"),
        visibility: t("experiments.moon_phases.all_night"),
        description: t("experiments.moon_phases.full_moon.detail"),
        features: [
          t("experiments.moon_phases.full_moon.f1"),
          t("experiments.moon_phases.full_moon.f2"),
          t("experiments.moon_phases.full_moon.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.waning_gibbous"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Waning_gibbous_moon.jpg/800px-Waning_gibbous_moon.jpg",
        duration: "6-7 " + t("experiments.moon_phases.days"),
        visibility: t("experiments.moon_phases.late_night_morning"),
        description: t("experiments.moon_phases.waning_gibbous.detail"),
        features: [
          t("experiments.moon_phases.waning_gibbous.f1"),
          t("experiments.moon_phases.waning_gibbous.f2"),
          t("experiments.moon_phases.waning_gibbous.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.last_quarter"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Last_Quarter_Moon.jpg/800px-Last_Quarter_Moon.jpg",
        duration: "1 " + t("experiments.moon_phases.day"),
        visibility: t("experiments.moon_phases.late_night_morning"),
        description: t("experiments.moon_phases.last_quarter.detail"),
        features: [
          t("experiments.moon_phases.last_quarter.f1"),
          t("experiments.moon_phases.last_quarter.f2"),
          t("experiments.moon_phases.last_quarter.f3")
        ]
      },
      {
        name: t("experiments.moon_phases.phases.waning_crescent"),
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Waning_Crescent_Moon.jpg/800px-Waning_Crescent_Moon.jpg",
        duration: "6-7 " + t("experiments.moon_phases.days"),
        visibility: t("experiments.moon_phases.early_morning"),
        description: t("experiments.moon_phases.waning_crescent.detail"),
        features: [
          t("experiments.moon_phases.waning_crescent.f1"),
          t("experiments.moon_phases.waning_crescent.f2"),
          t("experiments.moon_phases.waning_crescent.f3")
        ]
      }
    ];
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.moon_phases.visualization_title")}</h3>
          <div ref={moonCanvasRef} className="relative w-full h-[400px] bg-gradient-to-b from-black via-blue-950 to-black rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 5, 5]} intensity={1} />
              <MoonPhaseScene currentPhase={moonPhase} isPaused={isPausedMoon} />
              <OrbitControls enableZoom={true} enablePan={true} />
            </Canvas>
            <button
              onClick={toggleFullscreenMoon}
              className="absolute top-4 right-4 p-2 bg-background/80 hover:bg-background rounded-lg backdrop-blur-sm transition-colors"
              title={isFullscreenMoon ? t("experiments.moon_phases.exit_fullscreen") : t("experiments.moon_phases.enter_fullscreen")}
            >
              {isFullscreenMoon ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setIsPausedMoon(!isPausedMoon)}
              variant="outline"
              size="icon"
              title={isPausedMoon ? t("experiments.moon_phases.play") : t("experiments.moon_phases.pause")}
            >
              {isPausedMoon ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.moon_phases.select_phase")}</h3>
          <div className="grid grid-cols-4 gap-3">
            {moonPhases.map((phase) => (
              <Button
                key={phase.phase}
                variant={moonPhase === phase.phase ? "default" : "outline"}
                onClick={() => setMoonPhase(phase.phase)}
                className="h-auto py-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{phase.emoji}</span>
                  <span className="text-[10px]">{t(`experiments.moon_phases.phases.${phase.name}.name`)}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t("experiments.moon_phases.details_title")}</h3>
          <div className="space-y-6">
            {moonPhasesDetailInfo.map((phase, index) => (
              <div key={index} className="border-b border-border last:border-b-0 pb-6 last:pb-0">
                <div className="flex flex-col md:flex-row gap-4">
                  <img 
                    src={phase.imageUrl} 
                    alt={phase.name}
                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                      e.currentTarget.alt = `${phase.name} (image not available)`;
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{phase.name}</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div><strong>{t("experiments.moon_phases.duration")}:</strong> {phase.duration}</div>
                      <div><strong>{t("experiments.moon_phases.visibility")}:</strong> {phase.visibility}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-muted">
          <p className="font-semibold">{t("experiments.moon_phases.tip_title")}</p>
          <p className="text-sm">{t("experiments.moon_phases.tip")}</p>
        </Card>
      </div>
    );
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === quizQuestions[currentQuestion].correct;
    setAnsweredCorrectly(isCorrect);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnsweredCorrectly(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleStarsAnswerSelect = (answerIndex: number) => {
    setStarsSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === starsQuizQuestions[starsCurrentQuestion].correct;
    setStarsAnsweredCorrectly(isCorrect);
    if (isCorrect) {
      setStarsScore(starsScore + 1);
    }
  };

  const handleStarsNextQuestion = () => {
    if (starsCurrentQuestion < starsQuizQuestions.length - 1) {
      setStarsCurrentQuestion(starsCurrentQuestion + 1);
      setStarsSelectedAnswer(null);
      setStarsAnsweredCorrectly(null);
    } else {
      setStarsQuizCompleted(true);
    }
  };

  const renderQuiz = () => {
    if (quizCompleted) {
      return (
        <Card className="p-6 mt-6 animate-scale-in">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{t("experiments.solar_system.quiz_completed")}</h3>
            <div className="text-6xl mb-4">
              {score >= 8 ? "🌟" : score >= 6 ? "⭐" : "🌙"}
            </div>
            <p className="text-xl mb-2">
              {t("experiments.solar_system.your_score")}: {score}/{quizQuestions.length}
            </p>
            <p className="text-muted-foreground mb-6">
              {score >= 8 && t("experiments.solar_system.score_excellent")}
              {score >= 6 && score < 8 && t("experiments.solar_system.score_good")}
              {score < 6 && t("experiments.solar_system.score_try_again")}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => {
                setShowQuiz(false);
                setCurrentQuestion(0);
                setScore(0);
                setQuizCompleted(false);
                setSelectedAnswer(null);
                setAnsweredCorrectly(null);
              }}>
                {t("experiments.solar_system.close_quiz")}
              </Button>
              <Button variant="outline" onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setQuizCompleted(false);
                setSelectedAnswer(null);
                setAnsweredCorrectly(null);
              }}>
                {t("experiments.solar_system.retry_quiz")}
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6 mt-6 animate-scale-in">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              {t("experiments.solar_system.question")} {currentQuestion + 1}/{quizQuestions.length}
            </h3>
            <Badge variant="secondary">
              {t("experiments.solar_system.score_label")}: {score}/{quizQuestions.length}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg font-medium mb-4">{quizQuestions[currentQuestion].question}</p>
          <div className="space-y-3">
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant={
                  selectedAnswer === null 
                    ? "outline" 
                    : selectedAnswer === index 
                      ? answeredCorrectly 
                        ? "default" 
                        : "destructive"
                      : index === quizQuestions[currentQuestion].correct && selectedAnswer !== null
                        ? "default"
                        : "outline"
                }
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </div>

        {selectedAnswer !== null && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${answeredCorrectly ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <p className="font-semibold">
                {answeredCorrectly ? "✅ " + t("experiments.solar_system.correct") : "❌ " + t("experiments.solar_system.incorrect")}
              </p>
            </div>
            <Button onClick={handleNextQuestion} className="w-full">
              {currentQuestion < quizQuestions.length - 1 
                ? t("experiments.solar_system.next_question") 
                : t("experiments.solar_system.finish_quiz")}
            </Button>
          </div>
        )}
      </Card>
    );
  };

  const renderStarsQuiz = () => {
    if (starsQuizCompleted) {
      return (
        <Card className="p-6 mt-6 animate-scale-in">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{t("experiments.stars.quiz_completed")}</h3>
            <div className="text-6xl mb-4">
              {starsScore >= 8 ? "🌟" : starsScore >= 6 ? "⭐" : "🌙"}
            </div>
            <p className="text-xl mb-2">
              {t("experiments.stars.your_score")}: {starsScore}/{starsQuizQuestions.length}
            </p>
            <p className="text-muted-foreground mb-6">
              {starsScore >= 8 && t("experiments.stars.score_excellent")}
              {starsScore >= 6 && starsScore < 8 && t("experiments.stars.score_good")}
              {starsScore < 6 && t("experiments.stars.score_try_again")}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => {
                setShowStarsQuiz(false);
                setStarsCurrentQuestion(0);
                setStarsScore(0);
                setStarsQuizCompleted(false);
                setStarsSelectedAnswer(null);
                setStarsAnsweredCorrectly(null);
              }}>
                {t("experiments.stars.close_quiz")}
              </Button>
              <Button variant="outline" onClick={() => {
                setStarsCurrentQuestion(0);
                setStarsScore(0);
                setStarsQuizCompleted(false);
                setStarsSelectedAnswer(null);
                setStarsAnsweredCorrectly(null);
              }}>
                {t("experiments.stars.retry_quiz")}
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6 mt-6 animate-scale-in">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              {t("experiments.stars.question")} {starsCurrentQuestion + 1}/{starsQuizQuestions.length}
            </h3>
            <Badge variant="secondary">
              {t("experiments.stars.score_label")}: {starsScore}/{starsQuizQuestions.length}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((starsCurrentQuestion + 1) / starsQuizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg font-medium mb-4">{starsQuizQuestions[starsCurrentQuestion].question}</p>
          <div className="space-y-3">
            {starsQuizQuestions[starsCurrentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant={
                  starsSelectedAnswer === null 
                    ? "outline" 
                    : starsSelectedAnswer === index 
                      ? starsAnsweredCorrectly 
                        ? "default" 
                        : "destructive"
                      : index === starsQuizQuestions[starsCurrentQuestion].correct && starsSelectedAnswer !== null
                        ? "default"
                        : "outline"
                }
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => starsSelectedAnswer === null && handleStarsAnswerSelect(index)}
                disabled={starsSelectedAnswer !== null}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </div>

        {starsSelectedAnswer !== null && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${starsAnsweredCorrectly ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <p className="font-semibold">
                {starsAnsweredCorrectly ? "✅ " + t("experiments.stars.correct") : "❌ " + t("experiments.stars.incorrect")}
              </p>
            </div>
            <Button onClick={handleStarsNextQuestion} className="w-full">
              {starsCurrentQuestion < starsQuizQuestions.length - 1 
                ? t("experiments.stars.next_question") 
                : t("experiments.stars.finish_quiz")}
            </Button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => currentExperiment === "menu" ? navigate("/stem") : setCurrentExperiment("menu")}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentExperiment === "menu" ? t("back_to_stem") : t("back")}
          </Button>
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-lg text-white/80">{t("subtitle")}</p>
          {currentExperiment === "menu" && <p className="text-sm text-white/70 mt-2">{t("description")}</p>}
        </div>

        <div className={currentExperiment === "menu" ? "" : "bg-white/5 backdrop-blur-sm rounded-lg p-6"}>
          {currentExperiment === "menu" && renderMenu()}
          {currentExperiment === "solar-system" && renderSolarSystem()}
          {currentExperiment === "planets" && renderPlanets()}
          {currentExperiment === "stars" && renderStars()}
          {currentExperiment === "moon-phases" && renderMoonPhases()}
        </div>
      </div>
    </div>
  );
};

export default AstronomyLabApp;
