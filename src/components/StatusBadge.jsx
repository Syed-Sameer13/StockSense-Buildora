export default function StatusBadge({ status, type, size = "md" }) {
  const norm = (status || "").toUpperCase();

  let colorClasses = "bg-slate-100 text-slate-800 border-slate-300";
  let dotColor = "bg-slate-500";

  if (norm === "DONE" || norm === "VALIDATED" || norm === "IN STOCK" || norm === "COMPLETED") {
    colorClasses = "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]";
    dotColor = "bg-[#059669]";
  } else if (norm === "WAITING" || norm === "IN TRANSIT" || norm === "LOW STOCK") {
    colorClasses = "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
    dotColor = "bg-[#D97706]";
  } else if (norm === "READY") {
    colorClasses = "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]";
    dotColor = "bg-[#4F46E5]";
  } else if (norm === "OUT OF STOCK" || norm === "CANCELED" || norm === "REJECTED" || norm === "ERROR") {
    colorClasses = "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]";
    dotColor = "bg-[#DC2626]";
  } else if (norm === "DRAFT") {
    colorClasses = "bg-slate-100 text-slate-700 border-slate-300";
    dotColor = "bg-slate-400";
  }

  // If badge represents a document type
  if (type === "doc") {
    if (norm === "RECEIPTS" || norm === "RECEIPT") {
      colorClasses = "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]";
      dotColor = "bg-[#4F46E5]";
    } else if (norm === "DELIVERY" || norm === "DELIVERIES") {
      colorClasses = "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]";
      dotColor = "bg-[#16A34A]";
    } else if (norm === "INTERNAL" || norm === "TRANSFER" || norm === "TRANSFERS") {
      colorClasses = "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]";
      dotColor = "bg-[#9333EA]";
    } else if (norm === "ADJUSTMENTS" || norm === "ADJUSTMENT") {
      colorClasses = "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]";
      dotColor = "bg-[#E11D48]";
    } else if (norm === "INITIAL") {
      colorClasses = "bg-slate-100 text-slate-700 border-slate-300";
      dotColor = "bg-slate-600";
    }
  }

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5"
      : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase border ${sizeClasses} ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 ${dotColor}`} />
      {status}
    </span>
  );
}
