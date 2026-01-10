import type { NextApiRequest, NextApiResponse } from "next";
import { loadShipments } from "@/lib/data/shipments";
import { Shipment } from "@/types/shipment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: Shipment[]; total: number }>
) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const result = await loadShipments({limit: 100, offset: 0});
  res.status(200).json(result);
}
