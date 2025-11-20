import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Microscope, Heart, Leaf, Fish } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ExperimentType = "menu" | "cell-structure" | "body-systems" | "photosynthesis" | "food-chain";

const BiologyLabApp = () => {
  const { t } = useTranslation("biologylab");
  const navigate = useNavigate();
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentType>("menu");

  // Cell Structure state
  const [selectedCellPart, setSelectedCellPart] = useState<string | null>(null);

  // Body Systems state
  const [selectedSystem, setSelectedSystem] = useState<string>("circulatory");

  // Photosynthesis state
  const [sunlightLevel, setSunlightLevel] = useState(50);
  const [waterLevel, setWaterLevel] = useState(50);
  const [co2Level, setCo2Level] = useState(50);

  // Food Chain state
  const [selectedOrganism, setSelectedOrganism] = useState<string | null>(null);

  const cellParts = [
    { id: "nucleus", position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", size: "w-16 h-16" },
    { id: "mitochondria", position: "top-1/3 left-1/4", size: "w-10 h-10" },
    { id: "ribosome", position: "top-1/4 right-1/4", size: "w-6 h-6" },
    { id: "membrane", position: "inset-0", size: "w-full h-full" },
    { id: "cytoplasm", position: "inset-2", size: "w-[calc(100%-1rem)] h-[calc(100%-1rem)]" },
  ];

  const bodySystems = [
    { id: "circulatory", icon: "❤️", color: "bg-red-500" },
    { id: "respiratory", icon: "🫁", color: "bg-blue-500" },
    { id: "digestive", icon: "🍽️", color: "bg-yellow-500" },
    { id: "nervous", icon: "🧠", color: "bg-purple-500" },
    { id: "skeletal", icon: "🦴", color: "bg-gray-500" },
  ];

  const foodChainOrganisms = [
    { id: "sun", level: 0, icon: "☀️" },
    { id: "plant", level: 1, icon: "🌱" },
    { id: "herbivore", level: 2, icon: "🦌" },
    { id: "carnivore", level: 3, icon: "🦁" },
    { id: "decomposer", level: 4, icon: "🍄" },
  ];

  const calculatePhotosynthesis = () => {
    const efficiency = (sunlightLevel + waterLevel + co2Level) / 3;
    if (efficiency > 70) return "excellent";
    if (efficiency > 40) return "good";
    return "poor";
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("cell-structure")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full">
            <Microscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.cell_structure.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.cell_structure.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("body-systems")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-400 to-pink-400 rounded-full">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.body_systems.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.body_systems.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("photosynthesis")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.photosynthesis.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.photosynthesis.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => setCurrentExperiment("food-chain")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full">
            <Fish className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.food_chain.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.food_chain.description")}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCellStructure = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.cell_structure.click_parts")}</h3>
        
        <div className="relative w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full border-4 border-blue-300">
          {/* Cell Membrane */}
          <div
            className={`absolute ${cellParts[3].position} ${cellParts[3].size} rounded-full border-4 border-blue-400 cursor-pointer hover:border-blue-600 transition-all ${
              selectedCellPart === "membrane" ? "border-blue-700 shadow-lg" : ""
            }`}
            onClick={() => setSelectedCellPart("membrane")}
          />
          
          {/* Cytoplasm */}
          <div
            className={`absolute ${cellParts[4].position} ${cellParts[4].size} rounded-full bg-blue-50/50 cursor-pointer hover:bg-blue-100/70 transition-all ${
              selectedCellPart === "cytoplasm" ? "bg-blue-200/80" : ""
            }`}
            onClick={() => setSelectedCellPart("cytoplasm")}
          />
          
          {/* Nucleus */}
          <div
            className={`absolute ${cellParts[0].position} ${cellParts[0].size} bg-purple-400 rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg animate-pulse ${
              selectedCellPart === "nucleus" ? "scale-125 ring-4 ring-purple-600" : ""
            }`}
            onClick={() => setSelectedCellPart("nucleus")}
          />
          
          {/* Mitochondria */}
          <div
            className={`absolute ${cellParts[1].position} ${cellParts[1].size} bg-orange-400 rounded-lg cursor-pointer hover:scale-110 transition-all shadow-md ${
              selectedCellPart === "mitochondria" ? "scale-125 ring-4 ring-orange-600" : ""
            }`}
            onClick={() => setSelectedCellPart("mitochondria")}
          />
          
          {/* Ribosomes */}
          <div
            className={`absolute ${cellParts[2].position} ${cellParts[2].size} bg-green-400 rounded-full cursor-pointer hover:scale-110 transition-all shadow-sm ${
              selectedCellPart === "ribosome" ? "scale-150 ring-4 ring-green-600" : ""
            }`}
            onClick={() => setSelectedCellPart("ribosome")}
          />
        </div>
      </Card>

      {selectedCellPart && (
        <Card className="p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <Badge className="text-lg">{t(`experiments.cell_structure.parts.${selectedCellPart}.emoji`)}</Badge>
            <div>
              <h4 className="text-xl font-bold mb-2">{t(`experiments.cell_structure.parts.${selectedCellPart}.name`)}</h4>
              <p className="text-muted-foreground">{t(`experiments.cell_structure.parts.${selectedCellPart}.function`)}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-muted">
        <p className="font-semibold">{t("experiments.cell_structure.tip_title")}</p>
        <p className="text-sm">{t("experiments.cell_structure.tip")}</p>
      </Card>
    </div>
  );

  const renderBodySystems = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.body_systems.select_system")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {bodySystems.map((system) => (
            <Button
              key={system.id}
              variant={selectedSystem === system.id ? "default" : "outline"}
              onClick={() => setSelectedSystem(system.id)}
              className="h-auto py-4"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{system.icon}</span>
                <span className="text-xs">{t(`experiments.body_systems.systems.${system.id}.name`)}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6 animate-scale-in">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 ${bodySystems.find(s => s.id === selectedSystem)?.color} rounded-full flex items-center justify-center text-4xl animate-pulse`}>
              {bodySystems.find(s => s.id === selectedSystem)?.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t(`experiments.body_systems.systems.${selectedSystem}.name`)}</h3>
              <p className="text-muted-foreground">{t(`experiments.body_systems.systems.${selectedSystem}.function`)}</p>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold mb-2">{t("experiments.body_systems.organs")}</p>
            <p className="text-sm">{t(`experiments.body_systems.systems.${selectedSystem}.organs`)}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPhotosynthesis = () => {
    const result = calculatePhotosynthesis();
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.photosynthesis.adjust_factors")}</h3>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="text-2xl">☀️</span>
                <span className="font-medium">{t("experiments.photosynthesis.sunlight")}: {sunlightLevel}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sunlightLevel}
                onChange={(e) => setSunlightLevel(Number(e.target.value))}
                className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💧</span>
                <span className="font-medium">{t("experiments.photosynthesis.water")}: {waterLevel}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={waterLevel}
                onChange={(e) => setWaterLevel(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💨</span>
                <span className="font-medium">{t("experiments.photosynthesis.co2")}: {co2Level}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={co2Level}
                onChange={(e) => setCo2Level(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">{t("experiments.photosynthesis.result")}</h3>
          <div className="relative w-full h-48 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-center transition-all duration-500 ${
                result === "excellent" ? "scale-125" : result === "good" ? "scale-110" : "scale-100"
              }`}>
                <div className="text-6xl mb-2">
                  {result === "excellent" ? "🌳" : result === "good" ? "🌿" : "🌱"}
                </div>
                <p className="text-xl font-bold">
                  {t(`experiments.photosynthesis.${result}`)}
                </p>
              </div>
            </div>
            
            {/* Visual representation */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-blue-400 to-green-400" 
                 style={{ width: `${(sunlightLevel + waterLevel + co2Level) / 3}%` }} />
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-semibold">{t("experiments.photosynthesis.tip_title")}</p>
            <p className="text-sm">{t("experiments.photosynthesis.tip")}</p>
          </div>
        </Card>
      </div>
    );
  };

  const renderFoodChain = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.food_chain.click_organisms")}</h3>
        
        <div className="relative py-8">
          {foodChainOrganisms.map((organism, index) => (
            <div key={organism.id} className="mb-6">
              <div
                className={`relative mx-auto w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedOrganism === organism.id
                    ? "scale-125 ring-4 ring-primary shadow-2xl"
                    : "shadow-lg"
                } ${
                  organism.level === 0 ? "bg-yellow-200" :
                  organism.level === 1 ? "bg-green-200" :
                  organism.level === 2 ? "bg-blue-200" :
                  organism.level === 3 ? "bg-red-200" :
                  "bg-brown-200"
                }`}
                onClick={() => setSelectedOrganism(organism.id)}
              >
                <span className="text-5xl animate-pulse">{organism.icon}</span>
              </div>
              
              {index < foodChainOrganisms.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="text-3xl text-primary animate-bounce">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {selectedOrganism && (
        <Card className="p-6 animate-scale-in">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{foodChainOrganisms.find(o => o.id === selectedOrganism)?.icon}</span>
            <div>
              <h4 className="text-xl font-bold mb-2">{t(`experiments.food_chain.organisms.${selectedOrganism}.name`)}</h4>
              <p className="text-muted-foreground mb-2">{t(`experiments.food_chain.organisms.${selectedOrganism}.role`)}</p>
              <Badge>{t(`experiments.food_chain.organisms.${selectedOrganism}.level`)}</Badge>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-muted">
        <p className="font-semibold">{t("experiments.food_chain.tip_title")}</p>
        <p className="text-sm">{t("experiments.food_chain.tip")}</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => currentExperiment === "menu" ? navigate("/stem") : setCurrentExperiment("menu")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentExperiment === "menu" ? t("back_to_stem") : t("back")}
          </Button>
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          {currentExperiment === "menu" && <p className="text-sm text-muted-foreground mt-2">{t("description")}</p>}
        </div>

        {currentExperiment === "menu" && renderMenu()}
        {currentExperiment === "cell-structure" && renderCellStructure()}
        {currentExperiment === "body-systems" && renderBodySystems()}
        {currentExperiment === "photosynthesis" && renderPhotosynthesis()}
        {currentExperiment === "food-chain" && renderFoodChain()}
      </div>
    </div>
  );
};

export default BiologyLabApp;
