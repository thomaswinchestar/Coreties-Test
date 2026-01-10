import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/data/shipments";
import { GlobalStats } from "@/types/company";

interface StatsRow {
  total_importers: number;
  total_exporters: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GlobalStats | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const stats = await query<StatsRow>(`
      SELECT 
        COUNT(DISTINCT importer_name) as total_importers,
        COUNT(DISTINCT exporter_name) as total_exporters
      FROM shipments
    `);

    res.status(200).json({
      totalImporters: Number(stats[0].total_importers),
      totalExporters: Number(stats[0].total_exporters),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
