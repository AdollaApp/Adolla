<script lang="ts">
  import { getAuth } from "$lib/hooks/auth.js";
  import { api } from "$lib/hooks/fetch.js";
  import {
    getSettings,
    type ReaderSettings,
  } from "$lib/hooks/readerSettings.js";
  import { onMount } from "svelte";

  let settings = $state<ReaderSettings | null>(null);
  let scrollableElement = $state<Element | null>(null);
  let totalPages = $state(0);
  let currentPage = $state(0);

  onMount(async () => {
    settings = await getSettings();
    requestAnimationFrame(() => {
      scrollableElement
        ?.querySelector(`[data-page="${data.progressItem?.currentPage || 1}"]`)
        ?.scrollIntoView();
      onScroll();
    });
  });

  const { data } = $props();

  // const uniqueVolumeCount = $derived(() => {
  //   return Array.from(new Set(data.manga.chapters.map((ch) => ch.volumeId)))
  //     .length;
  // });

  // const chapterInChapterList = $derived(() => {
  //   return data.manga.chapters.find((ch) => ch.id === data.chapterId);
  // });

  function getCurrentPage() {
    if (!settings) return;
    const content = scrollableElement?.querySelectorAll("img.page");
    if (!content) return;

    const screenCenter = window.innerWidth / 2;
    let contentDistances: { content: Element; offset: number }[] = [];
    if (settings["reader-type"] === "horizontal-snap") {
      contentDistances = Array.from(content).map((img) => {
        const imgBound = img.getBoundingClientRect();
        const imgCenter = imgBound.left + imgBound.width / 2;
        return {
          content: img,
          offset: Math.abs(imgCenter - screenCenter),
        };
      });
    }

    contentDistances.sort((a, b) => a.offset - b.offset);
    return {
      totalPages: content.length,
      currentPage: Number(
        contentDistances[0]?.content.getAttribute("data-page"),
      ),
    };
  }

  let progressTimeout: NodeJS.Timeout | null = null;
  function setProgress(newCurrentPage: number, newTotalPages: number) {
    currentPage = newCurrentPage;
    totalPages = newTotalPages;
    if (progressTimeout) clearTimeout(progressTimeout);
    if (data.user && getAuth()) {
      progressTimeout = setTimeout(() => {
        if (data.user && getAuth()) {
          api.useFetch(
            fetch,
            `/api/v1/users/${data.user.id}/progress/${data.mangaId}/items/${data.chapterId}`,
            {
              method: "PUT",
              body: JSON.stringify({
                totalPages: newTotalPages,
                currentPage: newCurrentPage,
                chapterName: data.chapter.chapter.name,
              }),
            },
          );
        }
      }, 600);
    } else {
      throw new Error("LOL!");
    }
  }

  function onScroll() {
    const pageData = getCurrentPage();
    if (!pageData) return;
    const { totalPages, currentPage } = pageData;
    setProgress(currentPage, totalPages);
  }

  function cleanChapterName(name: string) {
    return name.replaceAll(/Chapter/g, "Ch");
  }
</script>

<!-- Images -->
{#if settings}
  <!-- Horizontal snap reader -->
  {#if settings["reader-type"] === "horizontal-snap"}
    {JSON.stringify(data.progressItem)}
    <div
      class="flex h-screen w-full max-w-full overflow-x-auto snap-x snap-mandatory"
      onscroll={onScroll}
      bind:this={scrollableElement}
    >
      {#each data.chapter.content as imageData, i}
        <img
          class="page w-screen min-w-screen h-screen object-contain snap-center"
          src={imageData.url}
          data-page={i + 1}
          data-chapter={data.chapterId}
          alt=""
        />
      {/each}
    </div>
  {/if}

  <!-- Bottom bit -->
  <div
    class="fixed bottom-8 left-8 lg:left-2 lg:bottom-2 bg-white p-2 py-1 rounded border border-stroke-100 tabular-nums space-x-2"
  >
    <span>
      {currentPage.toString().padStart(totalPages.toString().length, "0")} / {totalPages}
    </span>
    <!-- <span>
      {#if uniqueVolumeCount() > 0}
        {#if chapterInChapterList()}
          Vol {chapterInChapterList()?.volumeId}
        {/if}
      {/if}
      Ch {data.chapter.chapter.chapterNum}
    </span> -->
    <span class="opacity-50">•</span>
    <span>
      {cleanChapterName(data.chapter.chapter.name)}
    </span>
  </div>
{:else}
  Waiting for settings...
{/if}
