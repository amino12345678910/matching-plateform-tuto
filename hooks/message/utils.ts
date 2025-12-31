export const getOtherUser = ({role, roomId}: {roomId: string; role: 'SELLER' | 'USER'}): string => {
  const fId = roomId.split('--')[1];
  const amIFreelancer = role === 'SELLER';
  return amIFreelancer ? roomId.split('--')[0] : fId;
};
