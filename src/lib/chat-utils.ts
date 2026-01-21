export function createPrivateRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('-');
}

// Usage example
// const roomId = createPrivateRoomId('user123', 'user456');
// router.push(`/chat/${roomId}`);