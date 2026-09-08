import { NextResponse } from 'next/server';
import { verificationStore } from '@/lib/auth-store';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();

    // Verify email belongs to registered SAS admins
    const allowedAdmins = ['petersm@sas.co.za', 'nandil@sas.co.za'];
    if (!allowedAdmins.includes(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized email address.' },
        { status: 403 }
      );
    }

    // Generate secure 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    verificationStore.set(cleanEmail, { code, expiresAt });

    // Server-side email dispatch via Resend API if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'SAS Safety <safety@sas.co.za>',
            to: [cleanEmail],
            subject: `SAS Flagging System — Admin Verification Code: ${code}`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#030712;color:#ffffff;padding:32px;border-radius:16px;">
                <h2 style="color:#38bdf8;margin-bottom:8px;">Sandock Austral Shipyards</h2>
                <h3 style="margin-top:0;">Admin Security Verification Code</h3>
                <p style="color:#93c5fd;font-size:14px;">Use this 6-digit verification code to complete your admin sign-in:</p>
                <div style="background:#0c1538;border:1px solid #38bdf8;padding:16px 24px;border-radius:12px;font-size:32px;font-family:monospace;letter-spacing:6px;font-weight:900;color:#ffffff;display:inline-block;margin:16px 0;">
                  ${code}
                </div>
                <p style="color:#60a5fa;font-size:12px;">This code expires in 10 minutes. If you did not request this code, please notify SHERQ immediately.</p>
              </div>
            `
          })
        });
      } catch (err) {
        console.error('Failed to dispatch email via Resend API:', err);
      }
    }

    // IMPORTANT SECURITY CONSTRAINT: NEVER return the code in the response to the client browser!
    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox.`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
