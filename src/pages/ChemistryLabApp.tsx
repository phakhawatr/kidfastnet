import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Beaker, Droplet, ThermometerSun, FlaskConical } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type ExperimentType = "menu" | "acid-base" | "solubility" | "ph-scale" | "states-matter";

const ChemistryLabApp = () => {
  const { t } = useTranslation("chemistrylab");
  const navigate = useNavigate();
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentType>("menu");

  // Acid-Base state
  const [selectedSubstance, setSelectedSubstance] = useState("water");
  const [phValue, setPhValue] = useState(7);

  // Solubility state
  const [solute, setSolute] = useState("salt");
  const [soluteAmount, setSoluteAmount] = useState(50);
  const [dissolved, setDissolved] = useState(0);

  // States of Matter state
  const [temperature, setTemperature] = useState(25);
  const [matterState, setMatterState] = useState<"solid" | "liquid" | "gas">("liquid");

  const substances = [
    { id: "lemon", ph: 2, color: "bg-yellow-400" },
    { id: "vinegar", ph: 3, color: "bg-orange-300" },
    { id: "soda", ph: 4, color: "bg-amber-400" },
    { id: "milk", ph: 6.5, color: "bg-slate-100" },
    { id: "water", ph: 7, color: "bg-blue-200" },
    { id: "baking_soda", ph: 9, color: "bg-cyan-300" },
    { id: "soap", ph: 10, color: "bg-purple-300" },
    { id: "bleach", ph: 12, color: "bg-violet-400" },
  ];

  const solutes = [
    { id: "salt", maxSolubility: 100 },
    { id: "sugar", maxSolubility: 200 },
    { id: "sand", maxSolubility: 0 },
    { id: "oil", maxSolubility: 0 },
  ];

  const handleSubstanceSelect = (substance: any) => {
    setSelectedSubstance(substance.id);
    setPhValue(substance.ph);
  };

  const handleDissolve = () => {
    const selectedSolute = solutes.find((s) => s.id === solute);
    if (selectedSolute) {
      const dissolvedAmount = Math.min(soluteAmount, selectedSolute.maxSolubility);
      setDissolved(dissolvedAmount);
    }
  };

  const handleTemperatureChange = (temp: number) => {
    setTemperature(temp);
    if (temp < 0) {
      setMatterState("solid");
    } else if (temp >= 0 && temp < 100) {
      setMatterState("liquid");
    } else {
      setMatterState("gas");
    }
  };

  const getPhColor = (ph: number) => {
    if (ph < 3) return "bg-red-500";
    if (ph < 5) return "bg-orange-500";
    if (ph < 7) return "bg-yellow-500";
    if (ph === 7) return "bg-green-500";
    if (ph < 9) return "bg-cyan-500";
    if (ph < 11) return "bg-blue-500";
    return "bg-purple-500";
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setCurrentExperiment("acid-base")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-400 to-blue-400 rounded-full">
            <Droplet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.acid_base.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.acid_base.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setCurrentExperiment("solubility")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full">
            <Beaker className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.solubility.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.solubility.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setCurrentExperiment("ph-scale")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full">
            <FlaskConical className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.ph_scale.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.ph_scale.description")}</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setCurrentExperiment("states-matter")}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full">
            <ThermometerSun className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("experiments.states_matter.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("experiments.states_matter.description")}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAcidBase = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.acid_base.select_substance")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {substances.map((substance) => (
            <Button
              key={substance.id}
              variant={selectedSubstance === substance.id ? "default" : "outline"}
              onClick={() => handleSubstanceSelect(substance)}
              className="h-auto py-3"
            >
              {t(`experiments.acid_base.substances.${substance.id}`)}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.acid_base.result")}</h3>
        <div className="space-y-4">
          <div className={`w-full h-48 rounded-lg ${getPhColor(phValue)} flex items-center justify-center transition-colors`}>
            <div className="text-center text-white">
              <div className="text-6xl font-bold">pH {phValue}</div>
              <div className="text-xl mt-2">
                {phValue < 7 ? t("experiments.acid_base.acidic") : phValue === 7 ? t("experiments.acid_base.neutral") : t("experiments.acid_base.alkaline")}
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold">{t("experiments.acid_base.tip_title")}</p>
            <p className="text-sm">{t("experiments.acid_base.tip")}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSolubility = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.solubility.select_solute")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {solutes.map((s) => (
            <Button
              key={s.id}
              variant={solute === s.id ? "default" : "outline"}
              onClick={() => setSolute(s.id)}
            >
              {t(`experiments.solubility.solutes.${s.id}`)}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.solubility.amount")}</h3>
        <div className="space-y-4">
          <Slider
            value={[soluteAmount]}
            onValueChange={(v) => setSoluteAmount(v[0])}
            max={200}
            step={10}
            className="w-full"
          />
          <p className="text-center">{soluteAmount}g</p>
          <Button onClick={handleDissolve} className="w-full">
            {t("experiments.solubility.dissolve")}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.solubility.result")}</h3>
        <div className="relative w-full h-64 bg-gradient-to-b from-blue-100 to-blue-300 rounded-lg overflow-hidden">
          <div
            className="absolute bottom-0 w-full bg-blue-400 transition-all duration-1000"
            style={{ height: `${(dissolved / 200) * 100}%` }}
          />
          {dissolved < soluteAmount && (
            <div className="absolute bottom-0 w-full flex justify-center items-end pb-2">
              {Array.from({ length: Math.min(10, soluteAmount - dissolved) }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-600 rounded-full mx-1" />
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            {t("experiments.solubility.dissolved")}: {dissolved}g / {soluteAmount}g
          </p>
          <p className="text-sm mt-2 font-semibold">{t("experiments.solubility.tip_title")}</p>
          <p className="text-sm">{t("experiments.solubility.tip")}</p>
        </div>
      </Card>
    </div>
  );

  const renderPhScale = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.ph_scale.title")}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {[0, 2, 4, 6, 7, 10, 14].map((ph) => (
              <div key={ph} className={`h-16 rounded-lg ${getPhColor(ph)} flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform`}>
                {ph}
              </div>
            ))}
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-semibold text-red-600">{t("experiments.ph_scale.acidic")}</p>
                <p className="text-sm">pH 0-6</p>
              </div>
              <div>
                <p className="font-semibold text-green-600">{t("experiments.ph_scale.neutral")}</p>
                <p className="text-sm">pH 7</p>
              </div>
              <div>
                <p className="font-semibold text-blue-600">{t("experiments.ph_scale.alkaline")}</p>
                <p className="text-sm">pH 8-14</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold">{t("experiments.ph_scale.tip_title")}</p>
              <p className="text-sm">{t("experiments.ph_scale.tip")}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStatesMatter = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.states_matter.temperature")}</h3>
        <div className="space-y-4">
          <Slider
            value={[temperature]}
            onValueChange={(v) => handleTemperatureChange(v[0])}
            min={-50}
            max={150}
            step={5}
            className="w-full"
          />
          <div className="text-center">
            <p className="text-3xl font-bold">{temperature}°C</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("experiments.states_matter.current_state")}</h3>
        <div className="relative w-full h-64 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          {matterState === "solid" && (
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-blue-600 rounded" />
              ))}
            </div>
          )}
          {matterState === "liquid" && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-blue-400 rounded-full" />
                  ))}
                </div>
              ))}
            </div>
          )}
          {matterState === "gas" && (
            <div className="relative w-full h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-blue-200 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold">
            {t(`experiments.states_matter.${matterState}`)}
          </p>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="font-semibold">{t("experiments.states_matter.tip_title")}</p>
          <p className="text-sm">{t("experiments.states_matter.tip")}</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => currentExperiment === "menu" ? navigate("/stem-hub") : setCurrentExperiment("menu")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentExperiment === "menu" ? t("back_to_stem") : t("back")}
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          {currentExperiment === "menu" && <p className="text-sm text-muted-foreground mt-2">{t("description")}</p>}
        </div>

        {currentExperiment === "menu" && renderMenu()}
        {currentExperiment === "acid-base" && renderAcidBase()}
        {currentExperiment === "solubility" && renderSolubility()}
        {currentExperiment === "ph-scale" && renderPhScale()}
        {currentExperiment === "states-matter" && renderStatesMatter()}
      </div>
    </div>
  );
};

export default ChemistryLabApp;
