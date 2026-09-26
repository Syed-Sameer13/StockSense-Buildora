export default function KPICard({
  tag = "TELEMETRY // METRIC",
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  highlight = false,
  statusColor = "indigo",
}) {
  const borderColors = {
    indigo: "border-[#4F46E5]",
    emerald: "border-[#059669]",
    amber: "border-[#D97706]",
    rose: "border-[#DC2626]",
    zinc: "border-[#71717A]",
  };

  const accentBars = {
    indigo: "bg-[#4F46E5]",
    emerald: "bg-[#059669]",
    amber: "bg-[#D97706]",
    rose: "bg-[#DC2626]",
    zinc: "bg-[#71717A]",
  };

  return (
    <div
      className={`relative bg-white border border-[#E2E8F0] p-4 transition-all duration-150 hover:border-[#09090B] flex flex-col justify-between ${
        highlight ? "ring-1 ring-[#4F46E5]" : ""
      }`}
    >
      {/* Top split-header utility line */}
      <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2 mb-3">
        <span className="font-mono text-[10px] font-semibold tracking-wider text-[#71717A] uppercase truncate">
          {tag}
        </span>
        {Icon && (
          <div className="p-1 border border-[#E2E8F0] bg-[#F8FAFC] text-[#09090B]">
            <Icon size={14} />
          </div>
        )}
      </div>

      {/* Main Metric Section */}
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-mono text-xs font-medium text-[#71717A] uppercase tracking-wider">
            {title}
          </p>
          {trend && (
            <span
              className={`font-mono text-[11px] font-semibold ${
                trendPositive ? "text-[#059669]" : "text-[#DC2626]"
              }`}
            >
              {trend}
            </span>
          )}
        </div>

        <p className="mt-1 telemetry-metric text-[#09090B] font-bold tracking-tight">
          {value}
        </p>

        {subtitle && (
          <p className="mt-1.5 font-mono text-[11px] text-[#71717A]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Industrial micro-bar at bottom */}
      <div className="mt-3 w-full bg-[#F1F5F9] h-[2px]">
        <div className={`h-full w-full ${accentBars[statusColor] || "bg-[#4F46E5]"}`} />
      </div>
    </div>
  );
}
