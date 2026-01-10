/**
 * Company interface for company-level analytics.
 */
export interface Company {
  name: string;
  country: string;
  role: "importer" | "exporter";
  total_shipments: number;
  total_weight: number;
}

export interface CompanyDetail {
  name: string;
  country: string;
  website: string | null;
  role: "importer" | "exporter";
  totalShipments: number;
  totalWeight: number;
  topTradingPartners: TradingPartner[];
  topCommodities: Commodity[];
}

export interface TradingPartner {
  name: string;
  country: string;
  shipments: number;
}

export interface Commodity {
  name: string;
  weight: number;
}

export interface GlobalStats {
  totalImporters: number;
  totalExporters: number;
}

export interface TopCommodity {
  commodity: string;
  kg: number;
}

export interface MonthlyWeight {
  month: string;
  kg: number;
}
