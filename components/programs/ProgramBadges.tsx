"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useRecommendedSlugs } from "@/lib/recommendedPrograms";

export function RecommendedStar({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-[0.08em]",
        onDark ? "bg-white text-primary" : "bg-primary text-white",
        className,
      )}
    >
      <Icon name="star" size={15} fill />
      Recommended
    </span>
  );
}

export function IitSeal({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold",
        onDark ? "border-white/60 bg-white/10 text-white" : "border-[#c9a227] bg-[#fdf6e3] text-[#7a5c00]",
        className,
      )}
      title="Certification from IIT Roorkee / IIT Jammu"
    >
      <Icon name="workspace_premium" size={16} fill />
      Certified by IIT
    </span>
  );
}

/** Star when this program is the learner's top recommendation, plus the IIT seal. */
export function ProgramBadges({ slug, iit, onDark }: { slug: string; iit: boolean; onDark?: boolean }) {
  const recommended = useRecommendedSlugs();
  const starred = recommended[0] === slug;
  if (!starred && !iit) return null;
  return (
    <>
      {starred && <RecommendedStar onDark={onDark} />}
      {iit && <IitSeal onDark={onDark} />}
    </>
  );
}

/** Same badges as a standalone row; renders nothing when neither applies. */
export function ProgramBadgeRow({ slug, iit, className }: { slug: string; iit: boolean; className?: string }) {
  const recommended = useRecommendedSlugs();
  if (recommended[0] !== slug && !iit) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <ProgramBadges slug={slug} iit={iit} />
    </div>
  );
}
