import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/data/shipments";
import { TopCommodity } from "@/types/company";

interface CommodityRow {
  commodity_name: string;
  kg: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: TopCommodity[] } | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const commodities = await query<CommodityRow>(`
      SELECT 
        commodity_name,
        SUM(weight_metric_tonnes * 1000) as kg
      FROM shipments
      GROUP BY commodity_name
      ORDER BY kg DESC
      LIMIT 5
    `);

    res.status(200).json({
      data: commodities.map((c) => ({
        commodity: c.commodity_name,
        kg: Number(c.kg),
      })),
    });
  } catch (error) {
    console.error("Error fetching commodities:", error);
    res.status(500).json({ error: "Failed to fetch commodities" });
  }
}
