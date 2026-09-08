export type CardType = 'yellow' | 'orange' | 'red';
export type FlagStatus = 'open' | 'ack' | 'closed';
export type Role = 'observer' | 'admin' | null;

export interface Department {
  id: string;
  name: string;
  head: string;
  cluster: string;
  icon: string;
  acc: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  deptId: string;
  email?: string;
}

export interface Flag {
  id: string;
  personId: string;
  deptId: string;
  type: CardType;
  ppe: string;
  location: string;
  date: string;
  time: string;
  issuedBy: string;
  notes: string;
  status: FlagStatus;
  demo?: boolean;
  created: number;
}

export interface Escalation {
  id: string;
  flagId: string;
  targetEmail: string;
  level: 'foreman' | 'hr';
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'acknowledged';
  notifiedAt?: number;
  created: number;
}

export interface AdminAccount {
  email: string;
  name: string;
  hash: string | null;
  mustReset?: boolean;
}

export interface AppSettings {
  hrEmail: string;
  demoDismissed: boolean;
  auth: {
    admins: AdminAccount[];
    lock: { fails: number; until: number };
  };
}

export interface AppStore {
  version: number;
  departments: Department[];
  people: Person[];
  flags: Flag[];
  escalations: Escalation[];
  settings: AppSettings;
}
