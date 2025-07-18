import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET(req: Request) {
  await connectDB();

  const userId = req.headers.get('user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized: User ID missing' }, { status: 401 });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
