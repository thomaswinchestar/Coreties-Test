import useSWR from "swr";
import { CompanyDetail as CompanyDetailType } from "@/types/company";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CompanyDetailProps {
  companyName: string | null;
  companyRole: "importer" | "exporter";
}

export default function CompanyDetail({ companyName, companyRole }: CompanyDetailProps) {
  const { data: detail, error, isLoading } = useSWR<CompanyDetailType>(
    companyName
      ? `/api/companies/${encodeURIComponent(companyName)}?role=${companyRole}`
      : null,
    fetcher
  );

  if (!companyName) {
    return (
      <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
        <p>Select a company to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Failed to load company details</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        {detail.name}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        {detail.country}
      </p>
      {detail.website && (
        <a
          href={detail.website.startsWith("http") ? detail.website : `https://${detail.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 block"
        >
          {detail.website}
        </a>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {detail.totalShipments.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Shipments</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {(detail.totalWeight / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">kg Total</p>
        </div>
      </div>

      {/* Top Trading Partners */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
          Top Trading Partners
        </h3>
        <div className="space-y-2">
          {detail.topTradingPartners.map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="text-zinc-900 dark:text-zinc-50">
                  {partner.name}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {partner.country}
                </span>
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                {partner.shipments}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Commodities */}
      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
          Top Commodities
        </h3>
        <div className="space-y-2">
          {detail.topCommodities.map((commodity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-900 dark:text-zinc-50">
                {commodity.name}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {(commodity.weight / 1000).toFixed(1)}k kg
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
