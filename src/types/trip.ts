export interface Trip {
  id?: string;
  title: string;
  startLocation?: string;
  destination: string;
  country?: string;
  city?: string;
  startDate: string;
  endDate: string;
  budget: number;
  userId: string;
}

