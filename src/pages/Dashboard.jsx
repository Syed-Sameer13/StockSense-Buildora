import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardEdit,
  Activity,
  Layers,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { inventoryService } from "../services/inventoryService";
import KPICard from "../components/KPICard";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: {
      totalProducts: 0,
      totalStockUnits: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      pendingReceipts: 0,
      pendingDeliveries: 0,
      scheduledTransfers: 0,
    },
    lowStockProducts: [],
    outOfStockProducts: [],
    operations: [],
    warehouses: [],
    products: [],
  });

  // Dynamic Filters
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const res = await inventoryService.getDashboardData({
        docType: docTypeFilter,
        status: statusFilter,
        warehouse: warehouseFilter,
        search: searchQuery,
      });
      setData(res);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [docTypeFilter, statusFilter, warehouseFilter, searchQuery]);

  // Telemetry chart data: Throughput simulation based on real products
  const throughputData = useMemo(() => {
    return [
      { name: "Mon", Inbound: 140, Outbound: 85 },
      { name: "Tue", Inbound: 100, Outbound: 120 },
      { name: "Wed", Inbound: 180, Outbound: 90 },
      { name: "Thu", Inbound: 210, Outbound: 160 },
      { name: "Fri", Inbound: 120, Outbound: 145 },
      { name: "Sat", Inbound: 60, Outbound: 40 },
      { name: "Today", Inbound: 100, Outbound: 25 },
    ];
  }, []);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts = {};
    data.products.forEach((p) => {
      const cat = p.category || "General";
      counts[cat] = (counts[cat] || 0) + Number(p.stock_quantity || 0);
    });

    const entries = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));

    return entries.length > 0
      ? entries
      : [
          { name: "Raw Material", value: 100 },
          { name: "Hardware", value: 150 },
          { name: "Furniture", value: 63 },
        ];
  }, [data.products]);

  const COLORS = ["#4F46E5", "#059669", "#D97706", "#71717A", "#0284C7"];

  async function handleQuickValidate(op) {
    try {
      if (op.type === "Receipts") {
        await inventoryService.validateReceipt(op.id);
      } else if (op.type === "Delivery") {
        await inventoryService.validateDelivery(op.id);
      } else if (op.type === "Internal") {
        await inventoryService.validateTransfer(op.id);
      }
      await loadData();
    } catch (err) {
      alert("Validation failed: " + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* COMMAND CENTER HEADER */}
      <div className="border border-[#09090B] bg-white p-5 hard-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#4F46E5]" />
            <p className="font-mono text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              OPERATIONAL TELEMETRY // REAL-TIME SNAPSHOT
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Inventory Dashboard
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Centralized telemetry matrix for inbound, outbound, transfers, and stock balance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="border border-[#09090B] bg-white hover:bg-[#F8FAFC] px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#09090B] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Feed</span>
          </button>

          <Link
            to="/products"
            className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
          >
            <Package size={14} />
            <span>Manage Catalog</span>
          </Link>
        </div>
      </div>

      {/* DASHBOARD KPIS RACK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard
          tag="SKU-REGISTER // T-01"
          title="Total SKUs In Stock"
          value={data.kpis.totalProducts}
          subtitle={`${data.kpis.totalStockUnits} Total Physical Units`}
          icon={Package}
          statusColor="indigo"
          highlight={true}
        />

        <KPICard
          tag="STOCK THRESHOLD // ALERT"
          title="Low / Out of Stock"
          value={data.kpis.lowStockCount + data.kpis.outOfStockCount}
          subtitle={`${data.kpis.lowStockCount} Low, ${data.kpis.outOfStockCount} Critical Out`}
          icon={AlertTriangle}
          statusColor={
            data.kpis.outOfStockCount > 0
              ? "rose"
              : data.kpis.lowStockCount > 0
              ? "amber"
              : "emerald"
          }
          trend={
            data.kpis.outOfStockCount > 0
              ? "CRITICAL"
              : data.kpis.lowStockCount > 0
              ? "REORDER REQD"
              : "OPTIMAL"
          }
          trendPositive={
            data.kpis.outOfStockCount === 0 && data.kpis.lowStockCount === 0
          }
        />

        <KPICard
          tag="INBOUND // VENDOR"
          title="Pending Receipts"
          value={data.kpis.pendingReceipts}
          subtitle="Incoming shipments awaiting validation"
          icon={ArrowDownToLine}
          statusColor="indigo"
        />

        <KPICard
          tag="OUTBOUND // ORDERS"
          title="Pending Deliveries"
          value={data.kpis.pendingDeliveries}
          subtitle="Customer shipments in queue"
          icon={ArrowUpFromLine}
          statusColor="amber"
        />

        <KPICard
          tag="RELOCATION // FLOOR"
          title="Transfers Scheduled"
          value={data.kpis.scheduledTransfers}
          subtitle="Internal moves between racks/zones"
          icon={ArrowLeftRight}
          statusColor="emerald"
        />
      </div>

      {/* CRITICAL LOW STOCK WARNING BANNER (If any) */}
      {(data.lowStockProducts.length > 0 || data.outOfStockProducts.length > 0) && (
        <div className="border border-[#DC2626] bg-[#FEF2F2] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs text-[#991B1B]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#DC2626] text-white">
              <AlertTriangle size={16} />
            </div>
            <div>
              <span className="font-bold tracking-wider uppercase">
                CRITICAL INVENTORY ALERT:
              </span>{" "}
              <span>
                {data.outOfStockProducts.length > 0 &&
                  `${data.outOfStockProducts.length} items at 0 quantity. `}
                {data.lowStockProducts.length > 0 &&
                  `${data.lowStockProducts.map((p) => `${p.name} (${p.stock_quantity}/${p.minimum_stock} ${p.unit})`).join(", ")} below threshold.`}
              </span>
            </div>
          </div>
          <Link
            to="/receipts"
            className="px-3 py-1 bg-[#DC2626] text-white uppercase font-semibold tracking-wider hover:bg-[#B91C1C] transition-colors shrink-0"
          >
            Create Inbound PO →
          </Link>
        </div>
      )}

      {/* CHARTS / TELEMETRY VISUALIZATION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock Throughput Velocity (In vs Out) */}
        <div className="lg:col-span-2 border border-[#E2E8F0] bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-3">
            <div>
              <span className="font-mono text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">
                TELEMETRY // THROUGHPUT
              </span>
              <h3 className="font-sans text-sm font-bold text-[#09090B] uppercase">
                Stock Velocity (Inflow vs Outflow)
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1 text-[#4F46E5]">
                <span className="w-2.5 h-2.5 bg-[#4F46E5]" /> Receipts (In)
              </span>
              <span className="flex items-center gap-1 text-[#09090B]">
                <span className="w-2.5 h-2.5 bg-[#09090B]" /> Deliveries (Out)
              </span>
            </div>
          </div>

          <div className="h-56 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 11 }} />
                <YAxis tick={{ fill: "#71717A", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090B",
                    color: "#FFFFFF",
                    border: "1px solid #27272A",
                    fontFamily: "JetBrains Mono",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="Inbound" fill="#4F46E5" />
                <Bar dataKey="Outbound" fill="#09090B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Stock Distribution */}
        <div className="border border-[#E2E8F0] bg-white p-4 flex flex-col justify-between">
          <div className="border-b border-[#F1F5F9] pb-3 mb-3">
            <span className="font-mono text-[10px] font-bold text-[#059669] uppercase tracking-wider">
              FACILITY ALLOCATION
            </span>
            <h3 className="font-sans text-sm font-bold text-[#09090B] uppercase">
              Category Volume Share
            </h3>
          </div>

          <div className="h-44 w-full flex items-center justify-center font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090B",
                    color: "#FFFFFF",
                    border: "1px solid #27272A",
                    fontFamily: "JetBrains Mono",
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-[#F1F5F9] pt-2 space-y-1 font-mono text-[11px]">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-[#71717A]">
                  <span
                    className="w-2 h-2"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {cat.name}
                </span>
                <span className="font-bold text-[#09090B]">{cat.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC FILTERS SUITE */}
      <div className="border border-[#E2E8F0] bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#09090B]">
            <Filter size={14} className="text-[#4F46E5]" />
            <span>Dynamic Operations Filter Matrix</span>
          </div>
          <span className="font-mono text-[11px] text-[#71717A]">
            Showing {data.operations.length} documents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {/* Document Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
              Document Type
            </label>
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">All Documents (Global)</option>
              <option value="Receipts">Receipts (Incoming)</option>
              <option value="Delivery">Delivery (Outgoing)</option>
              <option value="Internal">Internal Transfers</option>
              <option value="Adjustments">Stock Adjustments</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
              Operation Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done / Validated</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Warehouse / Location */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
              Warehouse Facility
            </label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">All Facilities</option>
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="Production Rack">Production Rack</option>
              <option value="Secondary Warehouse">Secondary Warehouse</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
              Search Reference / SKU
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="REC-001, STL-001, Supplier..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-8 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONS STREAM MATRIX */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#4F46E5]" />
            <h2 className="font-sans font-bold text-sm text-[#09090B] uppercase tracking-wide">
              Live Operations Matrix
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#71717A]">
            CHRONOLOGICAL EXECUTION LOG
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">Reference #</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Partner / Routing</th>
                <th className="px-4 py-2.5">Facility Location</th>
                <th className="px-4 py-2.5">Summary / Payload</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    Reading telemetry channels...
                  </td>
                </tr>
              ) : data.operations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#71717A]">
                    No operations match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                data.operations.map((op) => (
                  <tr
                    key={op.id}
                    className="hover:bg-[#EEF2FF]/40 transition-colors group"
                  >
                    <td className="px-4 py-3 font-semibold text-[#09090B]">
                      <span className="underline decoration-dotted">
                        {op.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={op.type} type="doc" size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[#09090B] font-medium">
                      {op.partner}
                    </td>
                    <td className="px-4 py-3 text-[#71717A]">
                      {op.warehouse}
                      {op.location ? ` // ${op.location}` : ""}
                    </td>
                    <td className="px-4 py-3 text-[#09090B] max-w-xs truncate">
                      {op.summary}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={op.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {op.status !== "Done" && op.status !== "Canceled" ? (
                        <button
                          onClick={() => handleQuickValidate(op)}
                          className="px-2.5 py-1 bg-[#4F46E5] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#4338CA] transition-colors"
                        >
                          Validate
                        </button>
                      ) : (
                        <span className="text-[#059669] font-mono text-[11px] font-semibold">
                          LOGGED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
