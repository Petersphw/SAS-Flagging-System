import { NextResponse } from 'next/server';
import { verificationStore } from '@/lib/auth-store';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();

    // Verify email belongs to registered SAS admins
    const allowedAdmins = ['petersm@sas.co.za', 'nandil@sas.co.za'];
    if (!allowedAdmins.includes(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized email address. Only registered SAS administrators may sign in.' },
        { status: 403 }
      );
    }

    // Generate secure 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    verificationStore.set(cleanEmail, { code, expiresAt });

    let emailSent = false;

    // 1. Send via Resend (Recommended, 100% Free: https://resend.com)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.EMAIL_FROM || 'SAS Safety <onboarding@resend.dev>';
        
        await resend.emails.send({
          from: fromEmail,
          to: cleanEmail,
          subject: `SAS Flagging System — Admin Verification Code: ${code}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#030712;color:#ffffff;padding:40px 20px;margin:0;">
              <div style="max-width:540px;margin:0 auto;background:linear-gradient(135deg,#070d24 0%,#0c1538 100%);border:1px solid #1e3a8a;border-radius:24px;padding:36px;box-shadow:0 24px 64px rgba(0,0,0,0.8);">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                  <div style="background:#2563eb;color:#ffffff;font-weight:900;padding:8px 14px;border-radius:12px;font-size:14px;letter-spacing:1px;">SAS</div>
                  <div style="font-size:13px;color:#93c5fd;font-weight:600;">Sandock Austral Shipyards • SHERQ</div>
                </div>
                <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 10px;">Admin Security Verification</h1>
                <p style="color:#93c5fd;font-size:14px;line-height:1.6;margin:0 0 24px;">
                  A sign-in request was initiated for your administrator account (<b>${cleanEmail}</b>). Use the 6-digit verification code below to verify your identity:
                </p>
                <div style="background:#030712;border:2px solid #38bdf8;padding:20px;border-radius:18px;text-align:center;margin:24px 0;">
                  <span style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:#38bdf8;text-shadow:0 0 20px rgba(56,189,248,0.5);">${code}</span>
                </div>
                <p style="color:#60a5fa;font-size:12px;line-height:1.5;margin:0 0 16px;">
                  ⏱ This code expires in <b>10 minutes</b>. If you did not request this sign-in, please notify the SHERQ team immediately.
                </p>
                <hr style="border:none;border-top:1px solid rgba(147,197,253,0.15);margin:24px 0;" />
                <div style="font-size:11px;color:#64748b;text-align:center;">
                  Sandock Austral Shipyards (Pty) Ltd • PPE Traffic-Light Compliance System
                </div>
              </div>
            </body>
            </html>
          `
        });
        emailSent = true;
      } catch (err: any) {
        console.error('Resend dispatch failed:', err);
      }
    }

    // 2. Send via SMTP (e.g. Microsoft 365 / Outlook / Gmail / Corporate SMTP)
    if (!emailSent && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"SAS Safety System" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: `SAS Flagging System — Admin Verification Code: ${code}`,
          text: `SAS Flagging System — Admin Verification Code: ${code}\n\nYour code is: ${code}\nThis code expires in 10 minutes.\n\n— Sandock Austral Shipyards`,
          html: `
            <div style="font-family:sans-serif;background:#070d24;color:#fff;padding:30px;border-radius:16px;">
              <h2>SAS Flagging System</h2>
              <p>Your 6-digit Admin Verification Code is:</p>
              <h1 style="color:#38bdf8;letter-spacing:6px;font-family:monospace;">${code}</h1>
              <p style="color:#93c5fd;font-size:12px;">Expires in 10 minutes. Sandock Austral Shipyards.</p>
            </div>
          `
        });
        emailSent = true;
      } catch (err: any) {
        console.error('SMTP dispatch failed:', err);
      }
    }

    if (!emailSent) {
      console.warn(`[SAS AUTH] Verification code for ${cleanEmail} is: ${code} (Set RESEND_API_KEY or SMTP_HOST in Vercel to send real emails).`);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox.`
        : `Verification code generated. (Add RESEND_API_KEY in Vercel to send real emails to your mailbox).`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
