<script lang="ts">
  import type { MangaStatus } from "$lib/api/manga";

  const styles: Record<MangaStatus, string> = {
    ongoing: "border-[#A0EDA8] bg-[#E3FFE9]/75 text-[#34AF26]",
    finished: "border-[#A0EDA8] bg-[#E3FFE9]/75 text-[#34AF26]",
    cancelled:
      "border-stroke-red text-red-800 bg-gradient-to-br from-red-100 to-transparent",
    hiatus: "border-[#EDC9A0] bg-[#FFF2E3]/100 text-[#E88F29]",
  } as const;

  const {
    status,
  }: {
    status: MangaStatus;
  } = $props();
</script>

<div
  class={[
    "px-1.5 rounded-lg border inline-flex items-center gap-2 text-sm",
    styles[status] ?? "",
  ].join(" ")}
>
  <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
  {status.slice(0, 1).toUpperCase()}{status.slice(1)}
</div>
