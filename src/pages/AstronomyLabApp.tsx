import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon, Star, Orbit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";

type ExperimentType = "menu" | "solar-system" | "planets" | "stars" | "moon-phases";

// Planet component for 3D solar system
function Planet({ 
  radius, 
  distance, 
  color, 
  speed, 
  name 
}: { 
  radius: number; 
  distance: number; 
  color: string; 
  speed: number; 
  name: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.position.x = Math.cos(time * speed) * distance;
      meshRef.current.position.z = Math.sin(time * speed) * distance;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
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
      <meshBasicMaterial color="#FDB813" />
      <pointLight intensity={2} distance={50} />
    </mesh>
  );
}

const AstronomyLabApp = () => {
  const { t } = useTranslation("astronomylab");
  const navigate = useNavigate();
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentType>("menu");
  const [selectedPlanet, setSelectedPlanet] = useState<string>("earth");
  const [selectedStar, setSelectedStar] = useState<string>("sun");
  const [moonPhase, setMoonPhase] = useState(0);

  const planets = [
    { id: "mercury", name: t("experiments.planets.list.mercury"), size: "small", distance: "57.9", color: "#8C7853", emoji: "☿️" },
    { id: "venus", name: t("experiments.planets.list.venus"), size: "small", distance: "108.2", color: "#FFC649", emoji: "♀️" },
    { id: "earth", name: t("experiments.planets.list.earth"), size: "medium", distance: "149.6", color: "#4A90E2", emoji: "🌍" },
    { id: "mars", name: t("experiments.planets.list.mars"), size: "small", distance: "227.9", color: "#E27B58", emoji: "♂️" },
    { id: "jupiter", name: t("experiments.planets.list.jupiter"), size: "large", distance: "778.5", color: "#C88B3A", emoji: "♃" },
    { id: "saturn", name: t("experiments.planets.list.saturn"), size: "large", distance: "1434", color: "#FAD5A5", emoji: "♄" },
    { id: "uranus", name: t("experiments.planets.list.uranus"), size: "medium", distance: "2871", color: "#4FD0E7", emoji: "♅" },
    { id: "neptune", name: t("experiments.planets.list.neptune"), size: "medium", distance: "4495", color: "#4166F5", emoji: "♆" },
  ];

  const stars = [
    { id: "sun", type: "yellow_dwarf", emoji: "☀️" },
    { id: "red_giant", type: "red_giant", emoji: "🔴" },
    { id: "white_dwarf", type: "white_dwarf", emoji: "⚪" },
    { id: "neutron_star", type: "neutron_star", emoji: "💫" },
    { id: "black_hole", type: "black_hole", emoji: "⚫" },
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
        <div className="w-full h-[500px] bg-gradient-to-b from-black to-indigo-950 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} />
            
            {/* Sun */}
            <SunSphere />
            
            {/* Planets */}
            <Planet radius={0.2} distance={3} color="#8C7853" speed={0.4} name="Mercury" />
            <Planet radius={0.3} distance={4.5} color="#FFC649" speed={0.3} name="Venus" />
            <Planet radius={0.35} distance={6} color="#4A90E2" speed={0.25} name="Earth" />
            <Planet radius={0.25} distance={7.5} color="#E27B58" speed={0.2} name="Mars" />
            <Planet radius={0.8} distance={10} color="#C88B3A" speed={0.1} name="Jupiter" />
            <Planet radius={0.7} distance={13} color="#FAD5A5" speed={0.08} name="Saturn" />
            <Planet radius={0.5} distance={16} color="#4FD0E7" speed={0.06} name="Uranus" />
            <Planet radius={0.48} distance={18} color="#4166F5" speed={0.05} name="Neptune" />
            
            <OrbitControls enableZoom={true} enablePan={true} />
          </Canvas>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">{t("experiments.solar_system.controls")}</p>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <p className="font-semibold">{t("experiments.solar_system.tip_title")}</p>
        <p className="text-sm">{t("experiments.solar_system.tip")}</p>
      </Card>
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
    
    return (
      <div className="space-y-6">
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
          <Card className="p-6 animate-fade-in">
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
      </div>
    );
  };

  const renderMoonPhases = () => {
    const currentPhase = moonPhases[moonPhase];
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.moon_phases.title")}</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="text-9xl animate-pulse">
              {currentPhase.emoji}
            </div>
          </div>
          <div className="text-center mb-4">
            <h4 className="text-xl font-bold">{t(`experiments.moon_phases.phases.${currentPhase.name}.name`)}</h4>
            <p className="text-sm text-muted-foreground mt-2">
              {t(`experiments.moon_phases.phases.${currentPhase.name}.description`)}
            </p>
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

        <Card className="p-6 bg-muted">
          <p className="font-semibold">{t("experiments.moon_phases.tip_title")}</p>
          <p className="text-sm">{t("experiments.moon_phases.tip")}</p>
        </Card>
      </div>
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
