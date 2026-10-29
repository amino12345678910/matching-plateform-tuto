import {redirect} from 'next/navigation';
import {getRoomMeetState} from '@/hooks/meet/meet-room-actions';

export default async function MeetRoomPage({
  params,
}: {
  params: Promise<{room: string}>;
}) {
  const {room} = await params;
  const roomState = await getRoomMeetState(room);
  redirect(roomState.googleMeetUrl || 'https://meet.google.com/new');
}
