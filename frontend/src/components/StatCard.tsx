import { StatConfig, StatFilter } from "@/constants/stats";

interface Props {
  config: StatConfig;
  value: number;
  isActive: boolean;
  onClick: (filter: StatFilter) => void;
}

// En enkelt klikkbar statuskort. Mottar alt det trenger som props.
export function StatCard({ config, value, isActive, onClick }: Props) {
  const { label, icon: Icon, color, bg, filter } = config;

  return (
    <button
      onClick={() => onClick(filter)}
      className={`flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all sm:p-4 ${
        isActive
          ? "border-cyan-500/40 bg-cyan-500/10"
          : "border-slate-800/60 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60"
      }`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${bg}`}
      >
        <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-50 sm:text-2xl">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
          {label}
        </p>
      </div>
    </button>
  );
}
