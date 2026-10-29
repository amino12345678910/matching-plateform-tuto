import {NextRequest, NextResponse} from 'next/server';
import {createRealGoogleMeetAutomatically} from '@/lib/google-calendar-meet';
import {generateMeetCode} from '@/lib/google-meet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = (body?.title || 'Séance de cours particulier 9arrini').trim();
    const scheduledDate = body?.scheduledDate;
    const scheduledTime = body?.scheduledTime;

    // 1. Try creating a real Google Meet room automatically via Google API
    const realGoogleMeetUrl = await createRealGoogleMeetAutomatically({
      title,
      scheduledDate,
      scheduledTime,
    });

    if (realGoogleMeetUrl) {
      return NextResponse.json({
        success: true,
        provider: 'GOOGLE_MEET_API',
        meetUrl: realGoogleMeetUrl,
      });
    }

    // 2. Automatic 9arrini Live Video Classroom (0 copy-paste required)
    const roomCode = generateMeetCode(`${title}-${Date.now().toString(36).slice(-4)}`);
    return NextResponse.json({
      success: true,
      provider: '9ARRINI_LIVE_ROOM',
      meetUrl: `/meet/${roomCode}`,
      externalUrl: `https://www.9arrini.me/meet/${roomCode}`,
    });
  } catch {
    const roomCode = generateMeetCode(`session-${Date.now()}`);
    return NextResponse.json({
      success: true,
      provider: '9ARRINI_LIVE_ROOM',
      meetUrl: `/meet/${roomCode}`,
      externalUrl: `https://www.9arrini.me/meet/${roomCode}`,
    });
  }
}
