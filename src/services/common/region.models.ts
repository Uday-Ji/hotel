export interface Region {
  regionId: number;
  regionName: string;
  regionCode: string;
  isActive: boolean;
}

export interface Country {
  countryId: number;
  countryCode: string;
  countryName: string;
  regionId: number;
  isActive: boolean;
}

export interface HolidayCategory {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  language?: string;
  status?: string;
  isActive: boolean;
}