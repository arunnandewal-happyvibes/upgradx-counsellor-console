/** The one input look used everywhere: tall, soft-grey until focused, red ring on focus, red on error. */
export const fieldClass =
  "w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 text-[15px] text-ink " +
  "placeholder:text-[#8a8a8a] transition-[border-color,box-shadow,background-color] duration-fast ease-out " +
  "hover:border-[#c9c9c9] focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-primary aria-[invalid=true]:bg-primary-fixed/40";
