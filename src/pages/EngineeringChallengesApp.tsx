import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Hammer, Building, Car, BookOpen, 
  ArrowLeft, Check, X, AlertTriangle,
  Lightbulb, CheckCircle2, Trophy
} from 'lucide-react';
import { toast } from 'sonner';

type ChallengeType = 'menu' | 'bridge' | 'tower' | 'vehicle' | 'designs';
type Material = 'wood' | 'steel' | 'concrete';

interface MaterialProperties {
  name: string;
  cost: number;
  strength: number;
  weight: number;
  icon: string;
}

interface Design {
  id: string;
  type: string;
  title: string;
  material: Material;
  size: number;
  parts: number;
  totalCost: number;
  maxLoad: number;
  testResult?: {
    load: number;
    success: boolean;
  };
  timestamp: Date;
}

const EngineeringChallengesApp = () => {
  const { t } = useTranslation('engineering');
  const navigate = useNavigate();

  const [challengeType, setChallengeType] = useState<ChallengeType>('menu');
  const [selectedMaterial, setSelectedMaterial] = useState<Material>('wood');
  const [size, setSize] = useState(5);
  const [parts, setParts] = useState(10);
  const [testLoad, setTestLoad] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ load: number; success: boolean } | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);

  const materials: Record<Material, MaterialProperties> = {
    wood: {
      name: t('materials.wood'),
      cost: 10,
      strength: 50,
      weight: 5,
      icon: '🪵'
    },
    steel: {
      name: t('materials.steel'),
      cost: 50,
      strength: 200,
      weight: 20,
      icon: '⚙️'
    },
    concrete: {
      name: t('materials.concrete'),
      cost: 30,
      strength: 150,
      weight: 30,
      icon: '🧱'
    }
  };

  // Calculate total cost
  const calculateCost = (): number => {
    const material = materials[selectedMaterial];
    return material.cost * parts;
  };

  // Calculate maximum load capacity
  const calculateMaxLoad = (type: 'bridge' | 'tower' | 'vehicle'): number => {
    const material = materials[selectedMaterial];
    let baseStrength = material.strength * parts;
    
    // Type-specific multipliers
    if (type === 'bridge') {
      // Longer bridges are weaker
      baseStrength *= (10 / size);
    } else if (type === 'tower') {
      // Taller towers are less stable
      baseStrength *= (15 / size);
    } else if (type === 'vehicle') {
      // More parts = stronger vehicle
      baseStrength *= (parts / 10);
    }
    
    // Weight penalty
    const totalWeight = material.weight * parts;
    baseStrength -= totalWeight * 2;
    
    return Math.max(0, Math.round(baseStrength));
  };

  // Test structure strength
  const testStructure = () => {
    setIsTesting(true);
    const maxLoad = calculateMaxLoad(challengeType as 'bridge' | 'tower' | 'vehicle');
    
    setTimeout(() => {
      const success = testLoad <= maxLoad;
      setTestResult({ load: testLoad, success });
      setIsTesting(false);
      
      if (success) {
        toast.success(t('test.success'));
      } else {
        toast.error(t('test.fail'));
      }
    }, 1500);
  };

  // Save design
  const saveDesign = () => {
    const maxLoad = calculateMaxLoad(challengeType as 'bridge' | 'tower' | 'vehicle');
    const newDesign: Design = {
      id: Date.now().toString(),
      type: challengeType,
      title: t(`challenges.${challengeType}.title`),
      material: selectedMaterial,
      size,
      parts,
      totalCost: calculateCost(),
      maxLoad,
      testResult: testResult || undefined,
      timestamp: new Date()
    };
    
    setDesigns([newDesign, ...designs]);
    toast.success(t('designs.saved'));
  };

  // Reset current design
  const resetDesign = () => {
    setSelectedMaterial('wood');
    setSize(5);
    setParts(10);
    setTestLoad(0);
    setTestResult(null);
  };

  const renderMenu = () => {
    const challenges = [
      {
        id: 'bridge',
        icon: Building,
        color: 'from-blue-500 to-cyan-600',
        emoji: '🌉',
        title: t('challenges.bridge.title'),
        description: t('challenges.bridge.description')
      },
      {
        id: 'tower',
        icon: Building,
        color: 'from-purple-500 to-pink-600',
        emoji: '🗼',
        title: t('challenges.tower.title'),
        description: t('challenges.tower.description')
      },
      {
        id: 'vehicle',
        icon: Car,
        color: 'from-orange-500 to-red-600',
        emoji: '🚗',
        title: t('challenges.vehicle.title'),
        description: t('challenges.vehicle.description')
      }
    ];

    return (
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Hammer className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
          </div>
          <p className="text-xl text-white/90 mb-2">{t('subtitle')}</p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        {/* Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {challenges.map((challenge) => {
            const Icon = challenge.icon;
            return (
              <Card
                key={challenge.id}
                className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 cursor-pointer"
                onClick={() => {
                  resetDesign();
                  setChallengeType(challenge.id as ChallengeType);
                }}
              >
                <CardHeader>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${challenge.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <span className="text-4xl">{challenge.emoji}</span>
                  </div>
                  <CardTitle className="text-center text-white text-xl">
                    {challenge.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80 text-sm mb-4">{challenge.description}</p>
                  <Button className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {t('start_design')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* My Designs Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setChallengeType('designs')}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t('view_designs')} ({designs.length})
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

  const renderChallenge = () => {
    const type = challengeType as 'bridge' | 'tower' | 'vehicle';
    const maxLoad = calculateMaxLoad(type);
    const totalCost = calculateCost();

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <Hammer className="w-6 h-6" />
              {t(`challenges.${type}.title`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Visualization */}
            <div className="mb-6">
              <div className="relative w-full h-48 bg-gradient-to-b from-sky-300 to-green-200 rounded-lg border-4 border-white/30 shadow-lg overflow-hidden">
                {type === 'bridge' && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center items-end">
                    <div className="w-16 h-20 bg-gradient-to-b from-amber-700 to-amber-900" />
                    <div 
                      className={`h-4 bg-gradient-to-r ${
                        selectedMaterial === 'wood' ? 'from-amber-600 to-amber-700' :
                        selectedMaterial === 'steel' ? 'from-gray-400 to-gray-600' :
                        'from-gray-500 to-gray-700'
                      } relative`}
                      style={{ width: `${size * 20}px` }}
                    >
                      {testResult && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          {testResult.success ? (
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          ) : (
                            <X className="w-8 h-8 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-16 h-20 bg-gradient-to-b from-amber-700 to-amber-900" />
                  </div>
                )}
                
                {type === 'tower' && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div 
                      className={`w-16 bg-gradient-to-t ${
                        selectedMaterial === 'wood' ? 'from-amber-600 to-amber-400' :
                        selectedMaterial === 'steel' ? 'from-gray-400 to-gray-300' :
                        'from-gray-500 to-gray-400'
                      } rounded-t-lg relative`}
                      style={{ height: `${size * 15}px` }}
                    >
                      {testResult && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                          {testResult.success ? (
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          ) : (
                            <X className="w-8 h-8 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-24 h-6 bg-gradient-to-b from-gray-600 to-gray-800" />
                  </div>
                )}
                
                {type === 'vehicle' && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <div 
                        className={`w-32 h-16 rounded-lg bg-gradient-to-r ${
                          selectedMaterial === 'wood' ? 'from-amber-600 to-amber-700' :
                          selectedMaterial === 'steel' ? 'from-gray-400 to-gray-600' :
                          'from-gray-500 to-gray-700'
                        }`}
                      >
                        {testResult && (
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                            {testResult.success ? (
                              <CheckCircle2 className="w-8 h-8 text-green-400" />
                            ) : (
                              <X className="w-8 h-8 text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between absolute -bottom-4 left-2 right-2">
                        <div className="w-8 h-8 rounded-full bg-gray-900" />
                        <div className="w-8 h-8 rounded-full bg-gray-900" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Material Selection */}
            <div className="mb-6">
              <p className="text-white font-semibold mb-3">{t('select_material')}</p>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(materials) as Material[]).map((mat) => {
                  const material = materials[mat];
                  return (
                    <Button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      variant="outline"
                      className={`h-auto py-4 flex flex-col gap-2 ${
                        selectedMaterial === mat
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                      }`}
                    >
                      <span className="text-3xl">{material.icon}</span>
                      <span className="text-sm font-semibold">{material.name}</span>
                      <div className="text-xs text-white/80">
                        <div>{t('cost')}: {material.cost}฿</div>
                        <div>{t('strength')}: {material.strength}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Size Control */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">
                  {type === 'bridge' ? t('length') : type === 'tower' ? t('height') : t('size')}
                </span>
                <span className="text-white">{size} {t('units')}</span>
              </div>
              <Slider
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
                min={3}
                max={type === 'tower' ? 15 : 10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Parts Control */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{t('parts')}</span>
                <span className="text-white">{parts} {t('pieces')}</span>
              </div>
              <Slider
                value={[parts]}
                onValueChange={(value) => setParts(value[0])}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">{t('total_cost')}</p>
                <p className="text-white text-2xl font-bold">{totalCost} ฿</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">{t('max_load')}</p>
                <p className="text-white text-2xl font-bold">{maxLoad} kg</p>
              </div>
            </div>

            {/* Test Section */}
            <Card className="bg-yellow-500/20 backdrop-blur-md border-yellow-400/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t('test.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">{t('test.load')}</span>
                    <span className="text-white">{testLoad} kg</span>
                  </div>
                  <Slider
                    value={[testLoad]}
                    onValueChange={(value) => setTestLoad(value[0])}
                    max={maxLoad + 100}
                    step={10}
                    className="w-full"
                  />
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    testResult.success 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-red-500/20 border border-red-400/30'
                  }`}>
                    <div className="flex items-center gap-2 text-white">
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span>{t('test.pass')}</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-400" />
                          <span>{t('test.collapse')}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={testStructure}
                  disabled={isTesting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isTesting ? t('test.testing') : t('test.run')}
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={resetDesign}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('reset')}
              </Button>
              <Button
                onClick={saveDesign}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {t('save_design')}
              </Button>
            </div>

            <Button
              onClick={() => setChallengeType('menu')}
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
                <p className="font-semibold mb-1">{t('tips.title')}</p>
                <ul className="text-white/80 space-y-1 list-disc list-inside">
                  <li>{t('tips.tip1')}</li>
                  <li>{t('tips.tip2')}</li>
                  <li>{t('tips.tip3')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDesigns = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6" />
              {t('designs.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {designs.length === 0 ? (
              <div className="text-center py-12">
                <Hammer className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">{t('designs.empty')}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="bg-white/10 rounded-lg p-4 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{design.title}</h3>
                        <p className="text-white/70 text-xs">
                          {new Date(design.timestamp).toLocaleString('th-TH')}
                        </p>
                      </div>
                      {design.testResult && (
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          design.testResult.success 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {design.testResult.success ? (
                            <span className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {t('designs.tested_success')}
                            </span>
                          ) : (
                            t('designs.tested_fail')
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white/70 text-xs">{t('material')}</p>
                        <p className="text-white font-semibold">{materials[design.material].name}</p>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white/70 text-xs">{t('parts')}</p>
                        <p className="text-white font-semibold">{design.parts} {t('pieces')}</p>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white/70 text-xs">{t('total_cost')}</p>
                        <p className="text-white font-semibold">{design.totalCost} ฿</p>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white/70 text-xs">{t('max_load')}</p>
                        <p className="text-white font-semibold">{design.maxLoad} kg</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => setDesigns([])}
                disabled={designs.length === 0}
                variant="outline"
                className="flex-1 bg-red-500/20 text-white border-red-400/30 hover:bg-red-500/30"
              >
                <X className="w-4 h-4 mr-2" />
                {t('designs.clear')}
              </Button>
              <Button
                onClick={() => setChallengeType('menu')}
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
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-pink-500">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {challengeType === 'menu' && renderMenu()}
        {(challengeType === 'bridge' || challengeType === 'tower' || challengeType === 'vehicle') && renderChallenge()}
        {challengeType === 'designs' && renderDesigns()}
      </main>

      <Footer />
    </div>
  );
};

export default EngineeringChallengesApp;
