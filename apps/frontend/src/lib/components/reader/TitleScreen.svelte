<script lang="ts">
  import type { MangaMetaDto } from "$lib/api/manga";

  const {
    name,
    chapterId,
    mangaMeta,
    current = false,
    p,
  }: {
    name: string;
    chapterId?: string;
    mangaMeta: MangaMetaDto;
    current?: boolean;
    p?: number;
  } = $props();
</script>

<div
  data-chapter-id={chapterId}
  class="is-title-screen w-screen min-w-screen h-full flex justify-center items-center snap-center"
  data-current={current}
  data-p={p}
>
  <div
    class="w-70 h-100 pb-6 flex items-end justify-center rounded-xl border border-stroke-100 text-text-on-accent font-bold bg-cover"
    style={`background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), var(--color-accent)), url('${mangaMeta.posterUrl}');`}
  >
    <span>{name}</span>
  </div>
</div>
