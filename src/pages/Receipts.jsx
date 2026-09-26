import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Layers,
  Building2,
  UserCheck,
  FileText,
  AlertCircle,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailReceipt, setDetailReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [supplier, setSupplier] = useState("");
  const [warehouseId, setWarehouseId] = useState("wh-1");
  const [locationName, setLocationName] = useState("Receiving Bay 01");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product_id: "", expected_qty: 50, received_qty: 50, unit: "pcs" },
  ]);

  async function loadData() {
    setLoading(true);
    try {
      const [recList, prodList, whList] = await Promise.all([
        inventoryService.getReceipts(),
        inventoryService.getProducts(),
        inventoryService.getWarehouses(),
      ]);
      setReceipts(recList);
      setProducts(prodList);
      setWarehouses(whList);

      if (prodList.length > 0 && !items[0].product_id) {
        setItems([
          {
            product_id: prodList[0].id,
            product_name: prodList[0].name,
            sku: prodList[0].sku,
            expected_qty: 50,
            received_qty: 50,
            unit: prodList[0].unit || "pcs",
          },
        ]);
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

  function handleAddItem() {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        product_id: defaultProd.id,
        product_name: defaultProd.name,
        sku: defaultProd.sku,
        expected_qty: 20,
        received_qty: 20,
        unit: defaultProd.unit || "pcs",
      },
    ]);
  }

  function handleRemoveItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    if (field === "product_id") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index] = {
          ...updated[index],
          product_id: prod.id,
          product_name: prod.name,
          sku: prod.sku,
          unit: prod.unit || "pcs",
        };
      }
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  }

  async function handleCreateReceipt(e) {
    e.preventDefault();
    if (!supplier.trim()) {
      alert("Supplier name is required.");
      return;
    }
    if (items.length === 0) {
      alert("Add at least one product line item.");
      return;
    }

    setSubmitting(true);
    try {
      const wh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
      await inventoryService.createReceipt({
        supplier: supplier.trim(),
        warehouse_id: warehouseId,
        warehouse_name: wh?.name || "Main Warehouse",
        location_name: locationName,
        notes,
        status: "Ready",
        items,
      });

      setModalOpen(false);
      setSupplier("");
      setNotes("");
      await loadData();
    } catch (err) {
      alert("Error creating receipt: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleValidate(receiptId) {
    if (
      !window.confirm(
        "Validate receipt? This will automatically increment product stock levels in the warehouse and commit to the Stock Ledger."
      )
    ) {
      return;
    }

    try {
      await inventoryService.validateReceipt(receiptId);
      await loadData();
      if (detailReceipt?.id === receiptId) {
        setDetailReceipt(null);
      }
    } catch (err) {
      alert("Validation failed: " + err.message);
    }
  }

  const filteredReceipts = receipts.filter((r) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      r.receipt_number.toLowerCase().includes(query) ||
      r.supplier.toLowerCase().includes(query) ||
      r.warehouse_name.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border border-[#09090B] bg-white p-5 hard-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#4F46E5]" />
            <p className="font-mono text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              INBOUND LOGISTICS // VENDOR RECEIPTS
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Goods Receipts (Stock In)
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Log incoming vendor deliveries, verify quantities, and validate auto-stock increments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
        >
          <Plus size={15} />
          <span>New Goods Receipt</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="border border-[#E2E8F0] bg-white p-4 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipt #, supplier, warehouse..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">Status: All Receipts</option>
              <option value="Ready">Ready for Validation</option>
              <option value="Done">Done (Validated & Stock Updated)</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
            </select>
          </div>
        </div>
      </div>

      {/* RECEIPTS DATA TABLE */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ArrowDownToLine size={15} className="text-[#4F46E5]" />
            <span className="font-bold text-[#09090B] uppercase">
              Inbound Documents ({filteredReceipts.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">Receipt #</th>
                <th className="px-4 py-2.5">Vendor / Supplier</th>
                <th className="px-4 py-2.5">Receiving Facility</th>
                <th className="px-4 py-2.5">Items / Quantities</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    Fetching inbound receipt registry...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    No receipts found. Click "New Goods Receipt" to create one.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => {
                  const isDone = rec.status === "Done";
                  const totalUnits = rec.items?.reduce(
                    (acc, item) => acc + Number(item.received_qty || item.expected_qty || 0),
                    0
                  );

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#EEF2FF]/40 transition-colors group cursor-pointer"
                      onClick={() => setDetailReceipt(rec)}
                    >
                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        <span className="underline decoration-dotted">
                          {rec.receipt_number}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-[#09090B]">
                        {rec.supplier}
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        {rec.warehouse_name}
                        {rec.location_name ? ` // ${rec.location_name}` : ""}
                      </td>

                      <td className="px-4 py-3 text-[#09090B]">
                        <span className="font-semibold">{rec.items?.length || 1} SKUs</span>{" "}
                        <span className="text-[#71717A]">
                          ({totalUnits} units)
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={rec.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {!isDone ? (
                          <button
                            onClick={() => handleValidate(rec.id)}
                            className="px-3 py-1 bg-[#4F46E5] text-white font-semibold uppercase text-[11px] tracking-wider hover:bg-[#4338CA] transition-colors"
                          >
                            Validate Stock +
                          </button>
                        ) : (
                          <span className="text-[#059669] font-semibold text-[11px]">
                            ✓ STOCK INCREASED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT DETAIL MODAL */}
      {detailReceipt && (
        <Modal
          open={!!detailReceipt}
          onClose={() => setDetailReceipt(null)}
          title={`INBOUND RECEIPT // ${detailReceipt.receipt_number}`}
          subtitle="Vendor Consignment Telemetry Verification"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Vendor / Supplier:</span>
                <p className="font-bold text-[#09090B] text-sm">{detailReceipt.supplier}</p>
              </div>
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Receiving Location:</span>
                <p className="font-bold text-[#09090B]">{detailReceipt.warehouse_name} ({detailReceipt.location_name})</p>
              </div>
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Logged Timestamp:</span>
                <p className="text-[#09090B]">{new Date(detailReceipt.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Status:</span>
                <div className="mt-0.5">
                  <StatusBadge status={detailReceipt.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <p className="font-bold uppercase text-[#71717A] text-[10px] mb-1.5">
                Consigned Line Items:
              </p>
              <div className="border border-[#CBD5E1]">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[10px] uppercase text-[#475569]">
                      <th className="p-2">SKU / Item</th>
                      <th className="p-2 text-right">Expected</th>
                      <th className="p-2 text-right">Received</th>
                      <th className="p-2 text-right">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {detailReceipt.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold">
                          {it.product_name} <span className="text-[#71717A]">({it.sku})</span>
                        </td>
                        <td className="p-2 text-right">{it.expected_qty}</td>
                        <td className="p-2 text-right font-bold text-[#059669]">{it.received_qty}</td>
                        <td className="p-2 text-right text-[#71717A]">{it.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detailReceipt.notes && (
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#71717A] text-[11px]">
                <strong>Notes:</strong> {detailReceipt.notes}
              </div>
            )}

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
              {detailReceipt.status !== "Done" && (
                <button
                  onClick={() => handleValidate(detailReceipt.id)}
                  className="px-4 py-2 bg-[#4F46E5] text-white font-semibold uppercase text-xs hover:bg-[#4338CA] transition-colors"
                >
                  Validate & Increase Stock
                </button>
              )}
              <button
                onClick={() => setDetailReceipt(null)}
                className="px-4 py-2 border border-[#CBD5E1] bg-white text-[#09090B] font-semibold uppercase text-xs hover:bg-[#F8FAFC]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE RECEIPT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="GENERATE INBOUND GOODS RECEIPT"
        subtitle="Record Supplier Delivery & Automatic Stock Inflow"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateReceipt} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Supplier / Vendor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Industrial Alloys Corp."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Target Facility Warehouse
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Receiving Dock / Bay
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Receiving Bay 01"
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Delivery Notes / PO #
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="PO-2026-981 // Fast freight"
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Line Items Matrix */}
          <div className="border border-[#CBD5E1] p-3 space-y-3">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <span className="font-bold uppercase text-[#09090B]">
                Product Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] px-2 py-1 bg-[#09090B] text-white uppercase font-semibold hover:bg-[#27272A] flex items-center gap-1"
              >
                <Plus size={12} /> Add Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-end p-2 bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <div className="col-span-6">
                  <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                    Select Product SKU
                  </label>
                  <select
                    value={item.product_id}
                    onChange={(e) =>
                      handleItemChange(idx, "product_id", e.target.value)
                    }
                    className="w-full bg-white border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#09090B] outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}] - Current: {p.stock_quantity} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                    Qty Received
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.received_qty}
                    onChange={(e) =>
                      handleItemChange(idx, "received_qty", e.target.value)
                    }
                    className="w-full bg-white border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#09090B] outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={item.unit}
                    className="w-full bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#71717A]"
                  />
                </div>

                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length === 1}
                    className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
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
              disabled={submitting}
              className="px-5 py-2 border border-[#4F46E5] bg-[#4F46E5] text-white font-semibold uppercase text-xs hover:bg-[#4338CA] disabled:opacity-50"
            >
              {submitting ? "Logging Inbound..." : "Create Goods Receipt"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
