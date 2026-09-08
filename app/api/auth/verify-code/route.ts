import { NextResponse } from 'next/server';
import { verificationStore } from '@/lib/auth-store';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit code are required.' },
        { status: 400 }
      );
    }

    const entry = verificationStore.get(cleanEmail);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'No verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    if (Date.now() > entry.expiresAt) {
      verificationStore.delete(cleanEmail);
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (entry.code !== cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please check your inbox.' },
        { status: 400 }
      );
    }

    // Code is valid — clear entry to prevent reuse
    verificationStore.delete(cleanEmail);

    return NextResponse.json({
      success: true,
      verified: true,
      email: cleanEmail,
      message: 'Identity successfully verified.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
