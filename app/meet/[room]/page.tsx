import type {Metadata} from 'next';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getRoomMeetState} from '@/hooks/meet/meet-room-actions';
import {LiveClassroomClient} from '@/components/meet/live-classroom-client';

export const metadata: Metadata = {
  title: 'Salle de Cours Vidéo en Direct - 9arrini',
  description: 'Salle de visioconférence en direct et connexion Google Meet officielle sur 9arrini.',
};

export default async function MeetRoomPage({
  params,
}: {
  params: Promise<{room: string}>;
}) {
  const {room} = await params;
  const user = await getUserInfo();
  const roomState = await getRoomMeetState(room);

  return (
    <LiveClassroomClient
      roomCode={room}
      initialGoogleMeetUrl={roomState.googleMeetUrl}
      courseTitle={roomState.courseTitle}
      tutorName={roomState.tutorName}
      scheduledLabel={roomState.scheduledLabel}
      userName={user?.name || 'Participant 9arrini'}
      userEmail={user?.email || ''}
      userRole={user?.role || 'USER'}
    />
  );
}
