import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090B]/60 p-4 backdrop-blur-[1px] animate-fadeIn">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white border border-[#09090B] hard-shadow transition-all max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#09090B] bg-[#F8FAFC] px-5 py-3.5 select-none">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#4F46E5]" />
              <h2 className="font-sans text-base font-bold tracking-tight text-[#09090B] uppercase">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="mt-0.5 font-mono text-[11px] text-[#71717A]">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="border border-[#CBD5E1] bg-white p-1.5 text-[#09090B] hover:bg-[#09090B] hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
