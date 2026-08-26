/**
 * Platform-level enterprise/workspace records for the super-admin
 * "All Enterprises" management view. Prototype seed data.
 */
export interface Enterprise {
  id: string;
  name: string;
  /** Subdomain / handle shown under the name. */
  domain: string;
  email: string;
  /** Office location; empty string renders as "--". */
  location: string;
  /** ISO joined date. */
  joined: string;
  users: number;
  jobs: number;
  candidates: number;
  active: boolean;
}

export const MOCK_ENTERPRISES: Enterprise[] = [
  { id: "ent-1", name: "cyber pearl", domain: "cyberpearl", email: "shashidhar.marupaka+39@zessta.com", location: "", joined: "2026-07-30", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-2", name: "BNN", domain: "bnn.test.co", email: "santanu.pradhan+bnnadminemail@zessta.com", location: "Bangalore", joined: "2026-07-27", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-3", name: "PineLabs", domain: "pinelabs.com", email: "nagaraju.korikana+6@zessta.com", location: "Hyderabad", joined: "2026-07-27", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-4", name: "CNN Enterprise Test", domain: "cnn.test.co", email: "santanu.pradhan+cnnentptest@zessta.com", location: "Bangalore", joined: "2026-07-27", users: 1, jobs: 1, candidates: 0, active: true },
  { id: "ent-5", name: "NextWave", domain: "accounts.ccbp.in", email: "nagarajukorikana225@gmail.com", location: "Hyderabad", joined: "2026-07-24", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-6", name: "NPP", domain: "NPP.com", email: "santanu.pradhan+NPP@zessta.com", location: "India", joined: "2026-07-21", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-7", name: "KPP", domain: "KPP.com", email: "santanu.pradhan+KPP@zessta.com", location: "India", joined: "2026-07-21", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-8", name: "dfesrtrhrreweewfewf", domain: "efewrftryretrf", email: "trgerawer@gmail.com", location: "ertrfrehnyrehtegrsrt", joined: "2026-07-10", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-9", name: "Kafka", domain: "kafka.com", email: "rsadferfre2423424@gmail.com", location: "California", joined: "2026-07-10", users: 1, jobs: 0, candidates: 0, active: true },
  { id: "ent-10", name: "RedBrick", domain: "redbrick.io", email: "accounts+redbrick@zessta.com", location: "Pune", joined: "2026-07-09", users: 3, jobs: 2, candidates: 14, active: true },
  { id: "ent-11", name: "Skyline HR", domain: "skyline.co", email: "admin@skyline.co", location: "Chennai", joined: "2026-07-05", users: 5, jobs: 4, candidates: 32, active: true },
  { id: "ent-12", name: "Northwind", domain: "northwind.test", email: "ops@northwind.test", location: "London", joined: "2026-06-28", users: 2, jobs: 1, candidates: 6, active: false },
  { id: "ent-13", name: "Acme Corp", domain: "acme.example", email: "it@acme.example", location: "New York", joined: "2026-06-20", users: 8, jobs: 6, candidates: 41, active: true },
  { id: "ent-14", name: "Globex", domain: "globex.io", email: "hr@globex.io", location: "Berlin", joined: "2026-06-14", users: 4, jobs: 3, candidates: 19, active: false },
  { id: "ent-15", name: "Initech", domain: "initech.co", email: "admin@initech.co", location: "Bangalore", joined: "2026-06-02", users: 6, jobs: 5, candidates: 27, active: true },
  { id: "ent-16", name: "Umbrella", domain: "umbrella.test", email: "root@umbrella.test", location: "", joined: "2026-05-19", users: 1, jobs: 0, candidates: 0, active: false },
];
