import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

function highestPackage(labels: string[]) {
  let max = 0;
  for (const label of labels) {
    const match = label.match(/₹\s?(\d+(?:\.\d+)?)\s?LPA/i);
    if (match) max = Math.max(max, parseFloat(match[1]));
  }
  return max > 0 ? `₹ ${max} LPA` : "₹ 42 LPA";
}

export async function HeroSection() {
  const [cityCount, stories] = await Promise.all([
    prisma.city.count(),
    prisma.successStory.findMany({ select: { packageLabel: true } }),
  ]);

  const topCtc = highestPackage(stories.map((s) => s.packageLabel));

  return (
    <section id="hero" className="flex flex-col gap-section-gap">
      {/* Top Strip: Global Stat */}
      <div className="w-full bg-surface-container-lowest border-b border-surface-variant py-4 px-card-padding shadow-sm rounded flex items-center gap-4">
        <span className="text-stat-lg text-primary">{cityCount}+</span>
        <span className="text-label-bold font-bold text-secondary uppercase tracking-wide">
          Learning Centres Across India
        </span>
      </div>

      {/* Bento Hero */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-8 b2b-card elevate-3d p-8 flex flex-col justify-center relative overflow-hidden bg-surface-bright">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <h1 className="text-display-lg text-on-surface mb-4 max-w-2xl leading-tight">
            <span className="text-primary">upGrad X</span> can transform your journey
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-xl mb-8 border-l-2 border-primary pl-4 py-1 editable-field">
            Offline, mentor-led programs built with hiring partners — from classroom to career, in
            one connected track.
          </p>
          <div className="flex gap-4">
            <a href="#programs">
              <Button variant="primary">Explore Programs</Button>
            </a>
            <a href="#faq">
              <Button variant="secondary">Book Counselling</Button>
            </a>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-gutter">
          <div className="b2b-card elevate-3d p-6 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-label-bold font-bold text-secondary uppercase mb-2 block">
                Placement Record
              </span>
              <div className="text-stat-lg text-on-surface">85%</div>
              <p className="text-body-sm text-on-surface-variant mt-1 editable-field inline-block">
                Avg. successful transitions within 6 months
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-variant">
              <span className="text-label-bold font-bold text-secondary uppercase mb-2 block">Highest CTC</span>
              <div className="text-headline-md text-primary">{topCtc}</div>
            </div>
          </div>
          <div className="b2b-card elevate-3d p-6 flex-1 bg-surface-container-low flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center shrink-0">
              <Icon name="trending_up" className="text-primary" />
            </div>
            <div>
              <div className="text-headline-sm text-on-surface">Career Growth</div>
              <div className="text-body-sm text-on-surface-variant editable-field">
                Tailored pathways for senior roles.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
