import { Department, Person, AppStore } from './types';

export const DEPARTMENTS_SEED: Department[] = [
  { id: 'd-exec',  name: 'Executive Leadership', head: 'Prasheen Maharaj', cluster: 'Executive', icon: 'crown', acc: '#38bdf8' },
  { id: 'd-hr',    name: 'Human Resources', head: 'Adv Sinqobile Khuluse', cluster: 'Operations', icon: 'heart', acc: '#60a5fa' },
  { id: 'd-fin',   name: 'Finance & Accounting', head: 'Peter Small', cluster: 'Operations', icon: 'dollar', acc: '#2563eb' },
  { id: 'd-rev',   name: 'Revenue Generation', head: 'Akash Singh', cluster: 'Operations', icon: 'trending', acc: '#34e39c' },
  { id: 'd-scm',   name: 'Supply Chain Management', head: 'Akash Singh', cluster: 'Operations', icon: 'box', acc: '#38bdf8' },
  { id: 'd-fac',   name: 'Facilities & Maintenance', head: 'Fred Schoon', cluster: 'Operations', icon: 'tool', acc: '#f2c14e' },
  { id: 'd-ship',  name: 'Shipbuilding & Ship Repair', head: 'Mark Richards', cluster: 'Operations', icon: 'anchor', acc: '#ef8550' },
  { id: 'd-sherq', name: 'Safety, Health, Environment, Risk & Quality (SHERQ)', head: 'Don Khumalo', cluster: 'Operations', icon: 'shield', acc: '#f25c70' },
  { id: 'd-ppmo',  name: 'Project Portfolio Management (PPMO)', head: 'Momelezi Cele', cluster: 'Operations', icon: 'layers', acc: '#60a5fa' }
];

export const PEOPLE_SEED: Person[] = [
  /* Office of the CEO / Executives */
  { id: 'p-01', name: 'Prasheen Maharaj', role: 'Chief Executive Officer', deptId: 'd-exec' },
  { id: 'p-02', name: 'Adv Sinqobile Khuluse', role: 'Chief People Officer', deptId: 'd-hr' },
  { id: 'p-03', name: 'Peter Small', role: 'Executive: Finance', deptId: 'd-fin' },
  { id: 'p-04', name: 'Nonjabulo Mazibuko', role: 'Analyst: Strategic Portfolio Management', deptId: 'd-exec' },
  { id: 'p-05', name: 'Zimasa Ndamase', role: 'Executive Assistant to CEO', deptId: 'd-exec' },
  /* Human Resources */
  { id: 'p-06', name: 'Dr Ashlesha Singh', role: 'Senior Manager: Talent Management & OD', deptId: 'd-hr' },
  { id: 'p-07', name: 'Nomfundo Xolo', role: 'Communications & Stakeholder Relations Manager', deptId: 'd-hr' },
  { id: 'p-08', name: 'Nandi Luthuli', role: 'HR & Payroll Administrator', deptId: 'd-hr' },
  { id: 'p-09', name: 'Khanyisile Mdlalose', role: 'Recruitment Officer', deptId: 'd-hr' },
  { id: 'p-10', name: 'Anele Luthuli', role: 'Front Office Support', deptId: 'd-hr' },
  /* Finance & Accounting */
  { id: 'p-11', name: 'Shalendra Hariparsad', role: 'Financial Manager', deptId: 'd-fin' },
  { id: 'p-12', name: 'Mthobisi Mkhize', role: 'Accountant: Financial Reporting', deptId: 'd-fin' },
  { id: 'p-13', name: 'Raj Gangaram (Jnr)', role: 'Management Accountant', deptId: 'd-fin' },
  { id: 'p-14', name: 'Nelisiwe Mthembu', role: 'Creditors Supervisor', deptId: 'd-fin' },
  { id: 'p-15', name: 'Sihle Buthelezi', role: 'Payroll Specialist', deptId: 'd-fin' },
  /* Revenue Generation */
  { id: 'p-16', name: 'Akash Singh', role: 'BU Head: Revenue Generation & SCM', deptId: 'd-rev' },
  { id: 'p-17', name: 'Mervin Chetty', role: 'Senior Estimator', deptId: 'd-rev' },
  { id: 'p-18', name: 'Prashan Lutchman', role: 'Estimator: Commercial & Defence', deptId: 'd-rev' },
  { id: 'p-19', name: 'Kavisha Pillay', role: 'Business Development Specialist', deptId: 'd-rev' },
  { id: 'p-20', name: 'Suresh Moodley', role: 'Client Liaison & Proposals Lead', deptId: 'd-rev' },
  /* Supply Chain Management */
  { id: 'p-21', name: 'Pravashen Naidoo', role: 'Procurement Specialist', deptId: 'd-scm' },
  { id: 'p-22', name: 'Nerissa Govender', role: 'Buyer: Mechanical & Technical', deptId: 'd-scm' },
  { id: 'p-23', name: 'Themba Khumalo', role: 'Logistics & Dispatch Controller', deptId: 'd-scm' },
  { id: 'p-24', name: 'Allen Naidoo', role: 'Senior Storeman', deptId: 'd-scm' },
  { id: 'p-25', name: 'Zama Msomi', role: 'Junior Buyer', deptId: 'd-scm' },
  /* Facilities & Maintenance */
  { id: 'p-26', name: 'Fred Schoon', role: 'Senior Manager: Facilities & Maintenance', deptId: 'd-fac' },
  { id: 'p-27', name: 'Angelique Van Der Byl', role: 'Facilities & Maintenance Coordinator', deptId: 'd-fac' },
  { id: 'p-28', name: 'Derrick Mokoena', role: 'Maintenance Foreman (Dock & Plant)', deptId: 'd-fac' },
  { id: 'p-29', name: 'Ashley Naidoo', role: 'Facilities Officer', deptId: 'd-fac' },
  { id: 'p-30', name: 'Bongani Sithole', role: 'Plant Electrician', deptId: 'd-fac' },
  /* Shipbuilding & Ship Repair */
  { id: 'p-31', name: 'Mark Richards', role: 'Senior Manager: Shipbuilding', deptId: 'd-ship' },
  { id: 'p-32', name: 'Anna Fourie', role: 'Interface Control & PBS Manager', deptId: 'd-ship' },
  { id: 'p-33', name: 'Mariette Smit', role: 'Test & Commissioning / QA-QC Manager', deptId: 'd-ship' },
  { id: 'p-34', name: 'Ringanai Mutangi', role: 'Mechanical Integration Manager', deptId: 'd-ship' },
  { id: 'p-35', name: 'Karl Kast', role: 'Piping Manager', deptId: 'd-ship' },
  { id: 'p-36', name: 'Siya Makhanya', role: 'Steel & Outfitting Manager', deptId: 'd-ship' },
  { id: 'p-37', name: 'Jimmy Howes', role: 'Paint Manager', deptId: 'd-ship' },
  { id: 'p-38', name: 'Mlungisi Gwala', role: 'Shipwright Foreman', deptId: 'd-ship' },
  { id: 'p-39', name: 'Brooke Tarin', role: 'BU Head: Shipbuilding', deptId: 'd-ship' },
  { id: 'p-40', name: 'Sipho Zulu', role: 'Boilermaker / Plater', deptId: 'd-ship' },
  /* SHERQ */
  { id: 'p-41', name: 'Don Khumalo', role: 'BU Head: SHERQ', deptId: 'd-sherq' },
  { id: 'p-42', name: 'Noxolo Mkhwanazi', role: 'SHERQ Manager & Environmental Officer', deptId: 'd-sherq' },
  { id: 'p-43', name: 'Eduardo Pinto', role: 'Project Quality Manager', deptId: 'd-sherq' },
  { id: 'p-44', name: 'Davan Naidoo', role: 'Health & Safety Supervisor', deptId: 'd-sherq' },
  { id: 'p-45', name: 'Donaseelan Manickum', role: 'Safety Officer: MRO', deptId: 'd-sherq' },
  { id: 'p-46', name: 'Johnson Chirong Menza', role: 'Junior Safety Officer', deptId: 'd-sherq' },
  { id: 'p-47', name: 'Sizwe Mtshali', role: 'Junior Safety Officer', deptId: 'd-sherq' },
  { id: 'p-48', name: 'Andile Zondi', role: 'QC Electrical Intern', deptId: 'd-sherq' },
  /* Project Portfolio Management (PPMO) */
  { id: 'p-49', name: 'Momelezi Cele', role: 'BU Head: PPMO', deptId: 'd-ppmo' },
  { id: 'p-50', name: 'Kretesh Singh', role: 'Project Manager', deptId: 'd-ppmo' },
  { id: 'p-51', name: 'Craig Arnold', role: 'Project Manager', deptId: 'd-ppmo' },
  { id: 'p-52', name: 'Senzo Dlamini', role: 'Project Planner & Scheduler', deptId: 'd-ppmo' }
];

export const PPE_ITEMS = [
  'Hard Hat',
  'Safety Goggles',
  'Safety Boots',
  'Hi-Vis Vest',
  'Safety Gloves',
  'Hearing Protection',
  'Respirator / Dust Mask',
  'Welding Shield',
  'Face Shield',
  'Safety Harness',
  'Coverall / Overall',
  'Life Jacket (PFD)'
];

export const LOCATIONS = [
  'Synchro Lift',
  'Dry Dock',
  'Shipbuilding Hall A',
  'Shipbuilding Hall B',
  'MRO Workshop',
  'Paint Shop',
  'Piping Shop',
  'Welding Bay',
  'Stores & Warehouse',
  'Quayside / Berth',
  'Isandlwana Project',
  'HSV Project',
  'Port Facility',
  'Main Office Block',
  'Yard Perimeter'
];

export const ISSUERS = [
  'Davan Naidoo (H&S Supervisor)',
  'Donaseelan Manickum (Safety Officer: MRO)',
  'Johnson Chirong Menza (Jr Safety Officer)',
  'Sizwe Mtshali (Jr Safety Officer)',
  'Noxolo Mkhwanazi (SHERQ Manager)',
  'Don Khumalo (BU Head: SHERQ)'
];

export function getDefaultStore(): AppStore {
  return {
    version: 8,
    departments: DEPARTMENTS_SEED,
    people: PEOPLE_SEED,
    flags: [],
    escalations: [],
    settings: {
      hrEmail: 'HR@sas.co.za',
      demoDismissed: false,
      auth: {
        admins: [
          { email: 'petersm@sas.co.za', name: 'Peter Small', hash: null },
          { email: 'NandiL@sas.co.za', name: 'Nandi Luthuli', hash: null }
        ],
        lock: { fails: 0, until: 0 }
      }
    }
  };
}
