<script lang="ts">
  import ChevronsRight from "../icons/ChevronsRight.svelte";
  import Badge from "../util/Badge.svelte";
  import { page } from "$app/state";
  import type { ScraperDto, ProgressItemDto } from "$lib/api/manga";

  type Props = {
    id: string;
    title: string;
    image: string | undefined;
    isNew: boolean;
    isNsfw: boolean;
    lang: string;
    allProgress: ProgressItemDto[];
    scraper: ScraperDto;
  };
  const { id, title, image, isNew, isNsfw, lang, allProgress, scraper }: Props =
    $props();

  let chapterName = $state("Not started");
  let chapterLink = $state(`/series/${id}`);
  function updateChapterName() {
    const thisMangaInProgressItems = allProgress.find(
      (progressItem) => progressItem.mangaId === id,
    );
    if (thisMangaInProgressItems) {
      chapterName = `${thisMangaInProgressItems.chapterName} (${Math.round((thisMangaInProgressItems.currentPage / thisMangaInProgressItems.totalPages) * 100)}%)`;
      chapterLink = `/series/${id}/${thisMangaInProgressItems.chapterId}`;
    }
  }

  updateChapterName();
  $effect(updateChapterName);
</script>

<div
  class="relative grid grid-cols-[100px_1fr] grid-rows-[1fr_auto_auto_1fr] gap-x-4 md:gap-x-0 md:grid-cols-1 md:grid-rows-[auto_1fr_auto] items-center"
>
  <a
    aria-label={title}
    href={`/series/${id}`}
    class="pb-[150%] rounded-xl border border-stroke-100 shadow-custom row-span-4 md:row-span-1 [background-size:calc(100%+5px)] bg-center relative"
    style={`background-image: url(${image});`}
  >
    {#if isNsfw}
      <div class="absolute top-2 left-2">
        <Badge style="red">NSFW</Badge>
      </div>
    {/if}
  </a>
  <div class="block md:hidden"></div>
  <a href={`/series/${id}`}>
    <h3
      class="font-bold mt-2 text-[20px] md:text-[18px] leading-6 line-clamp-2"
    >
      <img
        alt={scraper.name}
        src={scraper.image}
        class="-mt-1 w-[20px] aspect-square inline bg-stroke-100 rounded"
      />
      {title}
    </h3>
  </a>
  <a
    href={chapterLink}
    class="text-text-light hover:text-text group transition-colors duration-150 md:text-[14px] mt-2.5 block p-1 px-2 -mx-2 rounded-md hover:bg-hover-bg/8"
  >
    <h4 class="flex justify-between items-center gap-2">
      <div class="flex gap-[inherit] items-center">
        {#if isNew}
          <Badge>New</Badge>
        {/if}
        <span>
          {chapterName}
        </span>
      </div>
      <div
        class={[
          "mr-1",
          isNew
            ? "opacity-0 duration-150 transition-all group-hover:opacity-100 -translate-x-0.5 group-hover:translate-x-0"
            : "",
        ].join(" ")}
      >
        <ChevronsRight />
      </div>
    </h4>
  </a>
</div>
