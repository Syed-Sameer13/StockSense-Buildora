import { useEffect, useState } from "react";
import {
  ClipboardEdit,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  FileCheck,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [productId, setProductId] = useState("");
  const [warehouseName, setWarehouseName] = useState("Main Warehouse");
  const [locationName, setLocationName] = useState("Ground Floor // Rack A");
  const [recordedQty, setRecordedQty] = useState(0);
  const [countedQty, setCountedQty] = useState(0);
  const [reason, setReason] = useState("Physical Count Mismatch");
  const [notes, setNotes] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [adjList, prodList, whList] = await Promise.all([
        inventoryService.getAdjustments(),
        inventoryService.getProducts(),
        inventoryService.getWarehouses(),
      ]);
      setAdjustments(adjList);
      setProducts(prodList);
      setWarehouses(whList);

      if (prodList.length > 0 && !productId) {
        const p = prodList[0];
        setProductId(p.id);
        setRecordedQty(Number(p.stock_quantity || 0));
        setCountedQty(Number(p.stock_quantity || 0));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleProductSelect(id) {
    setProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      const stock = Number(prod.stock_quantity || 0);
      setRecordedQty(stock);
      setCountedQty(stock);
    }
  }

  async function handleCreateAdjustment(e) {
    e.preventDefault();
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      alert("Please select a valid product.");
      return;
    }

    const diff = Number(countedQty) - Number(recordedQty);
    if (diff === 0) {
      alert("Counted quantity is identical to recorded stock (no discrepancy detected).");
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.createAndValidateAdjustment({
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        warehouse_name: warehouseName,
        location_name: locationName,
        recorded_qty: recordedQty,
        counted_qty: countedQty,
        unit: prod.unit || "pcs",
        reason,
        notes,
      });

      setModalOpen(false);
      setNotes("");
      await loadData();
    } catch (err) {
      alert("Adjustment failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProd = products.find((p) => p.id === productId);
  const diffQty = Number(countedQty) - Number(recordedQty);

  const filteredAdjustments = adjustments.filter((a) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      a.adjustment_number.toLowerCase().includes(query) ||
      a.product_name.toLowerCase().includes(query) ||
      a.sku.toLowerCase().includes(query) ||
      a.reason.toLowerCase().includes(query) ||
      a.warehouse_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border border-[#09090B] bg-white p-5 hard-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#4F46E5]" />
            <p className="font-mono text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              INVENTORY AUDIT // RECONCILIATION
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Stock Adjustments
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Resolve mismatches between physical stock counts and system records with delta accounting.
          </p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0) {
              handleProductSelect(products[0].id);
            }
            setModalOpen(true);
          }}
          className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
        >
          <Plus size={15} />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="border border-[#E2E8F0] bg-white p-4 font-mono text-xs">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search adjustment #, SKU, reason, facility..."
            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ClipboardEdit size={15} className="text-[#4F46E5]" />
            <span className="font-bold text-[#09090B] uppercase">
              Adjustment Audit Log ({filteredAdjustments.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">Adjustment #</th>
                <th className="px-4 py-2.5">Product SKU</th>
                <th className="px-4 py-2.5">Facility / Location</th>
                <th className="px-4 py-2.5">Recorded</th>
                <th className="px-4 py-2.5">Counted</th>
                <th className="px-4 py-2.5">Discrepancy (Δ)</th>
                <th className="px-4 py-2.5">Reason Code</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#71717A]">
                    Fetching physical count reconciliation ledger...
                  </td>
                </tr>
              ) : filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#71717A]">
                    No stock adjustments recorded.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const isNegative = adj.difference_qty < 0;
                  const isPositive = adj.difference_qty > 0;

                  return (
                    <tr
                      key={adj.id}
                      className="hover:bg-[#EEF2FF]/40 transition-colors group"
                    >
                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        <span className="underline decoration-dotted">
                          {adj.adjustment_number}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-[#09090B]">
                        {adj.product_name}{" "}
                        <span className="text-[#71717A] font-mono">[{adj.sku}]</span>
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        {adj.warehouse_name} // {adj.location_name}
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        {adj.recorded_qty}
                      </td>

                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        {adj.counted_qty}
                      </td>

                      <td className="px-4 py-3 font-bold">
                        <span
                          className={`px-2 py-0.5 border ${
                            isNegative
                              ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                              : isPositive
                              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {isPositive ? `+${adj.difference_qty}` : adj.difference_qty}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#09090B] font-medium">
                        {adj.reason}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <StatusBadge status="DONE" size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADJUSTMENT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="RECONCILE PHYSICAL INVENTORY COUNT"
        subtitle="Auto-corrects system balance and commits delta to audit trail"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Select Product SKU *
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku}] - Recorded Stock: {p.stock_quantity} {p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Warehouse Facility
              </label>
              <select
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Specific Rack / Bin
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Ground Floor // Rack A"
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* REAL-TIME DELTA TELEMETRY BOX */}
          <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
            <span className="font-bold uppercase text-[10px] text-[#71717A]">
              Physical Count & Delta Calculator:
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                  System Recorded
                </label>
                <div className="p-2 bg-[#F1F5F9] border border-[#CBD5E1] font-bold text-sm text-[#09090B]">
                  {recordedQty} {selectedProd?.unit}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#4F46E5] uppercase font-bold mb-0.5">
                  Physical Count *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={countedQty}
                  onChange={(e) => setCountedQty(e.target.value)}
                  className="w-full bg-white border border-[#4F46E5] p-2 text-sm font-bold text-[#09090B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                  Inventory Delta (Δ)
                </label>
                <div
                  className={`p-2 border font-bold text-sm ${
                    diffQty < 0
                      ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                      : diffQty > 0
                      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      : "bg-white text-[#71717A] border-[#CBD5E1]"
                  }`}
                >
                  {diffQty > 0 ? `+${diffQty}` : diffQty} {selectedProd?.unit}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Discrepancy Reason Code *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="Damaged Goods">Damaged Goods (Defective / Broken)</option>
              <option value="Physical Count Mismatch">Physical Count Mismatch (Cycle Audit)</option>
              <option value="Cycle Count Correction">Cycle Count Correction</option>
              <option value="Theft / Unexplained Loss">Theft / Unexplained Shrinkage</option>
              <option value="Expired Stock">Expired / Obsolete Material</option>
              <option value="Initial Calibration">Initial Warehouse Calibration</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Audit Note / Investigation Memo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 3 kg steel rod section damaged during crane unloading"
              className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-[#CBD5E1] bg-white text-[#09090B] font-semibold uppercase text-xs hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || diffQty === 0}
              className="px-5 py-2 border border-[#4F46E5] bg-[#4F46E5] text-white font-semibold uppercase text-xs hover:bg-[#4338CA] disabled:opacity-50"
            >
              {submitting ? "Reconciling..." : "Commit Stock Adjustment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
