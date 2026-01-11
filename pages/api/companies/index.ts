import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/data/shipments";
import { Company } from "@/types/company";

interface PaginatedResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  
  const search = (req.query.search as string || "").trim();
  const roleFilter = req.query.role as string || "";
  const countryFilter = req.query.country as string || "";

  const buildWhereClause = () => {
    const conditions: string[] = [];
    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      conditions.push(`LOWER(name) LIKE LOWER('%${escapedSearch}%')`);
    }
    if (roleFilter && (roleFilter === "importer" || roleFilter === "exporter")) {
      conditions.push(`role = '${roleFilter}'`);
    }
    if (countryFilter) {
      const escapedCountry = countryFilter.replace(/'/g, "''");
      conditions.push(`country = '${escapedCountry}'`);
    }
    return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  };

  const whereClause = buildWhereClause();

  try {
    const countResult = await query<{ total: number }>(`
      SELECT COUNT(*) as total FROM (
        SELECT 
          name,
          country,
          role
        FROM (
          SELECT importer_name as name, importer_country as country, 'importer' as role FROM shipments
          GROUP BY importer_name, importer_country
          UNION ALL
          SELECT exporter_name as name, exporter_country as country, 'exporter' as role FROM shipments
          GROUP BY exporter_name, exporter_country
        )
        ${whereClause}
      )
    `);
    const total = Number(countResult[0]?.total ?? 0);

    const companies = await query<Company>(`
      SELECT 
        name,
        country,
        role,
        total_shipments,
        total_weight
      FROM (
        SELECT 
          name,
          country,
          role,
          COUNT(*) as total_shipments,
          SUM(weight_metric_tonnes) as total_weight
        FROM (
          SELECT importer_name as name, importer_country as country, 'importer' as role, weight_metric_tonnes FROM shipments
          UNION ALL
          SELECT exporter_name as name, exporter_country as country, 'exporter' as role, weight_metric_tonnes FROM shipments
        )
        GROUP BY name, country, role
      )
      ${whereClause}
      ORDER BY total_shipments DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    res.status(200).json({
      data: companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
}
