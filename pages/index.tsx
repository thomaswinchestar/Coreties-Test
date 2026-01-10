import useSWR from "swr";
import { Shipment } from "@/types/shipment";
import Navigation from "@/components/Navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: response, error, isLoading } = useSWR<{ data: Shipment[]; total: number }>("/api/shipments", fetcher);

  const shipments = response?.data;

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-600 dark:text-zinc-400">Loading shipments...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Shipments
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Total shipments: {response?.total.toLocaleString() ?? 0}
          </p>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Importer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Exporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Commodity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Weight (MT)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {shipments?.slice(0, 100).map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {shipment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {shipment.importer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {shipment.importer_country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {shipment.exporter_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {shipment.shipment_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {shipment.commodity_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {shipment.weight_metric_tonnes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {response && response.total > 100 && (
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing first 100 of {response.total.toLocaleString()} shipments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
