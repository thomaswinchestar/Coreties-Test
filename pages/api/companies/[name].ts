import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/data/shipments";
import { CompanyDetail, TradingPartner, Commodity } from "@/types/company";

interface CompanyBasicInfo {
  name: string;
  country: string;
  website: string | null;
  role: string;
  total_shipments: number;
  total_weight: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompanyDetail | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, role } = req.query;
  const companyName = decodeURIComponent(name as string);
  const companyRole = (role as string) || "importer";

  try {
    // Get basic company info
    const basicInfoQuery =
      companyRole === "importer"
        ? `
          SELECT 
            importer_name as name,
            importer_country as country,
            MAX(importer_website) as website,
            'importer' as role,
            COUNT(*) as total_shipments,
            SUM(weight_metric_tonnes) as total_weight
          FROM shipments
          WHERE importer_name = '${companyName.replace(/'/g, "''")}'
          GROUP BY importer_name, importer_country
        `
        : `
          SELECT 
            exporter_name as name,
            exporter_country as country,
            MAX(exporter_website) as website,
            'exporter' as role,
            COUNT(*) as total_shipments,
            SUM(weight_metric_tonnes) as total_weight
          FROM shipments
          WHERE exporter_name = '${companyName.replace(/'/g, "''")}'
          GROUP BY exporter_name, exporter_country
        `;

    const basicInfo = await query<CompanyBasicInfo>(basicInfoQuery);

    if (basicInfo.length === 0) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Get top trading partners
    const tradingPartnersQuery =
      companyRole === "importer"
        ? `
          SELECT 
            exporter_name as name,
            exporter_country as country,
            COUNT(*) as shipments
          FROM shipments
          WHERE importer_name = '${companyName.replace(/'/g, "''")}'
          GROUP BY exporter_name, exporter_country
          ORDER BY shipments DESC
          LIMIT 3
        `
        : `
          SELECT 
            importer_name as name,
            importer_country as country,
            COUNT(*) as shipments
          FROM shipments
          WHERE exporter_name = '${companyName.replace(/'/g, "''")}'
          GROUP BY importer_name, importer_country
          ORDER BY shipments DESC
          LIMIT 3
        `;

    const tradingPartners = await query<TradingPartner>(tradingPartnersQuery);

    // Get top commodities
    const commoditiesQuery =
      companyRole === "importer"
        ? `
          SELECT 
            commodity_name as name,
            SUM(weight_metric_tonnes * 1000) as weight
          FROM shipments
          WHERE importer_name = '${companyName.replace(/'/g, "''")}'
          GROUP BY commodity_name
          ORDER BY weight DESC
          LIMIT 3
        `
        : `
          SELECT 
            commodity_name as name,
            SUM(weight_metric_tonnes * 1000) as weight
          FROM shipments
          WHERE exporter_name = '${companyName.replace(/'/g, "''")}'
          GROUP BY commodity_name
          ORDER BY weight DESC
          LIMIT 3
        `;

    const commodities = await query<Commodity>(commoditiesQuery);

    const companyDetail: CompanyDetail = {
      name: basicInfo[0].name,
      country: basicInfo[0].country,
      website: basicInfo[0].website,
      role: companyRole as "importer" | "exporter",
      totalShipments: Number(basicInfo[0].total_shipments),
      totalWeight: Number(basicInfo[0].total_weight) * 1000, // Convert to kg
      topTradingPartners: tradingPartners.map((p) => ({
        ...p,
        shipments: Number(p.shipments),
      })),
      topCommodities: commodities.map((c) => ({
        ...c,
        weight: Number(c.weight),
      })),
    };

    res.status(200).json(companyDetail);
  } catch (error) {
    console.error("Error fetching company detail:", error);
    res.status(500).json({ error: "Failed to fetch company details" });
  }
}
