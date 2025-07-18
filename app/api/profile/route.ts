import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
