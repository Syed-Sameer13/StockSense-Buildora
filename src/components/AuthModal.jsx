import { useState } from "react";
import { KeyRound, ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";

export default function AuthModal({
  open,
  onClose,
  currentRole,
  onRoleChange,
  userEmail,
  onUserUpdate,
}) {
  const [tab, setTab] = useState("login"); // 'login' | 'signup' | 'forgot' | 'profile'
  const [email, setEmail] = useState(userEmail || "ops.manager@stocksense.internal");
  const [password, setPassword] = useState("••••••••");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    onUserUpdate?.(email);
    setSuccessMsg("Authentication verified. Terminal session synchronized.");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 900);
  }

  function handleSendOtp(e) {
    e.preventDefault();
    if (!email) return;
    setOtpSent(true);
    setSuccessMsg("A 6-digit OTP code [849201] has been dispatched to your email.");
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    if (otpValue === "849201" || otpValue.length === 6) {
      setSuccessMsg("OTP verified successfully. Credentials updated.");
      setTimeout(() => {
        setOtpSent(false);
        setOtpValue("");
        setTab("login");
        setSuccessMsg("");
      }, 1200);
    } else {
      alert("Invalid OTP code. For demonstration, use 849201");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        tab === "profile"
          ? "OPERATOR PROFILE & ACCESS LEVEL"
          : tab === "forgot"
          ? "CREDENTIAL RECOVERY // OTP DISPATCH"
          : "TERMINAL AUTHENTICATION // SSO GATEWAY"
      }
      subtitle="StockSense Security Clearance // Auth Subsystem v2.4"
      maxWidth="max-w-md"
    >
      {/* Navigation tabs */}
      <div className="flex border-b border-[#E2E8F0] mb-5 font-mono text-xs">
        <button
          onClick={() => { setTab("login"); setSuccessMsg(""); }}
          className={`flex-1 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "login"
              ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]/40"
              : "border-transparent text-[#71717A] hover:text-[#09090B]"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setTab("forgot"); setSuccessMsg(""); }}
          className={`flex-1 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "forgot"
              ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]/40"
              : "border-transparent text-[#71717A] hover:text-[#09090B]"
          }`}
        >
          OTP Reset
        </button>
        <button
          onClick={() => { setTab("profile"); setSuccessMsg(""); }}
          className={`flex-1 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "profile"
              ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]/40"
              : "border-transparent text-[#71717A] hover:text-[#09090B]"
          }`}
        >
          My Profile
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-xs flex items-start gap-2">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* LOGIN TAB */}
      {tab === "login" && (
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Operator Identifier / Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] pl-9 pr-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold uppercase text-[#71717A]">
                Security PIN / Password
              </label>
              <button
                type="button"
                onClick={() => setTab("forgot")}
                className="text-[11px] text-[#4F46E5] hover:underline"
              >
                Forgot PIN?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] pl-9 pr-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Operational Role Clearance
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onRoleChange("Inventory Manager")}
                className={`p-2.5 text-left border text-xs font-semibold ${
                  currentRole === "Inventory Manager"
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#3730A3]"
                    : "border-[#E2E8F0] bg-white text-[#71717A] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="font-bold">Inventory Manager</div>
                <div className="text-[10px] text-[#71717A] font-normal">Full Catalog & Ledger Authority</div>
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("Warehouse Staff")}
                className={`p-2.5 text-left border text-xs font-semibold ${
                  currentRole === "Warehouse Staff"
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#3730A3]"
                    : "border-[#E2E8F0] bg-white text-[#71717A] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="font-bold">Warehouse Staff</div>
                <div className="text-[10px] text-[#71717A] font-normal">Pick, Pack, Shelve, Transfer</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-[#4F46E5] text-white border border-[#4F46E5] font-semibold uppercase tracking-wider text-xs hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2"
          >
            <span>Authenticate Session</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/* OTP FORGOT TAB */}
      {tab === "forgot" && (
        <div className="space-y-4 font-mono text-xs">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <p className="text-[#71717A] text-xs">
                Enter your registered operational identifier. A single-use 6-digit OTP code will be generated for instantaneous password reset.
              </p>
              <div>
                <label className="block font-semibold uppercase text-[#71717A] mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@stocksense.internal"
                  className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#09090B] text-white border border-[#09090B] font-semibold uppercase tracking-wider text-xs hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound size={14} />
                <span>Dispatch OTP Code</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <label className="block font-semibold uppercase text-[#71717A] mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="849201"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  className="w-full bg-white border border-[#4F46E5] tracking-[0.3em] font-bold text-center px-3 py-2 text-lg text-[#09090B] outline-none"
                />
                <span className="text-[10px] text-[#71717A] mt-1 block">
                  Demo code pre-configured: <strong className="text-[#09090B]">849201</strong>
                </span>
              </div>

              <div>
                <label className="block font-semibold uppercase text-[#71717A] mb-1">
                  New Security PIN / Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong passphrase"
                  className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#059669] text-white border border-[#059669] font-semibold uppercase tracking-wider text-xs hover:bg-[#047857] transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={14} />
                <span>Verify OTP & Reissue Access</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#09090B] text-white flex items-center justify-center font-bold text-sm">
                {currentRole === "Inventory Manager" ? "IM" : "WS"}
              </div>
              <div>
                <p className="font-bold text-sm text-[#09090B]">{currentRole}</p>
                <p className="text-[11px] text-[#71717A]">{email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#71717A]">Assigned Node:</span>
              <span className="font-semibold text-[#09090B]">WH-PRIMARY-01</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#71717A]">Clearance Level:</span>
              <span className="font-semibold text-[#4F46E5]">
                {currentRole === "Inventory Manager" ? "Tier 1 (Admin/Audit)" : "Tier 2 (Operator/Shelving)"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#71717A]">Ledger Signature:</span>
              <span className="font-mono text-[#09090B]">ECDSA-SHA256-VERIFIED</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block font-semibold uppercase text-[#71717A] mb-1.5">
              Switch Active Operational Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onRoleChange("Inventory Manager")}
                className={`py-2 px-3 border text-xs font-semibold transition-colors ${
                  currentRole === "Inventory Manager"
                    ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                    : "bg-white text-[#09090B] border-[#CBD5E1] hover:bg-[#F8FAFC]"
                }`}
              >
                Inventory Manager
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("Warehouse Staff")}
                className={`py-2 px-3 border text-xs font-semibold transition-colors ${
                  currentRole === "Warehouse Staff"
                    ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                    : "bg-white text-[#09090B] border-[#CBD5E1] hover:bg-[#F8FAFC]"
                }`}
              >
                Warehouse Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
