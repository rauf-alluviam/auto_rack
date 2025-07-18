import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(request: Request) {
  await connectDB();

  const { name, email, password, userType } = await request.json();

  if (!name || !email || !password || !userType) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    // Save user to DB
    const user = await User.create({ name, email, password, userType });

   
    return NextResponse.json(
      { message: 'Signup successful', userId: user._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to insert user:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
