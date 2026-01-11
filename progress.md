# Coreties Technical Test - Implementation Progress

**Project:** Shipment Analytics Dashboard  
**Completed:** January 11, 2026  
**GitHub:** https://github.com/thomaswinchestar/Coreties-Test

---

## Overview

Full-stack analytics dashboard transforming shipment data into company insights using DuckDB SQL, Next.js API routes, and React with SWR.

---

## Implementation Steps

### 1. Type Definitions

**File:** `types/company.ts`

Created TypeScript interfaces for type-safe data flow:
- `Company` - name, country, role, shipments, weight
- `CompanyDetail` - extended with trading partners and commodities
- `GlobalStats`, `TopCommodity`, `MonthlyWeight` - analytics types

---

### 2. API Endpoints

| Endpoint | Purpose | Query Params |
|----------|---------|--------------|
| `/api/companies` | Paginated company list | `page`, `limit`, `search`, `role`, `country` |
| `/api/companies/[name]` | Company detail | `role` |
| `/api/companies/countries` | Unique countries list | - |
| `/api/analytics/stats` | Importer/exporter counts | - |
| `/api/analytics/commodities` | Top 5 commodities | - |
| `/api/analytics/monthly` | Monthly weight totals | - |

**Key SQL Pattern** - UNION ALL to combine importers/exporters:
```sql
SELECT name, country, role, COUNT(*) as total_shipments
FROM (
  SELECT importer_name as name, 'importer' as role FROM shipments
  UNION ALL
  SELECT exporter_name as name, 'exporter' as role FROM shipments
)
GROUP BY name, country, role
```

---

### 3. Frontend Integration

**Files Modified:**
- `pages/companies.tsx` - Replaced all FAKE data with SWR hooks
- `components/CompanyDetail.tsx` - Real data fetching with loading states

**Features:**
- SWR for data fetching with automatic caching
- Loading and error states throughout
- Pagination (20 per page, 17 pages total)
- Company selection updates detail panel

---

### 4. Search & Filter (Bonus)

Added search and filter functionality to company list:

- **Search**: Case-insensitive company name search
- **Role Filter**: All / Importers / Exporters dropdown
- **Country Filter**: Populated from `/api/companies/countries`
- **Clear Filters**: One-click reset button

API supports combined filters:
```
/api/companies?search=bosch&role=importer&country=US
```

---

### 5. Bug Fixes

**Company Website Link Fix:**
- Added `target="_blank"` to open external links in new tab
- Added `rel="noopener noreferrer"` for security
- Auto-prefix `https://` for URLs missing protocol

---

## Files Summary

**Created (8 files):**
- `pages/api/companies/index.ts` - Company list with pagination & filters
- `pages/api/companies/[name].ts` - Company detail
- `pages/api/companies/countries.ts` - Countries list for filter
- `pages/api/analytics/stats.ts` - Global statistics
- `pages/api/analytics/commodities.ts` - Top commodities
- `pages/api/analytics/monthly.ts` - Monthly data
- `types/company.ts` - TypeScript interfaces

**Modified (2 files):**
- `pages/companies.tsx` - Full page rewrite with real data
- `components/CompanyDetail.tsx` - SWR integration

---

## Results

| Metric | Value |
|--------|-------|
| Total Companies | 329 (218 importers, 100 exporters) |
| Pagination | 17 pages at 20/page |
| Top Commodity | Diesel Cars (27,325 metric tonnes) |
| Date Range | Nov 2022 - Dec 2025 (38 months) |
| Response Times | < 100ms (in-memory DuckDB) |

---

## Data Note

**Why 329 companies vs 318 (218+100)?**

- Stats card counts **unique company names** per role
- Company list groups by **name + country + role**
- 11 companies have different country values across shipments
- This is intentional: companies may operate from multiple countries

---

## Checklist Status

- ✅ Define `Company` interface in `types/company.ts`
- ✅ Implement SQL-based data transformation
- ✅ Create API endpoints in `pages/api/`
- ✅ Wire up "Total Companies" card
- ✅ Wire up "Top 5 Commodities" card
- ✅ Wire up "Monthly Volume" chart
- ✅ Display company list table with real data
- ✅ Implement company detail panel
- ✅ **Bonus:** Pagination
- ✅ **Bonus:** Search & Filter
