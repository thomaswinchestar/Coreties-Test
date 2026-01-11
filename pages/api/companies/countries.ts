import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/data/shipments";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: string[] } | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const countries = await query<{ country: string }>(`
      SELECT DISTINCT country FROM (
        SELECT importer_country as country FROM shipments
        UNION
        SELECT exporter_country as country FROM shipments
      )
      ORDER BY country
    `);

    res.status(200).json({
      data: countries.map((c) => c.country).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
}
