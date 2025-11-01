import { User, Bot } from 'lucide-react';

interface AIChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatMessage = ({ role, content }: AIChatMessageProps) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card text-card-foreground border border-border'
      }`}>
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
};
