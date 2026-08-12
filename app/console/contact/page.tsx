"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { Icon } from "@/components/ui/Icon";

type Contact = { address: string; phone: string; email: string };

export default function ContactPage() {
  const { data, selectedCity } = useCityFetch<Contact>("/api/city-contact");

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">Contact Us</h1>
      <div className="h-0.5 bg-primary w-16 mb-4" />
      <p className="text-body-lg text-secondary max-w-2xl mb-section-gap">
        Find our local centre or reach out for dedicated counsellor support.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="elevate-3d bg-surface-container-lowest border border-surface-variant rounded shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div
              className="w-full md:w-2/5 h-40 md:h-auto flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a1c1c, #e41f26 160%)" }}
            >
              <Icon name="location_city" className="text-white opacity-80" size={56} fill />
            </div>
            <div className="w-full md:w-3/5 p-6 flex flex-col gap-4">
              <h2 className="text-headline-md text-on-surface">{selectedCity?.name ?? "Loading..."}</h2>
              {data && (
                <>
                  <div className="flex items-start gap-3">
                    <Icon name="business" className="text-primary mt-1" size={20} />
                    <div>
                      <span className="text-label-bold font-bold text-secondary block uppercase">Address</span>
                      <p className="text-body-md text-on-surface">{data.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="call" className="text-primary" size={20} />
                    <div>
                      <span className="text-label-bold font-bold text-secondary block uppercase">Phone</span>
                      <p className="text-body-md text-on-surface">{data.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="mail" className="text-primary" size={20} />
                    <div>
                      <span className="text-label-bold font-bold text-secondary block uppercase">Email</span>
                      <p className="text-body-md text-on-surface">{data.email}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="elevate-3d bg-surface-container-low border border-surface-variant p-6 rounded shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim rounded-bl-full opacity-20 -mr-16 -mt-16 pointer-events-none" />
            <h3 className="text-headline-sm text-on-surface mb-2">Counsellor Services</h3>
            <p className="text-body-sm text-secondary mb-6">
              Need to modify a batch schedule, request a course change, or escalate an issue? Use
              our internal service desk.
            </p>
            <button
              disabled
              className="w-full bg-surface-variant text-secondary-fixed-dim font-bold text-label-bold py-3 px-4 rounded border border-surface-dim cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="lock" size={18} />
              Need a course change? Raise a request
            </button>
            <p className="text-body-sm text-tertiary mt-3 text-center italic">
              Service portal temporarily unavailable. Module coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
