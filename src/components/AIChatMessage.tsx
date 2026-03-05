import { User, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRecommendedApps } from '@/utils/aiAppRecommendations';

interface AIChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatMessage = ({ role, content }: AIChatMessageProps) => {
  const isUser = role === 'user';
  const navigate = useNavigate();
  
  const recommendations = !isUser ? getRecommendedApps(content) : [];
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className={`max-w-[80%] space-y-2`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-card text-card-foreground border border-border'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>

        {recommendations.length > 0 && (
          <div className="bg-muted/50 rounded-xl px-3 py-2.5 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              📚 ฝึกทักษะที่เกี่ยวข้อง:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recommendations.map((app) => (
                <button
                  key={app.key}
                  onClick={() => navigate(app.link)}
                  className={`${app.color} text-xs font-medium px-2.5 py-1.5 rounded-full 
                    hover:scale-105 active:scale-95 transition-transform cursor-pointer
                    text-foreground/80 shadow-sm flex items-center gap-1`}
                >
                  <span>{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
