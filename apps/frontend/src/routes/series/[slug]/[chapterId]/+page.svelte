<script lang="ts">
  import { goto, preloadData } from "$app/navigation";
  import TitleScreen from "$lib/components/reader/TitleScreen.svelte";
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

  function scrollToProgress() {
    console.log("DO SCROLL");
    requestAnimationFrame(() => {
      console.log(data.pageOverride);
      let desiredElement = scrollableElement?.querySelector(
        `[data-page="${data.pageOverride ?? data.progressItem?.currentPage}"]`,
      );
      if (data.pageOverride === -1) {
        desiredElement = Array.from(
          scrollableElement?.querySelectorAll("img.page") || [],
        ).pop();
      }
      if (!desiredElement)
        desiredElement = document.querySelector('[data-current="true"]');
      desiredElement?.scrollIntoView();
      onScroll();
    });
  }

  onMount(async () => {
    settings = await getSettings();
    scrollToProgress;
  });

  $effect(() => {
    if (data.chapterId) {
      scrollToProgress();
    }
  });

  const { data } = $props();

  // const uniqueVolumeCount = $derived(() => {
  //   return Array.from(new Set(data.manga.chapters.map((ch) => ch.volumeId)))
  //     .length;
  // });

  const chapterInChapterList = $derived(() => {
    return data.manga.chapters.find((ch) => ch.id === data.chapterId);
  });

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
      progressTimeout = setTimeout(async () => {
        if (data.user && getAuth()) {
          await api.useFetch(
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

        // User has stopped scrolling
        // See if a "title screen" is on-page with a chapter id
        // If there is, navigate to that
        // Infinite scrolling babyyyyyy
        const titleScreens =
          scrollableElement?.querySelectorAll(".is-title-screen");
        if (!titleScreens) return;
        const titleScreensSorted = Array.from(titleScreens)
          .map((t) => {
            const rect = t.getBoundingClientRect();
            return {
              el: t,
              dist: Math.abs(rect.left + rect.top),
            };
          })
          .sort((a, b) => a.dist - b.dist);
        console.log(titleScreensSorted);
        if (titleScreensSorted[0].dist < 100) {
          const chId = titleScreensSorted[0].el.getAttribute("data-chapter-id");
          const p = titleScreensSorted[0].el.getAttribute("data-p");
          if (!chId) return;
          goto(`${chId}?p=${p ?? 0}`);
          console.log("GOING TO", chId);
        }
        if (titleScreensSorted[0].dist < 2000) {
          const chId = titleScreensSorted[0].el.getAttribute("data-chapter-id");
          if (!chId) return;
          preloadData(chId);
        }
      }, 200);
    } else {
      throw new Error("LOL!");
    }
  }

  const chapters = $derived(() => {
    return data.manga.chapters.toSorted((a, b) => a.chapterNum - b.chapterNum);
  });

  const chapterIndex = $derived(() => {
    return chapters().findIndex((ch) => ch.id === data.chapterId);
  });
  const nextChapter = $derived(() => {
    return chapters()[chapterIndex() + 1];
  });
  const prevChapter = $derived(() => {
    return chapters()[chapterIndex() - 1];
  });

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
    <!-- <span class="fixed top-0">
      {JSON.stringify(data.progressItem)}
    </span> -->

    <div
      class="flex h-screen w-full max-w-full overflow-x-auto snap-x snap-mandatory"
      onscroll={onScroll}
      bind:this={scrollableElement}
    >
      {#if prevChapter()}
        <TitleScreen
          name={prevChapter().name}
          chapterId={prevChapter().id}
          mangaMeta={data.manga.meta}
          p={-1}
        />
      {/if}
      <TitleScreen
        name={chapterInChapterList()?.name || ""}
        mangaMeta={data.manga.meta}
        current
      />
      {#each data.chapter.content as imageData, i}
        <img
          class="page w-screen min-w-screen h-screen object-contain snap-center"
          src={imageData.url}
          data-page={i + 1}
          data-chapter={data.chapterId}
          alt=""
        />
      {/each}
      {#if nextChapter()}
        <TitleScreen
          name={nextChapter().name}
          chapterId={nextChapter().id}
          mangaMeta={data.manga.meta}
        />
      {/if}
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
