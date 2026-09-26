import { useEffect, useState } from "react";
import {
  ArrowUpFromLine,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  PackageCheck,
  Truck,
  Building2,
  AlertTriangle,
  Layers,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailDelivery, setDetailDelivery] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [customer, setCustomer] = useState("");
  const [warehouseId, setWarehouseId] = useState("wh-1");
  const [locationName, setLocationName] = useState("Shipping Bay 01");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product_id: "", ordered_qty: 5, picked_qty: 5, unit: "pcs" },
  ]);

  async function loadData() {
    setLoading(true);
    try {
      const [delList, prodList, whList] = await Promise.all([
        inventoryService.getDeliveries(),
        inventoryService.getProducts(),
        inventoryService.getWarehouses(),
      ]);
      setDeliveries(delList);
      setProducts(prodList);
      setWarehouses(whList);

      if (prodList.length > 0 && !items[0].product_id) {
        setItems([
          {
            product_id: prodList[0].id,
            product_name: prodList[0].name,
            sku: prodList[0].sku,
            ordered_qty: 5,
            picked_qty: 5,
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
        ordered_qty: 2,
        picked_qty: 2,
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

  async function handleCreateDelivery(e) {
    e.preventDefault();
    if (!customer.trim()) {
      alert("Customer / Destination entity is required.");
      return;
    }

    // Check stock sufficiency
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product_id);
      const reqQty = Number(item.ordered_qty || 0);
      if (prod && Number(prod.stock_quantity || 0) < reqQty) {
        alert(
          `Insufficient stock for ${prod.name} (${prod.sku}). Available: ${prod.stock_quantity}, Requested: ${reqQty}`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const wh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
      await inventoryService.createDelivery({
        customer: customer.trim(),
        warehouse_id: warehouseId,
        warehouse_name: wh?.name || "Main Warehouse",
        location_name: locationName,
        notes,
        status: "Waiting",
        items,
      });

      setModalOpen(false);
      setCustomer("");
      setNotes("");
      await loadData();
    } catch (err) {
      alert("Error creating delivery order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(deliveryId, newStatus) {
    try {
      await inventoryService.updateDeliveryStatus(deliveryId, newStatus);
      await loadData();
      if (detailDelivery?.id === deliveryId) {
        setDetailDelivery({ ...detailDelivery, status: newStatus });
      }
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  }

  async function handleValidate(deliveryId) {
    if (
      !window.confirm(
        "Validate delivery shipment? This will automatically decrease stock in the inventory register and record in the Stock Ledger."
      )
    ) {
      return;
    }

    try {
      await inventoryService.validateDelivery(deliveryId);
      await loadData();
      if (detailDelivery?.id === deliveryId) {
        setDetailDelivery(null);
      }
    } catch (err) {
      alert("Validation failed: " + err.message);
    }
  }

  const filteredDeliveries = deliveries.filter((d) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      d.delivery_number.toLowerCase().includes(query) ||
      d.customer.toLowerCase().includes(query) ||
      d.warehouse_name.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || d.status === statusFilter;

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
              OUTBOUND FULFILLMENT // CUSTOMER DISPATCH
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Delivery Orders (Stock Out)
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Pick, pack, and validate customer shipments with automatic inventory deductions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
        >
          <Plus size={15} />
          <span>New Delivery Order</span>
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
              placeholder="Search delivery #, customer, facility..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">Status: All Outbound Orders</option>
              <option value="Waiting">Waiting (To Pick)</option>
              <option value="Ready">Ready (Packed & Staged)</option>
              <option value="Done">Done (Dispatched & Deducted)</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ArrowUpFromLine size={15} className="text-[#4F46E5]" />
            <span className="font-bold text-[#09090B] uppercase">
              Outbound Orders ({filteredDeliveries.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">Delivery #</th>
                <th className="px-4 py-2.5">Recipient / Client</th>
                <th className="px-4 py-2.5">Dispatch Origin</th>
                <th className="px-4 py-2.5">Items Out</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Process Step</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    Fetching outbound dispatch logs...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    No delivery orders recorded. Click "New Delivery Order" to create one.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => {
                  const isDone = del.status === "Done";
                  const totalUnits = del.items?.reduce(
                    (acc, item) => acc + Number(item.picked_qty || item.ordered_qty || 0),
                    0
                  );

                  return (
                    <tr
                      key={del.id}
                      className="hover:bg-[#EEF2FF]/40 transition-colors group cursor-pointer"
                      onClick={() => setDetailDelivery(del)}
                    >
                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        <span className="underline decoration-dotted">
                          {del.delivery_number}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-[#09090B]">
                        {del.customer}
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        {del.warehouse_name}
                        {del.location_name ? ` // ${del.location_name}` : ""}
                      </td>

                      <td className="px-4 py-3 text-[#09090B]">
                        <span className="font-semibold">{del.items?.length || 1} SKUs</span>{" "}
                        <span className="text-[#DC2626] font-semibold">
                          (-{totalUnits} units)
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#71717A]">
                        {new Date(del.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={del.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {!isDone ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {del.status === "Waiting" && (
                              <button
                                onClick={() => handleUpdateStatus(del.id, "Ready")}
                                className="px-2 py-1 bg-white border border-[#CBD5E1] text-[#09090B] font-semibold uppercase text-[10px] hover:bg-[#F8FAFC]"
                              >
                                Pack & Stage
                              </button>
                            )}
                            <button
                              onClick={() => handleValidate(del.id)}
                              className="px-3 py-1 bg-[#4F46E5] text-white font-semibold uppercase text-[11px] tracking-wider hover:bg-[#4338CA] transition-colors"
                            >
                              Validate Ship -
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#059669] font-semibold text-[11px]">
                            ✓ DISPATCHED (-STOCK)
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

      {/* DETAIL MODAL */}
      {detailDelivery && (
        <Modal
          open={!!detailDelivery}
          onClose={() => setDetailDelivery(null)}
          title={`DELIVERY ORDER // ${detailDelivery.delivery_number}`}
          subtitle="Customer Shipment Fulfillment Verification"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Client / Consignee:</span>
                <p className="font-bold text-[#09090B] text-sm">{detailDelivery.customer}</p>
              </div>
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Dispatch Location:</span>
                <p className="font-bold text-[#09090B]">{detailDelivery.warehouse_name} ({detailDelivery.location_name})</p>
              </div>
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Created Date:</span>
                <p className="text-[#09090B]">{new Date(detailDelivery.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[#71717A] text-[10px] uppercase">Fulfillment Status:</span>
                <div className="mt-0.5">
                  <StatusBadge status={detailDelivery.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <p className="font-bold uppercase text-[#71717A] text-[10px] mb-1.5">
                Outbound Shipment Line Items:
              </p>
              <div className="border border-[#CBD5E1]">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[10px] uppercase text-[#475569]">
                      <th className="p-2">SKU / Item</th>
                      <th className="p-2 text-right">Ordered</th>
                      <th className="p-2 text-right">Picked & Packed</th>
                      <th className="p-2 text-right">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {detailDelivery.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold">
                          {it.product_name} <span className="text-[#71717A]">({it.sku})</span>
                        </td>
                        <td className="p-2 text-right">{it.ordered_qty}</td>
                        <td className="p-2 text-right font-bold text-[#DC2626]">-{it.picked_qty}</td>
                        <td className="p-2 text-right text-[#71717A]">{it.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detailDelivery.notes && (
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#71717A] text-[11px]">
                <strong>Fulfillment Notes:</strong> {detailDelivery.notes}
              </div>
            )}

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
              {detailDelivery.status !== "Done" && (
                <button
                  onClick={() => handleValidate(detailDelivery.id)}
                  className="px-4 py-2 bg-[#4F46E5] text-white font-semibold uppercase text-xs hover:bg-[#4338CA] transition-colors"
                >
                  Validate & Decrease Stock
                </button>
              )}
              <button
                onClick={() => setDetailDelivery(null)}
                className="px-4 py-2 border border-[#CBD5E1] bg-white text-[#09090B] font-semibold uppercase text-xs hover:bg-[#F8FAFC]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE DELIVERY MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="CREATE CUSTOMER DELIVERY ORDER"
        subtitle="Reserve Stock for Shipping & Decrement Registry"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateDelivery} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Client / Consignee Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metropolis Construction Ltd."
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Origin Facility Warehouse
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
                Dispatch Bay
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Shipping Bay 01"
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Sales Order / Ref #
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="SO-2026-441 // Express Courier"
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Line Items Matrix */}
          <div className="border border-[#CBD5E1] p-3 space-y-3">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <span className="font-bold uppercase text-[#09090B]">
                Outbound Item Lines
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] px-2 py-1 bg-[#09090B] text-white uppercase font-semibold hover:bg-[#27272A] flex items-center gap-1"
              >
                <Plus size={12} /> Add Line
              </button>
            </div>

            {items.map((item, idx) => {
              const currentProd = products.find((p) => p.id === item.product_id);
              const available = currentProd ? Number(currentProd.stock_quantity || 0) : 0;
              const hasEnough = available >= Number(item.ordered_qty || 0);

              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-end p-2 bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <div className="col-span-6">
                    <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                      Select Item SKU (Available: {available})
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
                          {p.name} [{p.sku}] - In Stock: {p.stock_quantity} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-[#71717A] uppercase mb-0.5">
                      Qty to Ship
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.ordered_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "ordered_qty", e.target.value)
                      }
                      className={`w-full bg-white border px-2 py-1.5 text-xs text-[#09090B] outline-none ${
                        !hasEnough ? "border-[#DC2626] bg-[#FEF2F2]" : "border-[#CBD5E1]"
                      }`}
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
              );
            })}
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
              {submitting ? "Processing..." : "Create Delivery Order"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
