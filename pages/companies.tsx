import { useState } from "react";
import useSWR from "swr";
import Navigation from "@/components/Navigation";
import CompanyDetail from "@/components/CompanyDetail";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Company,
  GlobalStats,
  TopCommodity,
  MonthlyWeight,
} from "@/types/company";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PaginatedCompanies {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<{
    name: string;
    role: "importer" | "exporter";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const limit = 20;

  const { data: countriesData } = useSWR<{ data: string[] }>(
    "/api/companies/countries",
    fetcher
  );
  const countries = countriesData?.data || [];

  const { data: statsData, isLoading: statsLoading } = useSWR<GlobalStats>(
    "/api/analytics/stats",
    fetcher
  );

  const { data: commoditiesData, isLoading: commoditiesLoading } = useSWR<{
    data: TopCommodity[];
  }>("/api/analytics/commodities", fetcher);

  const { data: monthlyData, isLoading: monthlyLoading } = useSWR<{
    data: MonthlyWeight[];
  }>("/api/analytics/monthly", fetcher);

  const buildCompaniesUrl = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (countryFilter) params.set("country", countryFilter);
    return `/api/companies?${params.toString()}`;
  };

  const { data: companiesData, isLoading: companiesLoading } = useSWR<PaginatedCompanies>(
    buildCompaniesUrl(),
    fetcher
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setRoleFilter("");
    setCountryFilter("");
    setPage(1);
  };

  const stats = statsData || { totalImporters: 0, totalExporters: 0 };
  const topCommodities = commoditiesData?.data || [];
  const monthlyKg = monthlyData?.data || [];
  const companies = companiesData?.data || [];
  const totalPages = companiesData?.totalPages || 1;
  const totalCompanies = companiesData?.total || 0;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Companies Overview
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Companies Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                Total Companies
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {statsLoading ? "..." : stats.totalImporters.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Importers
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {statsLoading ? "..." : stats.totalExporters.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Exporters
                  </p>
                </div>
              </div>
            </div>

            {/* Top Commodities Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                Top 5 Commodities by Weight
              </h2>
              <div className="space-y-3">
                {commoditiesLoading ? (
                  <p className="text-sm text-zinc-500">Loading...</p>
                ) : (
                  topCommodities.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-zinc-400 dark:text-zinc-600">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {item.commodity}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {(item.kg / 1000).toFixed(0)}k kg
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Monthly KG Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
              Total Weight Shipped per Month (kg)
            </h2>
            <div className="h-64">
              {monthlyLoading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyKg}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="month"
                      stroke="#71717a"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#71717a"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "6px",
                        color: "#fafafa",
                      }}
                      formatter={(value) => [
                        `${Number(value).toLocaleString()} kg`,
                        "Weight",
                      ]}
                    />
                    <Bar dataKey="kg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Master-Detail: Company List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company List (Left/Main) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg shadow">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      Company List
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Click a company to view details
                    </p>
                  </div>
                  {(search || roleFilter || countryFilter) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search company name..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 px-3 py-2 text-sm rounded-l border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-r hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="importer">Importers</option>
                    <option value="exporter">Exporters</option>
                  </select>
                  <select
                    value={countryFilter}
                    onChange={(e) => {
                      setCountryFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Company Name
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Country
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Shipments
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Total Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companiesLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-sm text-zinc-500 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      companies.map((company, idx) => (
                        <tr
                          key={`${company.name}-${company.role}-${idx}`}
                          onClick={() =>
                            setSelectedCompany({ name: company.name, role: company.role })
                          }
                          className={`border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors ${
                            selectedCompany?.name === company.name &&
                            selectedCompany?.role === company.role
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                            <span>{company.name}</span>
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {company.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {company.country}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50 text-right">
                            {Number(company.total_shipments).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                            {(Number(company.total_weight) * 1000).toLocaleString()} kg
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Showing {companies.length} of {totalCompanies} companies
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Company Detail Panel (Right) */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
              <CompanyDetail
                companyName={selectedCompany?.name || null}
                companyRole={selectedCompany?.role || "importer"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
