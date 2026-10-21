"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Chip, Tag } from "@/components/ui/Chip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField, TextArea, SelectField } from "@/components/ui/Field";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader } from "@/components/ui/SectionHeader";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-outline-variant py-10">
      <h2 className="mb-6 text-headline-md font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function UiKitClient() {
  const [mode, setMode] = useState<"offline" | "online">("offline");
  const [picked, setPicked] = useState<string[]>(["Tech"]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <div className="max-w-5xl">
      <div className="eyebrow mb-2">Design system</div>
      <h1 className="text-display-lg font-extrabold">UI kit</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
        The building blocks every screen uses. Change a component here and it changes everywhere.
      </p>

      <Block title="Type">
        <div className="space-y-4">
          <div className="font-display text-display-xl font-extrabold">
            Big <span className="text-primary">moves.</span>
          </div>
          <div className="font-display text-display-lg font-extrabold">Display — section titles</div>
          <div className="font-display text-headline-md font-bold">Headline — card titles</div>
          <div className="text-body-lg">Body large — lead paragraphs and hero copy.</div>
          <div className="text-body-md text-on-surface-variant">Body — supporting text, descriptions, table cells.</div>
          <div className="eyebrow">Eyebrow — section kicker</div>
          <div className="font-display text-stat-lg">
            320<span className="text-primary">+</span>
          </div>
        </div>
      </Block>

      <Block title="Colour">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Red", "bg-primary", "#E41F26 · the one accent"],
            ["Red deep", "bg-primary-container", "#B4151A · hover/press"],
            ["Ink", "bg-ink", "#111111 · text & statement blocks"],
            ["Grey fill", "bg-surface-container-low border border-outline-variant", "#F7F7F7 · inputs, quiet blocks"],
            ["Hairline", "bg-outline-variant", "#E3E3E3 · borders"],
          ].map(([name, cls, note]) => (
            <div key={name}>
              <div className={`h-20 rounded-2xl ${cls}`} />
              <div className="mt-2 text-[14px] font-semibold">{name}</div>
              <div className="text-[12px] text-on-surface-variant">{note}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="surface">Surface</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large call to action</Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1600);
            }}
          >
            {loading ? "Saving…" : "Click to load"}
          </Button>
          <LinkButton href="/admin/ui-kit" variant="outline">
            Link button
          </LinkButton>
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="eyebrow mb-3">Default</div>
            <div className="font-display text-headline-sm">Hairline + lift on hover</div>
          </Card>
          <Card tone="muted" className="p-6">
            <div className="eyebrow mb-3">Muted</div>
            <div className="font-display text-headline-sm">Quiet grey block</div>
          </Card>
          <Card tone="ink" className="p-6">
            <div className="mb-3 text-label-bold uppercase text-white/60">Ink</div>
            <div className="font-display text-headline-sm">Statement block</div>
          </Card>
          <Card tone="accent" className="p-6">
            <div className="mb-3 text-label-bold uppercase text-white/80">Accent</div>
            <div className="font-display text-headline-sm">Selected / best match</div>
          </Card>
        </div>
      </Block>

      <Block title="Badges, tags and chips">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="red">Best match</Badge>
          <Badge variant="redOutline">Offline</Badge>
          <Badge>6 months</Badge>
          <Badge variant="solidDark">New</Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag dark>B.Tech graduate</Tag>
          <Tag>Interested in CSS</Tag>
          <Tag>Prefers Pune</Tag>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {["Tech", "FinTech", "SaaS / Enterprise Software", "AI & Deeptech"].map((t) => (
            <Chip
              key={t}
              selected={picked.includes(t)}
              onClick={() => setPicked((xs) => (xs.includes(t) ? xs.filter((x) => x !== t) : [...xs, t]))}
            >
              {t}
            </Chip>
          ))}
        </div>
      </Block>

      <Block title="Segmented control">
        <SegmentedControl
          label="Batch mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "offline", label: "Offline · Pune" },
            { value: "online", label: "Online" },
          ]}
        />
        <p className="mt-3 text-body-md text-on-surface-variant">Showing {mode} batches.</p>
      </Block>

      <Block title="Form fields">
        <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
          <TextField label="Learner name" placeholder="Full name" />
          <TextField label="Phone" placeholder="10-digit mobile" hint="We'll only use this to share batch details." />
          <TextField label="Email" defaultValue="not-an-email" error="Enter a valid email address." />
          <SelectField label="Centre" defaultValue="">
            <option value="" disabled>
              Choose a centre
            </option>
            <option>Pune</option>
            <option>BKC-Mumbai</option>
          </SelectField>
          <TextArea wrapperClassName="sm:col-span-2" label="Notes" placeholder="Anything the next counsellor should know" />
        </div>
      </Block>

      <Block title="Loading states">
        <div className="grid gap-5 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12 w-2/3" />
          </div>
        </div>
      </Block>

      <Block title="Feedback">
        <div className="flex flex-wrap gap-3">
          <Button variant="dark" onClick={() => setOpen(true)}>
            Open modal
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Session saved", body: "Summary email sent to the learner." })}
          >
            Success toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ tone: "error", title: "Couldn't save", body: "Check the connection and try again." })}
          >
            Error toast
          </Button>
        </div>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Close this session?"
          description="The learner gets their summary email and a link to rate the session."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Keep editing
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  toast({ title: "Session closed" });
                }}
              >
                Close session
              </Button>
            </>
          }
        >
          <TextField label="Learner email" defaultValue="learner@example.com" />
        </Modal>
      </Block>

      <Block title="Section header">
        <SectionHeader
          eyebrow="Recommended for you"
          title="Three matches, ranked."
          action={
            <a href="#" className="border-b-[1.5px] border-current pb-0.5 text-[15px] font-semibold text-ink hover:text-primary">
              Compare all programs
            </a>
          }
        />
      </Block>
    </div>
  );
}
