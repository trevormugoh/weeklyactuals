export interface Region {
  name: string;
  target: number;
}

export interface KPI {
  id: string;
  name: string;
  category: string;
  unit: "number" | "currency";
  annualGoal: number;
  regions: Region[];
}

export const KPI_DATA: KPI[] = [
  {
    id: "digitally-trained",
    name: "Digitally Trained",
    category: "PROGRAMS",
    unit: "number",
    annualGoal: 10492,
    regions: [
      { name: "Nairobi / Central KE", target: 75 },
      { name: "Western KE", target: 43 },
      { name: "Coastal KE", target: 64 },
      { name: "Northern TZ", target: 21 },
      { name: "Uganda", target: 5 },
      { name: "Eastern KE", target: 5 },
    ],
  },
  {
    id: "somo-academy",
    name: "Somo Academy",
    category: "PROGRAMS",
    unit: "number",
    annualGoal: 2232,
    regions: [
      { name: "Nairobi / Central KE", target: 14 },
      { name: "Western KE", target: 5 },
      { name: "Coastal KE", target: 14 },
      { name: "Northern TZ", target: 9 },
      { name: "Uganda", target: 5 },
    ],
  },
  {
    id: "businesses-invested-loans",
    name: "Businesses invested (Loans)",
    category: "INVESTMENTS",
    unit: "number",
    annualGoal: 402,
    regions: [
      { name: "Nairobi / Central KE", target: 3 },
      { name: "Western KE", target: 3 },
      { name: "Coastal KE", target: 2 },
      { name: "Northern TZ", target: 1 },
      { name: "Northern UG", target: 1 },
    ],
  },
  {
    id: "financing-accessed-loans",
    name: "Financing Accessed (Loans)",
    category: "INVESTMENTS",
    unit: "currency",
    annualGoal: 573324,
    regions: [
      { name: "Nairobi / Central KE", target: 3822 },
      { name: "Western KE", target: 3822 },
      { name: "Coastal KE", target: 2548 },
      { name: "Northern TZ", target: 1274 },
      { name: "Northern UG", target: 1274 },
    ],
  },
  {
    id: "repayments",
    name: "Repayments",
    category: "INVESTMENTS",
    unit: "currency",
    annualGoal: 260618,
    regions: [
      { name: "Nairobi / Central KE", target: 1737 },
      { name: "Western KE", target: 1737 },
      { name: "Coastal KE", target: 1158 },
      { name: "Northern TZ", target: 579 },
      { name: "Northern UG", target: 579 },
    ],
  },
  {
    id: "businesses-invested-grants",
    name: "Businesses invested (Grants)",
    category: "GRANTS",
    unit: "number",
    annualGoal: 174,
    regions: [
      { name: "Nairobi / Central KE", target: 4 },
      { name: "Western KE", target: 2 },
      { name: "Coastal KE", target: 4 },
      { name: "Northern TZ", target: 1 },
      { name: "Northern UG", target: 1 },
    ],
  },
  {
    id: "financing-accessed-grants",
    name: "Financing Accessed (Grants)",
    category: "GRANTS",
    unit: "currency",
    annualGoal: 92582,
    regions: [
      { name: "Nairobi / Central KE", target: 3510 },
      { name: "Western KE", target: 2340 },
      { name: "Coastal KE", target: 3510 },
      { name: "Northern TZ", target: 1170 },
      { name: "Northern UG", target: 1170 },
    ],
  },
];

export const WEEKS = Array.from({ length: 47 }, (_, i) => i + 1);
