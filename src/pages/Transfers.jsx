import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  Layers,
  ArrowRight,
  Clock,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [sourceWarehouse, setSourceWarehouse] = useState("Main Warehouse");
  const [sourceLocation, setSourceLocation] = useState("Main Store // Rack A");
  const [destWarehouse, setDestWarehouse] = useState("Production Rack");
  const [destLocation, setDestLocation] = useState("Production Floor // Bay 1");
  const [notes, setNotes] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [trfList, prodList, whList] = await Promise.all([
        inventoryService.getTransfers(),
        inventoryService.getProducts(),
        inventoryService.getWarehouses(),
      ]);
      setTransfers(trfList);
      setProducts(prodList);
      setWarehouses(whList);

      if (prodList.length > 0 && !productId) {
        setProductId(prodList[0].id);
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

  async function handleCreateTransfer(e) {
    e.preventDefault();
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      alert("Select a valid product.");
      return;
    }

    if (sourceWarehouse === destWarehouse && sourceLocation === destLocation) {
      alert("Source and destination locations cannot be identical.");
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.createTransfer({
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        quantity: Number(quantity),
        unit: prod.unit || "pcs",
        source_warehouse: sourceWarehouse,
        source_location: sourceLocation,
        dest_warehouse: destWarehouse,
        dest_location: destLocation,
        notes,
        status: "Waiting",
      });

      setModalOpen(false);
      setNotes("");
      await loadData();
    } catch (err) {
      alert("Error scheduling transfer: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleValidate(transferId) {
    try {
      await inventoryService.validateTransfer(transferId);
      await loadData();
    } catch (err) {
      alert("Transfer validation failed: " + err.message);
    }
  }

  const filteredTransfers = transfers.filter((t) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      t.transfer_number.toLowerCase().includes(query) ||
      t.product_name.toLowerCase().includes(query) ||
      t.sku.toLowerCase().includes(query) ||
      t.source_warehouse.toLowerCase().includes(query) ||
      t.dest_warehouse.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || t.status === statusFilter;

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
              INTERNAL RELOCATION // ZONE TO ZONE
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Internal Transfers
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Relocate stock across warehouses, floor racks, and assembly zones with complete traceability.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
        >
          <Plus size={15} />
          <span>New Internal Transfer</span>
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
              placeholder="Search transfer #, SKU, source/dest..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">Status: All Relocations</option>
              <option value="Waiting">Waiting / Scheduled</option>
              <option value="Done">Done (Validated & Relocated)</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={15} className="text-[#4F46E5]" />
            <span className="font-bold text-[#09090B] uppercase">
              Transfer Manifests ({filteredTransfers.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">Transfer #</th>
                <th className="px-4 py-2.5">Product SKU</th>
                <th className="px-4 py-2.5">Source Facility</th>
                <th className="px-4 py-2.5">Destination Facility</th>
                <th className="px-4 py-2.5">Quantity</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    Fetching internal movement ledger...
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    No internal transfers scheduled. Click "New Internal Transfer" to create one.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((trf) => {
                  const isDone = trf.status === "Done";

                  return (
                    <tr
                      key={trf.id}
                      className="hover:bg-[#EEF2FF]/40 transition-colors group"
                    >
                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        <span className="underline decoration-dotted">
                          {trf.transfer_number}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-[#09090B]">
                        {trf.product_name}{" "}
                        <span className="text-[#71717A] font-mono">[{trf.sku}]</span>
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        <div className="font-medium text-[#09090B]">{trf.source_warehouse}</div>
                        <div className="text-[10px]">{trf.source_location}</div>
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        <div className="font-medium text-[#4F46E5]">{trf.dest_warehouse}</div>
                        <div className="text-[10px]">{trf.dest_location}</div>
                      </td>

                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        {trf.quantity} {trf.unit}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={trf.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        {!isDone ? (
                          <button
                            onClick={() => handleValidate(trf.id)}
                            className="px-3 py-1 bg-[#4F46E5] text-white font-semibold uppercase text-[11px] tracking-wider hover:bg-[#4338CA] transition-colors"
                          >
                            Confirm Relocation
                          </button>
                        ) : (
                          <span className="text-[#059669] font-semibold text-[11px]">
                            ✓ RELOCATED
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

      {/* CREATE TRANSFER MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="SCHEDULE INTERNAL STOCK TRANSFER"
        subtitle="Route inventory across storage racks, bays, and facilities"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Select Product SKU *
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.sku}] - Current Total: {p.stock_quantity} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Quantity to Move *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Source Location */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <span className="font-bold uppercase text-[10px] text-[#71717A]">
              Source Location (Origin):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">Facility</label>
                <select
                  value={sourceWarehouse}
                  onChange={(e) => setSourceWarehouse(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#09090B] outline-none"
                >
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Production Rack">Production Rack</option>
                  <option value="Secondary Warehouse">Secondary Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">Aisle / Rack / Bay</label>
                <input
                  type="text"
                  value={sourceLocation}
                  onChange={(e) => setSourceLocation(e.target.value)}
                  placeholder="Main Store // Rack A"
                  className="w-full bg-white border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#09090B] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Destination Location */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <span className="font-bold uppercase text-[10px] text-[#4F46E5]">
              Destination Location (Target):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">Facility</label>
                <select
                  value={destWarehouse}
                  onChange={(e) => setDestWarehouse(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#09090B] outline-none"
                >
                  <option value="Production Rack">Production Rack</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Secondary Warehouse">Secondary Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">Aisle / Rack / Bay</label>
                <input
                  type="text"
                  value={destLocation}
                  onChange={(e) => setDestLocation(e.target.value)}
                  placeholder="Production Floor // Bay 1"
                  className="w-full bg-white border border-[#CBD5E1] px-2 py-1.5 text-xs text-[#09090B] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Internal Movement Note / Reason
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stage material for manufacturing shift #2"
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
              disabled={submitting}
              className="px-5 py-2 border border-[#4F46E5] bg-[#4F46E5] text-white font-semibold uppercase text-xs hover:bg-[#4338CA] disabled:opacity-50"
            >
              {submitting ? "Scheduling..." : "Schedule Transfer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
