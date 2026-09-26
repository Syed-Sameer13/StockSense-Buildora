import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardEdit,
  History,
  Building2,
  Boxes,
  Menu,
  X,
  Radio,
  User,
  LogOut,
  Bell,
  Search,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Layers,
} from "lucide-react";
import AuthModal from "./AuthModal";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    badgeKey: null,
    tag: "CMD-01",
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
    badgeKey: null,
    tag: "SKU-CATALOG",
  },
  {
    name: "Receipts",
    path: "/receipts",
    icon: ArrowDownToLine,
    badgeKey: "receipts",
    tag: "INBOUND",
  },
  {
    name: "Delivery Orders",
    path: "/deliveries",
    icon: ArrowUpFromLine,
    badgeKey: "deliveries",
    tag: "OUTBOUND",
  },
  {
    name: "Internal Transfers",
    path: "/transfers",
    icon: ArrowLeftRight,
    badgeKey: "transfers",
    tag: "RELOCATION",
  },
  {
    name: "Stock Adjustments",
    path: "/adjustments",
    icon: ClipboardEdit,
    badgeKey: null,
    tag: "AUDIT-DIFF",
  },
  {
    name: "Move History / Ledger",
    path: "/ledger",
    icon: History,
    badgeKey: null,
    tag: "TELEMETRY-LOG",
  },
  {
    name: "Warehouses",
    path: "/warehouses",
    icon: Building2,
    badgeKey: null,
    tag: "FACILITY-GRID",
  },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("Inventory Manager");
  const [userEmail, setUserEmail] = useState("manager@stocksense.internal");
  const [activeWarehouse, setActiveWarehouse] = useState("Main Warehouse");
  const [notificationToast, setNotificationToast] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    if (window.confirm("Terminate terminal session and logout?")) {
      setUserRole("Warehouse Staff");
      setAuthModalOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A1B22] flex flex-col selection:bg-[#4F46E5] selection:text-white">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#09090B]/60 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* FIXED TELEMETRY SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-[#09090B] text-white flex flex-col justify-between border-r border-[#27272A] transition-transform duration-150 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Mainframe Branding Header */}
          <div className="flex h-16 items-center justify-between border-b border-[#27272A] px-5 bg-[#09090B]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#4F46E5] border border-[#4F46E5] flex items-center justify-center text-white font-bold">
                <Boxes size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans font-bold text-sm tracking-wider uppercase text-white">
                    StockSense
                  </h1>
                  <span className="bg-[#18181B] text-[#A1A1AA] border border-[#3F3F46] text-[9px] px-1 font-mono uppercase">
                    v2.4
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#71717A] uppercase tracking-wider">
                  Industrial IMS & Telemetry
                </p>
              </div>
            </div>

            <button
              className="lg:hidden p-1 text-[#71717A] hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Real-time Telemetry Status Pill */}
          <div className="mx-4 my-3 p-2.5 bg-[#18181B] border border-[#27272A]">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <div className="flex items-center gap-1.5 text-[#059669]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#059669] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 bg-[#059669]"></span>
                </span>
                <span className="font-semibold uppercase tracking-wider">NODE ONLINE</span>
              </div>
              <span className="text-[#71717A]">LATENCY 14MS</span>
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-[#A1A1AA] truncate flex items-center gap-1.5">
              <Building2 size={12} className="text-[#4F46E5] shrink-0" />
              <span>ACTIVE: {activeWarehouse.toUpperCase()}</span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="p-3 space-y-0.5">
            <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
              SYSTEM OPERATIONS
            </div>

            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center justify-between px-3 py-2.5 text-xs font-mono transition-all duration-100 border-l-2 ${
                    isActive
                      ? "bg-[#18181B] text-white border-[#4F46E5] font-semibold"
                      : "text-[#A1A1AA] border-transparent hover:bg-[#18181B]/60 hover:text-white hover:border-[#3F3F46]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={16}
                      className={isActive ? "text-[#4F46E5]" : "text-[#71717A] group-hover:text-[#A1A1AA]"}
                    />
                    <span className="tracking-wide uppercase">{item.name}</span>
                  </div>

                  <span
                    className={`text-[9px] px-1 border font-mono ${
                      isActive
                        ? "bg-[#4F46E5]/20 text-[#A5B4FC] border-[#4F46E5]/40"
                        : "bg-transparent text-[#52525B] border-[#27272A]"
                    }`}
                  >
                    {item.tag}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* PROFILE & LOGOUT FOOTER */}
        <div className="p-3 border-t border-[#27272A] bg-[#09090B]">
          <div className="border border-[#27272A] bg-[#18181B] p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#4F46E5] text-white font-mono font-bold text-xs flex items-center justify-center border border-[#4F46E5]">
                  {userRole === "Inventory Manager" ? "IM" : "WS"}
                </div>
                <div className="overflow-hidden">
                  <p className="font-mono text-xs font-semibold text-white truncate">
                    {userRole}
                  </p>
                  <p className="font-mono text-[10px] text-[#71717A] truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-[#27272A] font-mono text-[11px]">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="py-1 px-2 bg-[#27272A] text-[#E4E4E7] hover:bg-[#3F3F46] hover:text-white text-center border border-[#3F3F46] transition-colors flex items-center justify-center gap-1 uppercase"
              >
                <User size={12} />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="py-1 px-2 bg-[#27272A] text-[#F87171] hover:bg-[#7F1D1D] hover:text-white text-center border border-[#3F3F46] transition-colors flex items-center justify-center gap-1 uppercase"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* TOP STATUS & TELEMETRY APPBAR */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 border border-[#CBD5E1] bg-[#F8FAFC] text-[#09090B]"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb / Operational Location */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="hidden sm:inline-block font-semibold uppercase text-[#71717A]">
                NODE:
              </span>
              <select
                value={activeWarehouse}
                onChange={(e) => setActiveWarehouse(e.target.value)}
                className="bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-1 font-mono text-xs text-[#09090B] font-medium outline-none focus:border-[#4F46E5]"
              >
                <option value="Main Warehouse">Main Warehouse // Zone 01</option>
                <option value="Production Rack">Production Floor // Rack B</option>
                <option value="Secondary Warehouse">Secondary Warehouse // DC-02</option>
                <option value="All Facilities">Global Matrix (All Locations)</option>
              </select>
            </div>
          </div>

          {/* Right Header Status Telemetry */}
          <div className="flex items-center gap-3">
            {/* Role indicator pill */}
            <div
              onClick={() => setAuthModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#CBD5E1]"
            >
              <span className="w-2 h-2 bg-[#059669]" />
              <span className="font-mono text-[11px] font-semibold uppercase text-[#09090B]">
                {userRole}
              </span>
              <span className="font-mono text-[10px] text-[#71717A]">
                [SWITCH]
              </span>
            </div>

            {/* Quick Auth Trigger */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="border border-[#CBD5E1] bg-white p-1.5 text-[#09090B] hover:bg-[#09090B] hover:text-white transition-colors"
              title="Authentication & OTP Reset"
            >
              <KeyRound size={15} />
            </button>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="p-4 lg:p-8 flex-1 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* SYSTEM FOOTER */}
        <footer className="border-t border-[#E2E8F0] bg-white py-3 px-4 lg:px-8 font-mono text-[11px] text-[#71717A] flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#09090B]">STOCKSENSE IMS</span>
            <span>//</span>
            <span>REAL-TIME INVENTORY TELEMETRY</span>
          </div>
          <div>
            <span>SYNCHRONIZED WITH SUPABASE ENGINE</span>
          </div>
        </footer>
      </div>

      {/* AUTHENTICATION & PROFILE MODAL */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentRole={userRole}
        onRoleChange={setUserRole}
        userEmail={userEmail}
        onUserUpdate={setUserEmail}
      />
    </div>
  );
}
