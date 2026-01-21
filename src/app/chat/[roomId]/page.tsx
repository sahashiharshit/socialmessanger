'use client';

import { use } from 'react';
import ChatRoom from '@/components/chat-room';

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  
  // In production, get these from your auth system
  const userId = 'user123';
  const username = 'John Doe';

  return <ChatRoom roomId={roomId} userId={userId} username={username} />;
}