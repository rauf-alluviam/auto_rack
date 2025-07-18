import { NextResponse } from 'next/server';

const users: {
  name: string;
  email: string;
  password: string;
  userType: string;
}[] = [];

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const user = [{ email: 'test@example.com', password: '123456' }];

  if (user) {
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
