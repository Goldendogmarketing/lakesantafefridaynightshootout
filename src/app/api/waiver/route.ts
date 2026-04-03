import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      p1_name, p1_phone, p1_signature_data, p1_signature_type,
      p2_name, p2_phone, p2_signature_data, p2_signature_type,
      guardian_name, guardian_relationship, guardian_signature_data, guardian_signature_type,
      waiver_text,
    } = body;

    // Validate Participant 1 (required)
    if (!p1_name?.trim() || !p1_phone?.trim() || !p1_signature_data || !p1_signature_type) {
      return NextResponse.json({ error: 'Participant 1 name, phone, and signature are required' }, { status: 400 });
    }

    if (!['draw', 'type'].includes(p1_signature_type)) {
      return NextResponse.json({ error: 'Invalid signature type' }, { status: 400 });
    }

    const db = getDb();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const insertParticipant = db.prepare(
      'INSERT INTO participants (full_name, phone, team_partner_name) VALUES (?, ?, ?)'
    );
    const insertWaiver = db.prepare(`
      INSERT INTO waivers (
        participant_id, waiver_text,
        p1_name, p1_phone, p1_signature_data, p1_signature_type,
        p2_name, p2_phone, p2_signature_data, p2_signature_type,
        guardian_name, guardian_relationship, guardian_signature_data, guardian_signature_type,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const result = insertParticipant.run(
        p1_name.trim(),
        p1_phone.trim(),
        p2_name?.trim() || null
      );
      const participantId = result.lastInsertRowid;

      insertWaiver.run(
        participantId,
        waiver_text || '',
        p1_name.trim(), p1_phone.trim(), p1_signature_data, p1_signature_type,
        p2_name?.trim() || null, p2_phone?.trim() || null, p2_signature_data || null, p2_signature_type || null,
        guardian_name?.trim() || null, guardian_relationship?.trim() || null, guardian_signature_data || null, guardian_signature_type || null,
        ip
      );

      return participantId;
    });

    const participantId = transaction();

    return NextResponse.json({ success: true, participantId }, { status: 201 });
  } catch (error) {
    console.error('Waiver submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
