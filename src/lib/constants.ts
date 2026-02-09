export interface Region {
  name: string;
  target: number;
}

export interface KPI {
  id: string;
  name: string;
  category: string;
  annualGoal: number;
  regions: Region[];
}

export const KPI_DATA: KPI[] = [
  {
    id: "digitally-trained",
    name: "Digitally Trained",
    category: "PROGRAMS",
    annualGoal: 10492,
    regions: [
      { name: "Nairobi/Central KE", target: 75 },
      { name: "Coastal KE", target: 64 },
      { name: "Uganda", target: 5 },
      { name: "Northern TZ", target: 21 },
      { name: "Eastern KE", target: 5 },
      { name: "Western KE", target: 43 },
    ],
  },
  {
    id: "somo-academy",
    name: "Somo Academy",
    category: "PROGRAMS",
    annualGoal: 2232,
    regions: [
      { name: "Nairobi/Central KE", target: 14 },
      { name: "Northern TZ", target: 9 },
      { name: "Coastal KE", target: 14 },
      { name: "Uganda", target: 5 },
      { name: "Western KE", target: 5 },
    ],
  },
  {
    id: "businesses-invested",
    name: "Businesses invested (New Loans)",
    category: "INVESTMENTS",
    annualGoal: 576,
    regions: [
      { name: "Nairobi / Central KE", target: 4 },
      { name: "Western KE", target: 2 },
      { name: "Coastal KE", target: 4 },
      { name: "Northern TZ", target: 1 },
    ],
  },
];

export const WEEKS = Array.from({ length: 47 }, (_, i) => i + 1);
