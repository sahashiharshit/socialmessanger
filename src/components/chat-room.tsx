'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/providers/socket-provider';
import type { Message, TypingUser } from '@/types/chat';

interface ChatRoomProps {
  roomId: string;
  userId: string;
  username: string;
}

export default function ChatRoom({ roomId, userId, username }: ChatRoomProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', roomId);

    socket.on('receive-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-typing', (data: TypingUser) => {
      setTypingUsers((prev) => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('user-stop-typing', (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId, userId, username });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { roomId, userId });
    }, 1000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit('send-message', {
      roomId,
      message: inputMessage,
      userId,
      username
    });

    setInputMessage('');
    setIsTyping(false);
    socket.emit('stop-typing', { roomId, userId });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Connecting to chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="bg-gray-100 p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Room: {roomId}</h2>
        <p className="text-sm text-gray-600">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.userId === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="font-semibold text-sm">{msg.username}</div>
              <div className="break-words">{msg.message}</div>
              <div className={`text-xs mt-1 ${msg.userId === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 mb-2 px-4">
          {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <form onSubmit={sendMessage} className="flex gap-2 p-4 bg-white border-t">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}