import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/data/shipments";
import { MonthlyWeight } from "@/types/company";

interface MonthlyRow {
  month: string;
  kg: number;
  min_date: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: MonthlyWeight[] } | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const monthly = await query<MonthlyRow>(`
      SELECT 
        strftime(shipment_date::DATE, '%b %Y') as month,
        SUM(weight_metric_tonnes * 1000) as kg,
        MIN(shipment_date) as min_date
      FROM shipments
      GROUP BY strftime(shipment_date::DATE, '%b %Y')
      ORDER BY min_date
    `);

    res.status(200).json({
      data: monthly.map((m) => ({
        month: m.month,
        kg: Number(m.kg),
      })),
    });
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    res.status(500).json({ error: "Failed to fetch monthly data" });
  }
}
