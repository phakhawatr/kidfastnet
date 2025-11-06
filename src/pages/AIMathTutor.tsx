import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { ToastManager } from '@/components/Toast';
import { AIFeatureGuard } from '@/components/AIFeatureGuard';
import { AIChatMessage } from '@/components/AIChatMessage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const AIMathTutor = () => {
  const { t } = useTranslation('ai');
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUserAndQuota();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkUserAndQuota = async () => {
    try {
      // Get user email from localStorage
      let userEmail = localStorage.getItem('kidfast_last_email');
      
      // If not found, try to get from auth object
      if (!userEmail) {
        const authData = localStorage.getItem('kidfast_auth');
        if (authData) {
          try {
            const auth = JSON.parse(authData);
            // For demo mode, skip AI features
            if (auth.isDemo) {
              ToastManager.show({
                message: t('mathTutor.alerts.demoMode'),
                type: 'info'
              });
              navigate('/profile');
              return;
            }
          } catch (e) {
            console.error('Error parsing auth data:', e);
          }
        }
      }

      if (!userEmail) {
        ToastManager.show({
          message: t('mathTutor.alerts.loginRequired'),
          type: 'error'
        });
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('user_registrations')
        .select('id, ai_features_enabled, ai_monthly_quota, ai_usage_count')
        .eq('parent_email', userEmail)
        .single();

      if (userError || !userData) {
        throw new Error(t('mathTutor.alerts.userNotFound'));
      }

      setUserId(userData.id);
      setAiEnabled(userData.ai_features_enabled || false);
      setRemainingQuota((userData.ai_monthly_quota || 0) - (userData.ai_usage_count || 0));
    } catch (error) {
      console.error('Error checking user:', error);
      ToastManager.show({
        message: t('mathTutor.alerts.checkError'),
        type: 'error'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !userId) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const CHAT_URL = `https://yxvuivtnyrcrtiqxhbkl.supabase.co/functions/v1/ai-math-tutor`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: userId,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          ToastManager.show({
            message: errorData.message || t('mathTutor.alerts.quotaExhausted'),
            type: 'error'
          });
          await checkUserAndQuota();
          return;
        }
        throw new Error('Failed to get AI response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      // Add initial empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':') || !line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Failed to parse final buffer:', e);
          }
        }
      }

      // Refresh quota after successful AI call
      await checkUserAndQuota();
    } catch (error) {
      console.error('Error calling AI:', error);
      ToastManager.show({
        message: t('mathTutor.alerts.aiError'),
        type: 'error'
      });
      // Remove empty assistant message on error
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--primary-variant))] to-[hsl(var(--accent))]">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('mathTutor.back')}
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t('mathTutor.title')}
              </h1>
              <p className="text-white/80">
                {t('mathTutor.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <AIFeatureGuard
          isEnabled={aiEnabled}
          remainingQuota={remainingQuota}
          featureName={t('mathTutor.title')}
        >
          <Card className="h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h2 className="text-xl font-bold mb-2">{t('mathTutor.greeting')}</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {t('mathTutor.welcomeMessage')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    {(t('mathTutor.suggestedQuestions', { returnObjects: true }) as string[]).map((question: string, idx: number) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="text-left justify-start h-auto whitespace-normal py-3"
                        onClick={() => setInput(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, idx) => (
                    <AIChatMessage
                      key={idx}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <div className="bg-card text-card-foreground border border-border rounded-2xl px-4 py-3">
                        <p className="text-sm text-muted-foreground">{t('mathTutor.thinking')}</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{t('mathTutor.quotaRemaining', { quota: remainingQuota })}</span>
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('mathTutor.placeholder')}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </AIFeatureGuard>
      </main>

      <Footer />
    </div>
  );
};

export default AIMathTutor;
