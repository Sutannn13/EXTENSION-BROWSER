import { cn } from '../lib/utils/cn';
import type { ChatMessage } from '../lib/ai/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-2xl px-4 py-3', isUser ? 'bg-blue-500 text-white rounded-br-md' : 'bg-slate-800 text-slate-200 rounded-bl-md')}>
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <p className={cn('text-xs mt-2', isUser ? 'text-blue-200' : 'text-slate-500')}>
          {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}