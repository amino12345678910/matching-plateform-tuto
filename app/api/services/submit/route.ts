import {NextResponse, type NextRequest} from 'next/server';

async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received service data:', data);
    return NextResponse.json({message: 'Service received successfully', data: data}, {status: 200});
  } catch (error) {
    console.error('Error in POST /api/services:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
export {POST};
