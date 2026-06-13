import {
  Atom,
  BadgeCheck,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  BrainCircuit,
  Building2,
  Crown,
  Dna,
  Download,
  FlaskConical,
  Flame,
  Globe,
  Heart,
  HeartHandshake,
  Landmark,
  Laptop,
  Medal,
  PenLine,
  Rocket,
  Ruler,
  Scroll,
  Sigma,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Registry of named icons used for data-driven fields (subjects, achievements)
 * whose icon is stored in the database as a Lucide icon name rather than a
 * native emoji. Keeping it a flat map means a stored value renders identically
 * on every platform.
 */
export const ICON_REGISTRY = {
  Atom,
  BadgeCheck,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  BrainCircuit,
  Building2,
  Crown,
  Dna,
  Download,
  FlaskConical,
  Flame,
  Globe,
  Heart,
  HeartHandshake,
  Landmark,
  Laptop,
  Medal,
  PenLine,
  Rocket,
  Ruler,
  Scroll,
  Sigma,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

/** Icon names offered when picking an icon for a subject in the admin panel. */
export const SUBJECT_ICON_NAMES: IconName[] = [
  "Atom",
  "FlaskConical",
  "Dna",
  "Sigma",
  "Ruler",
  "Laptop",
  "BookOpen",
  "BookMarked",
  "PenLine",
  "Landmark",
  "Building2",
  "TrendingUp",
  "BarChart3",
  "Scroll",
  "Users",
  "HeartHandshake",
  "Brain",
  "BrainCircuit",
  "Globe",
];

export function isIconName(value: string): value is IconName {
  return value in ICON_REGISTRY;
}

/**
 * Renders a named icon from the registry. Falls back to a neutral icon when the
 * stored value is unknown (e.g. legacy emoji that predates the migration).
 */
export function DynamicIcon({
  name,
  className,
  fallback = BookOpen,
}: {
  name: string;
  className?: string;
  fallback?: LucideIcon;
}) {
  const Icon = isIconName(name) ? ICON_REGISTRY[name] : fallback;
  return <Icon className={className} aria-hidden />;
}
