import { useEffect, useMemo, useState } from "react";
import {
  History,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  Layers,
  ArrowDownLeft,
  ArrowUpRight as ArrowOut,
  ArrowLeftRight,
  ClipboardCheck,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import StatusBadge from "../components/StatusBadge";

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [ledList, prodList] = await Promise.all([
        inventoryService.getLedgerEntries(),
        inventoryService.getProducts(),
      ]);
      setEntries(ledList);
      setProducts(prodList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        e.reference_number?.toLowerCase().includes(query) ||
        e.product_name?.toLowerCase().includes(query) ||
        e.sku?.toLowerCase().includes(query) ||
        e.from_location?.toLowerCase().includes(query) ||
        e.to_location?.toLowerCase().includes(query) ||
        e.operator?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" || e.document_type === typeFilter;

      const matchesProduct =
        productFilter === "ALL" || e.product_id === productFilter;

      return matchesSearch && matchesType && matchesProduct;
    });
  }, [entries, search, typeFilter, productFilter]);

  function exportCSV() {
    if (filteredEntries.length === 0) return;
    const headers = [
      "Timestamp",
      "Reference",
      "Document Type",
      "Product Name",
      "SKU",
      "From Location",
      "To Location",
      "Delta Qty",
      "Stock Balance After",
      "Unit",
      "Operator",
      "Notes",
    ];

    const rows = filteredEntries.map((e) => [
      `"${new Date(e.created_at).toISOString()}"`,
      `"${e.reference_number}"`,
      `"${e.document_type}"`,
      `"${e.product_name}"`,
      `"${e.sku}"`,
      `"${e.from_location}"`,
      `"${e.to_location}"`,
      e.quantity_delta,
      e.stock_after,
      `"${e.unit}"`,
      `"${e.operator}"`,
      `"${e.notes?.replace(/"/g, '""') || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `StockSense_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border border-[#09090B] bg-white p-5 hard-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#4F46E5]" />
            <p className="font-mono text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              IMMUTABLE AUDIT TRAIL // MOVE HISTORY
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Stock Ledger & Audit Logs
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Complete cryptographic audit log of all receipts, shipments, transfers, and reconciliations.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="border border-[#09090B] bg-white hover:bg-[#F8FAFC] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#09090B] flex items-center gap-2 transition-colors"
        >
          <Download size={14} />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="border border-[#E2E8F0] bg-white p-4 font-mono text-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference #, SKU, location, operator..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Operation Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">Operation Type: All Events</option>
              <option value="RECEIPT">RECEIPT (Vendor Inbound)</option>
              <option value="DELIVERY">DELIVERY (Customer Outbound)</option>
              <option value="TRANSFER">TRANSFER (Internal Relocation)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Audit Reconciliation)</option>
              <option value="INITIAL">INITIAL (Opening Balance)</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">Product SKU: All Inventory</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LEDGER DATA TABLE */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <History size={15} className="text-[#4F46E5]" />
            <span className="font-bold text-[#09090B] uppercase">
              Audit Stream ({filteredEntries.length} Records)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Reference #</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Product SKU</th>
                <th className="px-4 py-2.5">Origin → Target Routing</th>
                <th className="px-4 py-2.5 text-right">Delta (Δ)</th>
                <th className="px-4 py-2.5 text-right">Balance After</th>
                <th className="px-4 py-2.5">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#71717A]">
                    Replaying immutable stock ledger...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#71717A]">
                    No ledger records match criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isPositive = entry.quantity_delta > 0;
                  const isNegative = entry.quantity_delta < 0;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#EEF2FF]/40 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-[#71717A] whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>

                      {/* Reference */}
                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        <span className="underline decoration-dotted">
                          {entry.reference_number}
                        </span>
                      </td>

                      {/* Document Type */}
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={entry.document_type}
                          type="doc"
                          size="sm"
                        />
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3 font-semibold text-[#09090B]">
                        {entry.product_name}{" "}
                        <span className="text-[#71717A] font-mono">[{entry.sku}]</span>
                      </td>

                      {/* Routing */}
                      <td className="px-4 py-3 text-[#71717A]">
                        <span className="text-[#09090B] font-medium">
                          {entry.from_location}
                        </span>{" "}
                        →{" "}
                        <span className="text-[#4F46E5] font-medium">
                          {entry.to_location}
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="px-4 py-3 text-right font-bold">
                        {entry.document_type === "TRANSFER" ? (
                          <span className="text-[#71717A]">
                            ±{entry.movement_quantity || 0} {entry.unit}
                          </span>
                        ) : isPositive ? (
                          <span className="text-[#059669]">
                            +{entry.quantity_delta} {entry.unit}
                          </span>
                        ) : isNegative ? (
                          <span className="text-[#DC2626]">
                            {entry.quantity_delta} {entry.unit}
                          </span>
                        ) : (
                          <span className="text-[#71717A]">
                            0 {entry.unit}
                          </span>
                        )}
                      </td>

                      {/* Balance After */}
                      <td className="px-4 py-3 text-right font-bold text-[#09090B]">
                        {entry.stock_after} {entry.unit}
                      </td>

                      {/* Operator */}
                      <td className="px-4 py-3 text-[#71717A]">
                        {entry.operator || "System"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
