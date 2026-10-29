import {NextRequest, NextResponse} from 'next/server';
import {createRealGoogleMeetAutomatically} from '@/lib/google-calendar-meet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = (body?.title || 'Séance de cours particulier 9arrini').trim();
    const scheduledDate = body?.scheduledDate;
    const scheduledTime = body?.scheduledTime;

    // Create a real Google Meet room automatically via Google Calendar / Google Meet REST API
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

    return NextResponse.json({
      success: true,
      provider: 'GOOGLE_MEET_NEW',
      meetUrl: 'https://meet.google.com/new',
    });
  } catch {
    return NextResponse.json({
      success: true,
      provider: 'GOOGLE_MEET_NEW',
      meetUrl: 'https://meet.google.com/new',
    });
  }
}
