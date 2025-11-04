/**
 * @swagger
 * /api/signin:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: signin successful
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
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */





// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDB } from '@/lib/db';
// import { User } from '@/lib/models/User';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';



// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// console.log("JWT_SECRET used in /signin:", process.env.JWT_SECRET);

// export async function POST(request: NextRequest) {
//   await connectToDB();

//   let body;

//   try {
//     const rawBody = await request.text();
//     console.log(" Raw request body:", rawBody);

//     body = JSON.parse(rawBody);
//     console.log(" Parsed body:", body);
//   } catch (err) {
//     console.error(" Failed to parse JSON:", err);
//     return NextResponse.json({ error: "Invalid or missing JSON body" }, { status: 400 });
//   }

//   const { email, password } = body;

//   if (!email || !password) {
//     return NextResponse.json(
//       { error: 'Email and password are required' },
//       { status: 400 }
//     );
//   }

//   try {
//     const user = await User.findOne({ email });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//     }

//     const token = jwt.sign(
//   { id: user._id, email: user.email, role: user.userType }, 
//   process.env.JWT_SECRET!, 
//   { expiresIn: '7d' } 
// )

//     return NextResponse.json(
//       {
//         message: 'Login successful',
//         token,
//         role: user.userType,
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           userType: user.userType,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';


const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

   
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.userType },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token,
      role: user.userType,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
