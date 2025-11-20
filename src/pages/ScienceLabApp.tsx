import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Beaker, Droplets, Thermometer, Sprout, BookOpen, 
  ArrowLeft, Plus, Check, X, Sun, Cloud, CloudRain,
  Lightbulb, TestTube
} from 'lucide-react';
import { toast } from 'sonner';

type ExperimentType = 'menu' | 'color-mixing' | 'temperature' | 'plant-growth' | 'log';

interface ColorMix {
  red: number;
  blue: number;
  yellow: number;
}

interface ExperimentLog {
  id: string;
  type: string;
  title: string;
  result: string;
  timestamp: Date;
}

const ScienceLabApp = () => {
  const { t } = useTranslation('sciencelab');
  const navigate = useNavigate();

  const [experimentType, setExperimentType] = useState<ExperimentType>('menu');
  const [colorMix, setColorMix] = useState<ColorMix>({ red: 0, blue: 0, yellow: 0 });
  const [temperature, setTemperature] = useState(25);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [plantDay, setPlantDay] = useState(0);
  const [waterLevel, setWaterLevel] = useState(50);
  const [sunlight, setSunlight] = useState<'low' | 'medium' | 'high'>('medium');
  const [experimentLogs, setExperimentLogs] = useState<ExperimentLog[]>([]);

  // Color mixing calculation
  const getMixedColor = (): string => {
    const { red, blue, yellow } = colorMix;
    
    if (red === 0 && blue === 0 && yellow === 0) return '#FFFFFF';
    
    // RGB mixing approximation
    let r = red * 255 / 100;
    let g = yellow * 255 / 100;
    let b = blue * 255 / 100;
    
    // Color combination rules
    if (red > 0 && yellow > 0 && blue === 0) {
      // Red + Yellow = Orange
      r = Math.min(255, red * 2.55 + yellow * 1.5);
      g = Math.min(255, yellow * 2.55);
      b = 0;
    } else if (red > 0 && blue > 0 && yellow === 0) {
      // Red + Blue = Purple
      r = Math.min(255, red * 2.55);
      g = 0;
      b = Math.min(255, blue * 2.55);
    } else if (blue > 0 && yellow > 0 && red === 0) {
      // Blue + Yellow = Green
      r = 0;
      g = Math.min(255, yellow * 2.55);
      b = Math.min(255, blue * 2.55);
    }
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  const getColorName = (): string => {
    const { red, blue, yellow } = colorMix;
    
    if (red === 0 && blue === 0 && yellow === 0) return t('colors.white');
    
    if (red > 60 && blue < 20 && yellow < 20) return t('colors.red');
    if (blue > 60 && red < 20 && yellow < 20) return t('colors.blue');
    if (yellow > 60 && red < 20 && blue < 20) return t('colors.yellow');
    
    if (red > 30 && yellow > 30 && blue < 20) return t('colors.orange');
    if (red > 30 && blue > 30 && yellow < 20) return t('colors.purple');
    if (blue > 30 && yellow > 30 && red < 20) return t('colors.green');
    
    if (red > 20 && blue > 20 && yellow > 20) return t('colors.brown');
    
    return t('colors.mixed');
  };

  // Temperature items
  const temperatureItems = [
    { name: 'ice', temp: 0, icon: '🧊' },
    { name: 'cold_water', temp: 10, icon: '💧' },
    { name: 'room_temp', temp: 25, icon: '🏠' },
    { name: 'warm_water', temp: 40, icon: '☕' },
    { name: 'hot_water', temp: 80, icon: '♨️' },
    { name: 'boiling_water', temp: 100, icon: '💨' }
  ];

  // Plant growth calculation
  const getPlantHeight = (): number => {
    let baseGrowth = plantDay * 2;
    
    // Water effect
    if (waterLevel < 30) baseGrowth *= 0.5;
    else if (waterLevel > 70) baseGrowth *= 0.8;
    
    // Sunlight effect
    if (sunlight === 'low') baseGrowth *= 0.6;
    else if (sunlight === 'high') baseGrowth *= 1.2;
    
    return Math.min(100, baseGrowth);
  };

  const getPlantEmoji = (): string => {
    const height = getPlantHeight();
    if (height === 0) return '🌱';
    if (height < 20) return '🌱';
    if (height < 40) return '🌿';
    if (height < 60) return '🪴';
    if (height < 80) return '🌳';
    return '🌲';
  };

  // Save experiment to log
  const saveExperiment = (type: string, title: string, result: string) => {
    const newLog: ExperimentLog = {
      id: Date.now().toString(),
      type,
      title,
      result,
      timestamp: new Date()
    };
    setExperimentLogs([newLog, ...experimentLogs]);
    toast.success(t('log.saved'));
  };

  const renderMenu = () => {
    const experiments = [
      {
        id: 'color-mixing',
        icon: Droplets,
        color: 'from-pink-500 to-rose-600',
        emoji: '🎨',
        title: t('experiments.color_mixing.title'),
        description: t('experiments.color_mixing.description')
      },
      {
        id: 'temperature',
        icon: Thermometer,
        color: 'from-red-500 to-orange-600',
        emoji: '🌡️',
        title: t('experiments.temperature.title'),
        description: t('experiments.temperature.description')
      },
      {
        id: 'plant-growth',
        icon: Sprout,
        color: 'from-green-500 to-emerald-600',
        emoji: '🌱',
        title: t('experiments.plant_growth.title'),
        description: t('experiments.plant_growth.description')
      }
    ];

    return (
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Beaker className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
          </div>
          <p className="text-xl text-white/90 mb-2">{t('subtitle')}</p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        {/* Experiments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {experiments.map((exp) => {
            const Icon = exp.icon;
            return (
              <Card
                key={exp.id}
                className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 cursor-pointer"
                onClick={() => setExperimentType(exp.id as ExperimentType)}
              >
                <CardHeader>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${exp.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <span className="text-4xl">{exp.emoji}</span>
                  </div>
                  <CardTitle className="text-center text-white text-xl">
                    {exp.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80 text-sm mb-4">{exp.description}</p>
                  <Button className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {t('start_experiment')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Experiment Log Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setExperimentType('log')}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t('view_log')} ({experimentLogs.length})
          </Button>
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate('/stem')}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('back_to_stem')}
          </Button>
        </div>
      </div>
    );
  };

  const renderColorMixing = () => {
    const mixedColor = getMixedColor();
    const colorName = getColorName();

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <Droplets className="w-6 h-6" />
              {t('experiments.color_mixing.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Result Display */}
            <div className="mb-6">
              <div 
                className="w-full h-48 rounded-lg border-4 border-white/30 shadow-lg mb-4 transition-colors duration-300"
                style={{ backgroundColor: mixedColor }}
              />
              <p className="text-center text-white text-xl font-bold">{colorName}</p>
            </div>

            {/* Color Sliders */}
            <div className="space-y-6 mb-6">
              {/* Red */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{t('experiments.color_mixing.red')}</span>
                  <span className="text-white">{colorMix.red}%</span>
                </div>
                <Slider
                  value={[colorMix.red]}
                  onValueChange={(value) => setColorMix({ ...colorMix, red: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="h-2 bg-gradient-to-r from-white to-red-600 rounded mt-2" />
              </div>

              {/* Blue */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{t('experiments.color_mixing.blue')}</span>
                  <span className="text-white">{colorMix.blue}%</span>
                </div>
                <Slider
                  value={[colorMix.blue]}
                  onValueChange={(value) => setColorMix({ ...colorMix, blue: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="h-2 bg-gradient-to-r from-white to-blue-600 rounded mt-2" />
              </div>

              {/* Yellow */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{t('experiments.color_mixing.yellow')}</span>
                  <span className="text-white">{colorMix.yellow}%</span>
                </div>
                <Slider
                  value={[colorMix.yellow]}
                  onValueChange={(value) => setColorMix({ ...colorMix, yellow: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="h-2 bg-gradient-to-r from-white to-yellow-400 rounded mt-2" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => setColorMix({ red: 0, blue: 0, yellow: 0 })}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('reset')}
              </Button>
              <Button
                onClick={() => {
                  saveExperiment(
                    t('experiments.color_mixing.title'),
                    t('experiments.color_mixing.title'),
                    `${t('experiments.color_mixing.result')}: ${colorName} (R:${colorMix.red}%, B:${colorMix.blue}%, Y:${colorMix.yellow}%)`
                  );
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {t('save_result')}
              </Button>
            </div>
            
            <Button
              onClick={() => setExperimentType('menu')}
              variant="outline"
              className="w-full mt-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/20 backdrop-blur-md border-blue-400/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="text-white text-sm">
                <p className="font-semibold mb-1">{t('experiments.color_mixing.tip_title')}</p>
                <p className="text-white/80">{t('experiments.color_mixing.tip')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTemperature = () => {
    const getTempDescription = (temp: number): string => {
      if (temp <= 0) return t('experiments.temperature.freezing');
      if (temp < 20) return t('experiments.temperature.cold');
      if (temp < 30) return t('experiments.temperature.cool');
      if (temp < 50) return t('experiments.temperature.warm');
      if (temp < 80) return t('experiments.temperature.hot');
      return t('experiments.temperature.very_hot');
    };

    const getTempColor = (temp: number): string => {
      if (temp <= 0) return 'from-blue-600 to-cyan-600';
      if (temp < 20) return 'from-blue-500 to-blue-600';
      if (temp < 30) return 'from-green-500 to-blue-500';
      if (temp < 50) return 'from-yellow-500 to-orange-500';
      if (temp < 80) return 'from-orange-500 to-red-500';
      return 'from-red-600 to-pink-600';
    };

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <Thermometer className="w-6 h-6" />
              {t('experiments.temperature.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Thermometer Display */}
            <div className="mb-6">
              <div className={`w-full h-48 rounded-lg bg-gradient-to-t ${getTempColor(temperature)} border-4 border-white/30 shadow-lg mb-4 flex items-center justify-center`}>
                <div className="text-center">
                  <p className="text-6xl font-bold text-white mb-2">{temperature}°C</p>
                  <p className="text-xl text-white/90">{getTempDescription(temperature)}</p>
                </div>
              </div>
            </div>

            {/* Temperature Items */}
            <div className="mb-6">
              <p className="text-white font-semibold mb-3 text-center">{t('experiments.temperature.select_item')}</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {temperatureItems.map((item) => (
                  <Button
                    key={item.name}
                    onClick={() => {
                      setTemperature(item.temp);
                      setSelectedItem(item.name);
                    }}
                    variant="outline"
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      selectedItem === item.name
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs">{t(`experiments.temperature.items.${item.name}`)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setTemperature(25);
                  setSelectedItem('');
                }}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('reset')}
              </Button>
              <Button
                onClick={() => {
                  if (selectedItem) {
                    saveExperiment(
                      t('experiments.temperature.title'),
                      t('experiments.temperature.title'),
                      `${t(`experiments.temperature.items.${selectedItem}`)}: ${temperature}°C (${getTempDescription(temperature)})`
                    );
                  }
                }}
                disabled={!selectedItem}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {t('save_result')}
              </Button>
            </div>

            <Button
              onClick={() => setExperimentType('menu')}
              variant="outline"
              className="w-full mt-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/20 backdrop-blur-md border-blue-400/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="text-white text-sm">
                <p className="font-semibold mb-1">{t('experiments.temperature.tip_title')}</p>
                <p className="text-white/80">{t('experiments.temperature.tip')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPlantGrowth = () => {
    const plantHeight = getPlantHeight();
    const plantEmoji = getPlantEmoji();

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <Sprout className="w-6 h-6" />
              {t('experiments.plant_growth.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Plant Display */}
            <div className="mb-6">
              <div className="relative w-full h-64 bg-gradient-to-b from-sky-400 to-green-300 rounded-lg border-4 border-white/30 shadow-lg overflow-hidden">
                {/* Sun */}
                <Sun className={`absolute top-4 right-4 w-12 h-12 text-yellow-300 ${
                  sunlight === 'high' ? 'opacity-100' : sunlight === 'medium' ? 'opacity-60' : 'opacity-30'
                }`} />
                
                {/* Plant */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <div className="text-8xl mb-2">{plantEmoji}</div>
                  <div className="w-32 h-8 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-full" />
                </div>
                
                {/* Growth Bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/20 rounded-full p-1">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${plantHeight}%` }}
                    />
                  </div>
                  <p className="text-white text-center mt-1 text-sm">{t('experiments.plant_growth.height')}: {plantHeight.toFixed(0)}%</p>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-white text-lg">
                  {t('experiments.plant_growth.day')}: <span className="font-bold">{plantDay}</span>
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 mb-6">
              {/* Time Control */}
              <div>
                <p className="text-white font-semibold mb-3">{t('experiments.plant_growth.time_control')}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setPlantDay(Math.max(0, plantDay - 1))}
                    variant="outline"
                    className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    -1 {t('experiments.plant_growth.day')}
                  </Button>
                  <Button
                    onClick={() => setPlantDay(plantDay + 1)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    +1 {t('experiments.plant_growth.day')}
                  </Button>
                  <Button
                    onClick={() => setPlantDay(plantDay + 7)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    +7 {t('experiments.plant_growth.days')}
                  </Button>
                </div>
              </div>

              {/* Water Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{t('experiments.plant_growth.water')}</span>
                  <span className="text-white">{waterLevel}%</span>
                </div>
                <Slider
                  value={[waterLevel]}
                  onValueChange={(value) => setWaterLevel(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-white/70 text-xs mt-1">
                  <span>{t('experiments.plant_growth.dry')}</span>
                  <span>{t('experiments.plant_growth.wet')}</span>
                </div>
              </div>

              {/* Sunlight */}
              <div>
                <p className="text-white font-semibold mb-3">{t('experiments.plant_growth.sunlight')}</p>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => setSunlight('low')}
                    variant="outline"
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      sunlight === 'low'
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                  >
                    <Cloud className="w-6 h-6" />
                    <span className="text-sm">{t('experiments.plant_growth.low')}</span>
                  </Button>
                  <Button
                    onClick={() => setSunlight('medium')}
                    variant="outline"
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      sunlight === 'medium'
                        ? 'bg-yellow-500 text-white border-yellow-400'
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                  >
                    <CloudRain className="w-6 h-6" />
                    <span className="text-sm">{t('experiments.plant_growth.medium')}</span>
                  </Button>
                  <Button
                    onClick={() => setSunlight('high')}
                    variant="outline"
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      sunlight === 'high'
                        ? 'bg-orange-500 text-white border-orange-400'
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="text-sm">{t('experiments.plant_growth.high')}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setPlantDay(0);
                  setWaterLevel(50);
                  setSunlight('medium');
                }}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('reset')}
              </Button>
              <Button
                onClick={() => {
                  saveExperiment(
                    t('experiments.plant_growth.title'),
                    t('experiments.plant_growth.title'),
                    `${t('experiments.plant_growth.result')}: ${plantHeight.toFixed(0)}% (${plantDay} ${t('experiments.plant_growth.days')}, ${t('experiments.plant_growth.water')}: ${waterLevel}%, ${t('experiments.plant_growth.sunlight')}: ${t(`experiments.plant_growth.${sunlight}`)})`
                  );
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {t('save_result')}
              </Button>
            </div>

            <Button
              onClick={() => setExperimentType('menu')}
              variant="outline"
              className="w-full mt-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/20 backdrop-blur-md border-blue-400/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="text-white text-sm">
                <p className="font-semibold mb-1">{t('experiments.plant_growth.tip_title')}</p>
                <p className="text-white/80">{t('experiments.plant_growth.tip')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLog = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6" />
              {t('log.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {experimentLogs.length === 0 ? (
              <div className="text-center py-12">
                <Beaker className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">{t('log.empty')}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {experimentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white/10 rounded-lg p-4 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold">{log.title}</h3>
                      </div>
                      <span className="text-white/70 text-xs">
                        {new Date(log.timestamp).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{log.result}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => setExperimentLogs([])}
                disabled={experimentLogs.length === 0}
                variant="outline"
                className="flex-1 bg-red-500/20 text-white border-red-400/30 hover:bg-red-500/30"
              >
                <X className="w-4 h-4 mr-2" />
                {t('log.clear')}
              </Button>
              <Button
                onClick={() => setExperimentType('menu')}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-green-600 to-blue-500">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {experimentType === 'menu' && renderMenu()}
        {experimentType === 'color-mixing' && renderColorMixing()}
        {experimentType === 'temperature' && renderTemperature()}
        {experimentType === 'plant-growth' && renderPlantGrowth()}
        {experimentType === 'log' && renderLog()}
      </main>

      <Footer />
    </div>
  );
};

export default ScienceLabApp;
