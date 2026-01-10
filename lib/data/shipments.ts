import path from "path";
import { DuckDBInstance } from "@duckdb/node-api";
import { Shipment } from "@/types/shipment";
import { Company } from "@/types/company";

let instance: DuckDBInstance | null = null;
let tableInitialized = false;

async function getInstance(): Promise<DuckDBInstance> {
  if (!instance) {
    instance = await DuckDBInstance.create(":memory:");
  }
  return instance;
}

/**
 * Loads shipment data with pagination.
 */
export async function loadShipments(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: Shipment[]; total: number }> {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  const countResult = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM shipments`
  );
  const total = countResult[0]?.total ?? 0;

  const data = await query<Shipment>(`
    SELECT * FROM shipments
    ORDER BY shipment_date DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return { data, total };
}

/**
 * TODO: Implement this function using SQL.
 *
 * Transform shipment data into company-level aggregates.
 * Your SQL should match the Company interface you define in types/company.ts
 */
export async function transformShipmentsToCompanies(): Promise<Company[]> {
  // TODO: Implement SQL-based transformation
  return [];
}

/**
 * Initializes the `shipments` table from JSON data.
 * This is called automatically before queries, so you can simply write:
 *
 * ```sql
 * SELECT * FROM shipments
 * ```
 */
async function ensureTableInitialized(): Promise<void> {
  if (tableInitialized) return;

  const db = await getInstance();
  const connection = await db.connect();
  const filePath = path.join(process.cwd(), "data", "shipments.json");

  await connection.run(`
    CREATE TABLE IF NOT EXISTS shipments AS
    SELECT * FROM read_json_auto('${filePath}')
  `);

  connection.closeSync();
  tableInitialized = true;
}

/**
 * Execute a SQL query and return the results as an array of objects.
 * The `shipments` table is automatically available — no need for read_json_auto.
 *
 * Example usage:
 * ```ts
 * const results = await query<{ name: string; total: number }>(`
 *   SELECT importer_name as name, COUNT(*) as total
 *   FROM shipments
 *   GROUP BY importer_name
 * `);
 * ```
 */
export async function query<T>(sql: string): Promise<T[]> {
  await ensureTableInitialized();

  const db = await getInstance();
  const connection = await db.connect();

  const reader = await connection.runAndReadAll(sql);
  const rows = reader.getRowObjectsJson();
  connection.closeSync();

  return rows as unknown as T[];
}
