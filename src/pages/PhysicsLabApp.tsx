import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Zap, Lightbulb as LightbulbIcon, Volume2, Magnet, ArrowDown,
  BookOpen, ArrowLeft, Play, Pause, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

type ExperimentType = 'menu' | 'gravity' | 'magnetism' | 'electricity' | 'light' | 'sound';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const PhysicsLabApp = () => {
  const { t } = useTranslation('physicslab');
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [experimentType, setExperimentType] = useState<ExperimentType>('menu');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Gravity
  const [gravity, setGravity] = useState(9.8);
  const [ballHeight, setBallHeight] = useState(0);
  const [ballSpeed, setBallSpeed] = useState(0);
  
  // Magnetism
  const [magnetStrength, setMagnetStrength] = useState(50);
  const [magnetDistance, setMagnetDistance] = useState(100);
  
  // Electricity
  const [voltage, setVoltage] = useState(5);
  const [resistance, setResistance] = useState(10);
  const [current, setCurrent] = useState(0);
  
  // Light
  const [lightAngle, setLightAngle] = useState(45);
  const [objectHeight, setObjectHeight] = useState(50);
  
  // Sound
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);

  // Calculate electricity
  useEffect(() => {
    if (voltage && resistance) {
      setCurrent(Number((voltage / resistance).toFixed(2)));
    }
  }, [voltage, resistance]);

  // Gravity simulation
  useEffect(() => {
    if (experimentType === 'gravity' && isPlaying && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let ball: Ball = {
        x: canvas.width / 2,
        y: 50,
        vx: 0,
        vy: 0,
        radius: 20,
        color: '#3b82f6'
      };

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw ground
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Update physics
        ball.vy += gravity * 0.1;
        ball.y += ball.vy;
        
        // Bounce
        if (ball.y + ball.radius > canvas.height - 20) {
          ball.y = canvas.height - 20 - ball.radius;
          ball.vy *= -0.7; // Bounce with energy loss
        }
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Update height and speed
        setBallHeight(Math.max(0, canvas.height - 20 - ball.y - ball.radius));
        setBallSpeed(Math.abs(ball.vy));
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [experimentType, isPlaying, gravity]);

  // Magnetism simulation
  useEffect(() => {
    if (experimentType === 'magnetism' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const magnetX = canvas.width / 2;
      const magnetY = canvas.height / 2;
      
      // Draw magnet
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(magnetX - 30, magnetY - 40, 25, 80);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(magnetX + 5, magnetY - 40, 25, 80);
      
      // Draw N and S labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('N', magnetX - 18, magnetY - 10);
      ctx.fillText('S', magnetX + 13, magnetY + 20);
      
      // Draw magnetic field lines
      const lines = 8;
      for (let i = 0; i < lines; i++) {
        const angle = (Math.PI * 2 * i) / lines;
        const strength = magnetStrength / 100;
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(147, 51, 234, ${strength})`;
        ctx.lineWidth = 2;
        
        for (let r = 50; r < 150; r += 5) {
          const x = magnetX + Math.cos(angle) * r;
          const y = magnetY + Math.sin(angle) * r;
          if (r === 50) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Draw metal object
      const objX = magnetX + magnetDistance;
      const objY = magnetY;
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(objX, objY, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw attraction arrow
      if (magnetDistance < 120) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX - 20, objY);
        ctx.lineTo(objX - 30, objY);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(objX - 20, objY);
        ctx.lineTo(objX - 25, objY - 5);
        ctx.lineTo(objX - 25, objY + 5);
        ctx.closePath();
        ctx.fill();
      }
    }
  }, [experimentType, magnetStrength, magnetDistance]);

  // Electricity simulation
  useEffect(() => {
    if (experimentType === 'electricity' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const batteryX = 50;
      const batteryY = canvas.height / 2;
      const bulbX = canvas.width - 50;
      const bulbY = canvas.height / 2;
      
      // Draw battery
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(batteryX - 20, batteryY - 30, 40, 60);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(batteryX - 10, batteryY - 40, 20, 10);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(batteryX - 10, batteryY + 30, 20, 10);
      
      // Draw wires
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(batteryX + 20, batteryY - 20);
      ctx.lineTo(bulbX - 30, batteryY - 20);
      ctx.lineTo(bulbX - 30, bulbY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(batteryX + 20, batteryY + 20);
      ctx.lineTo(bulbX - 30, batteryY + 20);
      ctx.stroke();
      
      // Draw resistor
      const resistorX = (batteryX + bulbX) / 2;
      const resistorY = batteryY + 20;
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(resistorX - 30, resistorY - 10, 60, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(`${resistance}Ω`, resistorX - 15, resistorY + 5);
      
      // Draw bulb
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 25, 0, Math.PI * 2);
      ctx.fillStyle = current > 0 ? `rgba(251, 191, 36, ${Math.min(current / 2, 1)})` : '#374151';
      ctx.fill();
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw filament
      if (current > 0) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bulbX - 10, bulbY - 5);
        ctx.lineTo(bulbX, bulbY);
        ctx.lineTo(bulbX + 10, bulbY - 5);
        ctx.stroke();
      }
      
      // Draw current flow animation
      if (current > 0) {
        const flowSpeed = current * 2;
        const time = Date.now() / 100;
        for (let i = 0; i < 5; i++) {
          const offset = (time * flowSpeed + i * 50) % 250;
          ctx.beginPath();
          ctx.arc(batteryX + 20 + offset, batteryY - 20, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        }
      }
    }
  }, [experimentType, voltage, resistance, current]);

  // Light and shadow simulation
  useEffect(() => {
    if (experimentType === 'light' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw ground
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
      
      // Light source
      const lightX = 50;
      const lightY = 50;
      
      // Draw light source
      ctx.beginPath();
      ctx.arc(lightX, lightY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      
      // Draw light rays
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(lightX, lightY);
        ctx.lineTo(lightX + Math.cos(angle) * 30, lightY + Math.sin(angle) * 30);
        ctx.stroke();
      }
      
      // Object
      const objX = canvas.width / 2;
      const objY = canvas.height - 20 - objectHeight;
      
      // Calculate shadow
      const angleRad = (lightAngle * Math.PI) / 180;
      const shadowLength = objectHeight * Math.tan(angleRad);
      
      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(objX - 15, canvas.height - 20);
      ctx.lineTo(objX + 15, canvas.height - 20);
      ctx.lineTo(objX + 15 + shadowLength, canvas.height - 20);
      ctx.lineTo(objX - 15 + shadowLength, canvas.height - 20);
      ctx.closePath();
      ctx.fill();
      
      // Draw object
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(objX - 15, objY, 30, objectHeight);
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.strokeRect(objX - 15, objY, 30, objectHeight);
      
      // Draw light beam to object
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lightX, lightY);
      ctx.lineTo(objX, objY);
      ctx.stroke();
    }
  }, [experimentType, lightAngle, objectHeight]);

  // Sound wave simulation
  useEffect(() => {
    if (experimentType === 'sound' && isPlaying && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let time = 0;
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw waveform
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const waveLength = 200 / (frequency / 440); // Relative to 440 Hz
        const waveHeight = amplitude;
        
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin((x + time) / waveLength * Math.PI * 2) * waveHeight;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        
        // Draw center line
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        time += 2;
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [experimentType, isPlaying, frequency, amplitude]);

  const resetExperiment = () => {
    setIsPlaying(false);
    setBallHeight(0);
    setBallSpeed(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const renderMenu = () => {
    const experiments = [
      {
        id: 'gravity',
        icon: ArrowDown,
        color: 'from-blue-500 to-indigo-600',
        emoji: '🌍',
        title: t('experiments.gravity.title'),
        description: t('experiments.gravity.description')
      },
      {
        id: 'magnetism',
        icon: Magnet,
        color: 'from-purple-500 to-pink-600',
        emoji: '🧲',
        title: t('experiments.magnetism.title'),
        description: t('experiments.magnetism.description')
      },
      {
        id: 'electricity',
        icon: Zap,
        color: 'from-yellow-500 to-orange-600',
        emoji: '⚡',
        title: t('experiments.electricity.title'),
        description: t('experiments.electricity.description')
      },
      {
        id: 'light',
        icon: LightbulbIcon,
        color: 'from-amber-500 to-yellow-600',
        emoji: '💡',
        title: t('experiments.light.title'),
        description: t('experiments.light.description')
      },
      {
        id: 'sound',
        icon: Volume2,
        color: 'from-green-500 to-teal-600',
        emoji: '🔊',
        title: t('experiments.sound.title'),
        description: t('experiments.sound.description')
      }
    ];

    return (
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Zap className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
          </div>
          <p className="text-xl text-white/90 mb-2">{t('subtitle')}</p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {experiments.map((exp) => {
            const Icon = exp.icon;
            return (
              <Card
                key={exp.id}
                className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 cursor-pointer"
                onClick={() => {
                  resetExperiment();
                  setExperimentType(exp.id as ExperimentType);
                }}
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

  const renderExperiment = () => {
    const type = experimentType as Exclude<ExperimentType, 'menu'>;

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              {t(`experiments.${type}.title`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Canvas */}
            <div className="mb-6 bg-white rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className="space-y-6 mb-6">
              {type === 'gravity' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.gravity.gravity_value')}</span>
                      <span className="text-white">{gravity.toFixed(1)} m/s²</span>
                    </div>
                    <Slider
                      value={[gravity]}
                      onValueChange={(value) => setGravity(value[0])}
                      min={1}
                      max={20}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm">{t('experiments.gravity.height')}</p>
                      <p className="text-white text-2xl font-bold">{ballHeight.toFixed(0)} px</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm">{t('experiments.gravity.speed')}</p>
                      <p className="text-white text-2xl font-bold">{ballSpeed.toFixed(1)}</p>
                    </div>
                  </div>
                </>
              )}

              {type === 'magnetism' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.magnetism.strength')}</span>
                      <span className="text-white">{magnetStrength}%</span>
                    </div>
                    <Slider
                      value={[magnetStrength]}
                      onValueChange={(value) => setMagnetStrength(value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.magnetism.distance')}</span>
                      <span className="text-white">{magnetDistance} px</span>
                    </div>
                    <Slider
                      value={[magnetDistance]}
                      onValueChange={(value) => setMagnetDistance(value[0])}
                      min={50}
                      max={150}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {type === 'electricity' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.electricity.voltage')}</span>
                      <span className="text-white">{voltage} V</span>
                    </div>
                    <Slider
                      value={[voltage]}
                      onValueChange={(value) => setVoltage(value[0])}
                      min={1}
                      max={12}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.electricity.resistance')}</span>
                      <span className="text-white">{resistance} Ω</span>
                    </div>
                    <Slider
                      value={[resistance]}
                      onValueChange={(value) => setResistance(value[0])}
                      min={5}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-400/30">
                    <p className="text-white text-center">
                      {t('experiments.electricity.current')}: <span className="font-bold text-2xl">{current} A</span>
                    </p>
                    <p className="text-white/70 text-center text-sm mt-2">
                      I = V / R = {voltage}V / {resistance}Ω = {current}A
                    </p>
                  </div>
                </>
              )}

              {type === 'light' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.light.angle')}</span>
                      <span className="text-white">{lightAngle}°</span>
                    </div>
                    <Slider
                      value={[lightAngle]}
                      onValueChange={(value) => setLightAngle(value[0])}
                      min={15}
                      max={75}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.light.object_height')}</span>
                      <span className="text-white">{objectHeight} px</span>
                    </div>
                    <Slider
                      value={[objectHeight]}
                      onValueChange={(value) => setObjectHeight(value[0])}
                      min={30}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {type === 'sound' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.sound.frequency')}</span>
                      <span className="text-white">{frequency} Hz</span>
                    </div>
                    <Slider
                      value={[frequency]}
                      onValueChange={(value) => setFrequency(value[0])}
                      min={220}
                      max={880}
                      step={20}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{t('experiments.sound.amplitude')}</span>
                      <span className="text-white">{amplitude}%</span>
                    </div>
                    <Slider
                      value={[amplitude]}
                      onValueChange={(value) => setAmplitude(value[0])}
                      min={10}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Play Controls */}
            {(type === 'gravity' || type === 'sound') && (
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      {t('pause')}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t('play')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetExperiment}
                  variant="outline"
                  className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('reset')}
                </Button>
              </div>
            )}

            <Button
              onClick={() => setExperimentType('menu')}
              variant="outline"
              className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/20 backdrop-blur-md border-blue-400/30">
          <CardContent className="pt-6">
            <div className="text-white text-sm">
              <p className="font-semibold mb-2">{t(`experiments.${type}.info_title`)}</p>
              <p className="text-white/80">{t(`experiments.${type}.info`)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {experimentType === 'menu' && renderMenu()}
        {experimentType !== 'menu' && renderExperiment()}
      </main>

      <Footer />
    </div>
  );
};

export default PhysicsLabApp;
