import React from 'react';


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-2`}>
      <div
        className={`max-w-[80%] p-2 sm:p-3 border-2 border-[#222] rounded-none shadow-[2px_2px_0_#111] font-press-start text-[11px] font-normal tracking-tight
          ${isUser
            ? 'bg-[#ffe066] text-[#222]'
            : 'bg-[#fff] text-[#222]'}
        `}
        style={{
          fontFamily: '"Press Start 2P", monospace',
          boxShadow: '2px 2px 0 #111',
          borderRadius: '0',
        }}
      >
        <div className="flex flex-col gap-1">
          <span className="break-words leading-snug">{message.text}</span>
          <div className={`text-[9px] mt-1 ${isUser ? 'text-[#bfa800]' : 'text-[#888]'}`}>{formatTime(message.timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);
