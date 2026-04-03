export interface Participant {
  id: number;
  full_name: string;
  email: string | null;
  phone: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  team_partner_name: string | null;
  created_at: string;
}

export interface Waiver {
  id: number;
  participant_id: number;
  waiver_text: string;
  p1_name: string;
  p1_phone: string;
  p1_signature_data: string;
  p1_signature_type: 'draw' | 'type';
  p2_name: string | null;
  p2_phone: string | null;
  p2_signature_data: string | null;
  p2_signature_type: 'draw' | 'type' | null;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_signature_data: string | null;
  guardian_signature_type: 'draw' | 'type' | null;
  signed_at: string;
  ip_address: string | null;
}

export interface ParticipantWithWaiver extends Participant {
  waiver_signed: number;
  waiver_id: number | null;
  signed_at: string | null;
}

export interface TournamentWeek {
  id: number;
  week_number: number;
  date: string;
  location: string;
  notes: string | null;
  is_upcoming: number;
  created_at: string;
}

export interface Result {
  id: number;
  week_id: number;
  team_name: string;
  angler1: string;
  angler2: string;
  total_weight: number;
  num_fish: number;
  big_bass_weight: number | null;
  placement: number | null;
}

export interface WeekPhoto {
  id: number;
  week_id: number;
  filename: string;
  caption: string | null;
  created_at: string;
}

export interface WeekEntry {
  id: number;
  participant_id: number;
  week_id: number;
  boat_number: string | null;
  paid: boolean;
  payment_amount: number;
  notes: string | null;
  signup_source: 'admin' | 'online';
  created_at: string;
}

export interface WeekEntryWithParticipant extends WeekEntry {
  full_name: string;
  phone: string;
  team_partner_name: string | null;
  waiver_signed: number;
}

export interface ParticipantWithHistory extends ParticipantWithWaiver {
  weeks_fished: number;
}

export interface TournamentSettings {
  [key: string]: string;
}
