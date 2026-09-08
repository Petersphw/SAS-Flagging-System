import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ success: true, flags: data });
    }

    return NextResponse.json({ success: true, flags: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personId, deptId, type, ppe, location, date, time, issuedBy, notes } = body;

    if (!personId || !deptId || !type || !ppe || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required flag fields.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const flagId = 'flag_' + Date.now().toString(36);
      const { data: flagData, error: flagErr } = await supabase
        .from('flags')
        .insert([
          {
            id: flagId,
            person_id: personId,
            dept_id: deptId,
            type,
            ppe,
            location,
            date,
            time,
            issued_by: issuedBy,
            notes,
            status: 'open'
          }
        ])
        .select()
        .single();

      if (flagErr) throw flagErr;

      // Automatically create escalation for Orange or Red cards
      if (type === 'orange' || type === 'red') {
        const isRed = type === 'red';
        const targetEmail = isRed ? 'HR@sas.co.za' : 'Foreman / BU Head';
        await supabase.from('escalations').insert([
          {
            flag_id: flagId,
            target_email: targetEmail,
            level: isRed ? 'hr' : 'foreman',
            subject: `SAS PPE ${isRed ? 'HR Escalation' : 'Foreman Notification'} — ${ppe} non-compliance`,
            body: `Non-compliance event logged on ${date} at ${location}. Required PPE: ${ppe}.`,
            status: 'pending'
          }
        ]);
      }

      return NextResponse.json({ success: true, flag: flagData });
    }

    return NextResponse.json({
      success: true,
      flag: {
        id: 'flag_' + Date.now().toString(36),
        personId,
        deptId,
        type,
        ppe,
        location,
        date,
        time,
        issuedBy,
        notes,
        status: 'open',
        created: Date.now()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
