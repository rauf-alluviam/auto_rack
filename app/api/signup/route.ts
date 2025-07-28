/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - userType
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [buyer, seller]
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     userType:
 *                       type: string
 *       400:
 *         description: Validation error (missing fields)
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */









import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  await connectToDB();

  const { name, email, password, userType } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Explicitly set userType to 'buyer' if not provided or undefined
    const finalUserType = userType && userType.trim() !== '' ? userType : 'buyer';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType: finalUserType,
    });

    // Generate JWT token after signup
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.userType },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json(
      {
        message: 'Signup successful',
        token, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
        },
        userId: user._id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}