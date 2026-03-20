import {
  Send,
  Clock,
  XCircle,
  MessageSquare,
  BadgeCheck,
  EyeOff,
} from "lucide-react";
import { ApplicationStatus } from "@/types/application";

export type StatFilter = "all" | ApplicationStatus;

export interface StatConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  filter: StatFilter;
}

// Legg til flere stat configs her hvis vi vil ha flere stat cards, eller endre eksisterende
export const STAT_CONFIGS: StatConfig[] = [
  {
    label: "Sendt",
    icon: Send,
    color: "text-cyan-400",
    bg: "bg-cyan-900/30",
    filter: "all",
  },
  {
    label: "Venter",
    icon: Clock,
    color: "text-purple-400",
    bg: "bg-purple-900/30",
    filter: "Sendt",
  },
  {
    label: "Avslag",
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-900/30",
    filter: "Avslag",
  },
  {
    label: "Intervjuer",
    icon: MessageSquare,
    color: "text-pink-400",
    bg: "bg-pink-900/30",
    filter: "Intervju",
  },
  {
    label: "Tilbud",
    icon: BadgeCheck,
    color: "text-teal-400",
    bg: "bg-teal-900/30",
    filter: "Tilbud",
  },
  {
    label: "Ghostet",
    icon: EyeOff,
    color: "text-slate-400",
    bg: "bg-slate-800/50",
    filter: "Ghosted",
  },
];
