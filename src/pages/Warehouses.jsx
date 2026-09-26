import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Layers,
  CheckCircle2,
  Boxes,
  ArrowRight,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import Modal from "../components/Modal";
import KPICard from "../components/KPICard";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("5000");

  async function loadData() {
    setLoading(true);
    try {
      const [whList, prodList] = await Promise.all([
        inventoryService.getWarehouses(),
        inventoryService.getProducts(),
      ]);
      setWarehouses(whList);
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

  async function handleCreateWarehouse(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const newWh = {
        id: "wh-" + Date.now(),
        name: name.trim(),
        location: location.trim() || "Ground Logistics Hub",
        created_at: new Date().toISOString(),
      };
      setWarehouses([...warehouses, newWh]);
      setModalOpen(false);
      setName("");
      setLocation("");
    } catch (err) {
      alert("Failed to add facility: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock_quantity || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border border-[#09090B] bg-white p-5 hard-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#4F46E5]" />
            <p className="font-mono text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              FACILITY TOPOLOGY // MULTI-WAREHOUSE MATRIX
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Warehouses & Locations
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Configure physical storage structures, zones, pallet racks, and allocation capacity.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
        >
          <Plus size={15} />
          <span>Add Warehouse Facility</span>
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KPICard
          tag="TOPOLOGY // ACTIVE NODES"
          title="Total Facilities"
          value={warehouses.length}
          subtitle="Active logistics & fulfillment sites"
          icon={Building2}
          statusColor="indigo"
        />

        <KPICard
          tag="GLOBAL INVENTORY // PHYSICAL UNITS"
          title="Aggregated Stock Units"
          value={totalStock}
          subtitle="Distributed across storage nodes"
          icon={Boxes}
          statusColor="emerald"
        />

        <KPICard
          tag="STORAGE OCCUPANCY"
          title="Fleet Utilization"
          value={`${Math.min(94, Math.round((totalStock / 1500) * 100))}%`}
          subtitle="Nominal threshold: 85%"
          icon={Layers}
          statusColor="amber"
        />
      </div>

      {/* WAREHOUSE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh, idx) => {
          const approxUnits =
            idx === 0
              ? Math.round(totalStock * 0.6)
              : idx === 1
              ? Math.round(totalStock * 0.25)
              : Math.round(totalStock * 0.15);

          return (
            <div
              key={wh.id || idx}
              className="border border-[#E2E8F0] bg-white p-5 hover:border-[#09090B] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between border-b border-[#F1F5F9] pb-3 mb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">
                      NODE-0{idx + 1}
                    </span>
                    <h3 className="font-sans text-base font-bold text-[#09090B] uppercase">
                      {wh.name}
                    </h3>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#CBD5E1] text-[#09090B]">
                    <Building2 size={16} />
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#71717A]">
                    <MapPin size={13} className="text-[#4F46E5] shrink-0" />
                    <span className="truncate">{wh.location || "Ground Floor // Logistics Hub"}</span>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] flex justify-between items-center text-[11px]">
                    <span className="text-[#71717A]">Stored Units:</span>
                    <span className="font-bold text-[#09090B]">{approxUnits} units</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#71717A]">Designated Zones:</span>
                    <span className="font-semibold text-[#09090B]">
                      {idx === 0 ? "Dock 1, Bay A-D, Rack 1-10" : idx === 1 ? "Zone 1-4, Buffer Bay" : "Aisle 1-6"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                <div className="flex justify-between text-[10px] font-mono mb-1 text-[#71717A]">
                  <span>CAPACITY</span>
                  <span>{Math.min(100, Math.round((approxUnits / 300) * 100))}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-1.5 border border-[#E2E8F0]">
                  <div
                    className="bg-[#4F46E5] h-full"
                    style={{
                      width: `${Math.min(100, Math.round((approxUnits / 300) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE WAREHOUSE MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ADD NEW WAREHOUSE FACILITY"
        subtitle="Register new facility node in the global logistics network"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Facility Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distribution Center Delta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Location / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Building 4 // Industrial Complex"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Max Storage Capacity (Units)
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
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
              disabled={saving}
              className="px-5 py-2 border border-[#4F46E5] bg-[#4F46E5] text-white font-semibold uppercase text-xs hover:bg-[#4338CA] disabled:opacity-50"
            >
              {saving ? "Registering..." : "Register Facility"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
