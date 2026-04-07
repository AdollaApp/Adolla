<script lang="ts">
  import Button from "../util/Button.svelte";

  import FolderPlusIcon from "$lib/components/icons/FolderPlus.svelte";
  import OpenBookIcon from "$lib/components/icons/OpenBook.svelte";
  import type {
    ChapterDto,
    MangaMetaDto,
    ProgressItemDto,
  } from "$lib/api/manga";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { cleanChapterName } from "$lib/hooks/clean";

  const {
    latestProgressItem,
    chapters,
  }: { latestProgressItem?: ProgressItemDto; chapters: ChapterDto[] } =
    $props();
</script>

{#if latestProgressItem}
  <Button
    on:click={() =>
      goto(`/series/${page.params.slug}/${latestProgressItem.chapterId}`)}
    classes="w-full mt-2"
  >
    <OpenBookIcon />
    Continue reading {cleanChapterName(
      latestProgressItem.chapterName,
    ).toLowerCase()}
  </Button>
{:else}
  <Button
    on:click={() =>
      goto(`/series/${page.params.slug}/${chapters[chapters.length - 1].id}`)}
    classes="w-full mt-2"
  >
    <OpenBookIcon />
    Start reading
  </Button>
{/if}
<Button on:click={() => alert(1)} classes="w-full mt-2" buttonStyle="secondary">
  <FolderPlusIcon />
  Add to List
</Button>
