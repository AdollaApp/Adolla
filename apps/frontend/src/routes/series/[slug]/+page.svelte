<script lang="ts">
  import MangaPageButtons from "$lib/components/manga/MangaPageButtons.svelte";
  import SecondaryHeading from "$lib/components/text/SecondaryHeading.svelte";
  import Badge from "$lib/components/util/Badge.svelte";

  import Container from "$lib/components/util/Container.svelte";
  import StatusTag from "$lib/components/util/StatusTag.svelte";

  const { data } = $props();

  data.manga.chapters.sort((b, a) => a.chapterNum - b.chapterNum);

  const genres = data.manga.meta.tags || ["No tags"];
  const lastReadProgressItem = data.progressItems?.toSorted((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  })?.[0];
  const lastReadChapterId = lastReadProgressItem?.chapterId;
</script>

<div class="w-full">
  <div class="-mt-30 relative bg-stroke-50 w-full">
    <div
      class="absolute bg-cover bg-center w-full h-full"
      style={`background-image: url('${data.manga.meta.posterUrl}')`}
    ></div>
    <div
      class="relative top-0 left-0 inset-0 bg-gradient-to-b from-bg/90 via-bg/70 to-bg/90"
    >
      <Container>
        <div
          class="block lg:grid lg:grid-cols-[300px_1fr] gap-6 pt-[calc(190px-env(safe-area-inset-top)*0.25)] lg:pt-60 pb-5"
        >
          <div></div>
          <div>
            <StatusTag status={data.manga.meta.status} />
            <h1 class="text-3xl font-bold mt-2">
              {data.manga.meta.title || "No title? Dang. Wild."}
            </h1>
            <span class="mt-2 inline-block text-text-light break-words">
              {#if data.manga.meta.nsfw}
                <Badge style="red">NSFW</Badge>
                <span class="inline-block ml-2">·</span>
              {/if}
              {#each genres as genre, i}
                <span
                  class={Number(i) !== 0
                    ? "before:content-['·'] before:text-text-lighter before:mx-2"
                    : ""}
                >
                  &ThinSpace;{genre}
                </span>
              {/each}
            </span>
          </div>
        </div>
      </Container>
    </div>
  </div>
</div>

<Container pageContainer>
  <div class="grid lg:grid-cols-[300px_1fr] gap-6">
    <div class="hidden lg:block -mt-35 relative z-10">
      <div class="float-left lg:float-none lg:row-span-1 row-span-3">
        <div
          aria-label={data.manga.meta.title}
          class="w-30 hidden lg:block lg:w-full pb-[150%] rounded-xl border border-stroke-100 shadow-custom row-span-4 md:row-span-1 bg-stroke-50 bg-cover bg-center"
          style={`background-image: url(${data.manga.meta.posterUrl});`}
        ></div>
      </div>
      <div class="block">
        <MangaPageButtons
          latestProgressItem={lastReadProgressItem}
          chapters={data.manga.chapters}
        />
      </div>
    </div>

    <div class="mt-6 lg:mt-[1.5rem]">
      <!-- Back to your regularly scheduled content, now -->
      <div class="relative z-10 text-text-light">
        <p>{data.manga.meta.description}</p>
      </div>

      <div class="relative z-10 block lg:hidden">
        <MangaPageButtons
          latestProgressItem={lastReadProgressItem}
          chapters={data.manga.chapters}
        />
      </div>

      <div class="relative z-10 mt-8">
        <!-- Chapters -->
        <SecondaryHeading>Chapters</SecondaryHeading>
        <div class="border border-stroke-100 rounded-lg bg-secondary-bg">
          {#each data.manga.chapters as chapter, i}
            {@const chapterProgressData = data.progressItems?.find((pr) => {
              return pr.chapterId === chapter.id;
            })}
            {#if i !== 0}
              <hr class="w-full h-px border-0 bg-stroke-100 m-0" />
            {/if}
            <a
              class="flex justify-between items-center p-3"
              href={`/series/${data.slug}/${chapter.id}`}
            >
              <div class="flex gap-4 items-center">
                <div class="w-2 h-2 rounded-full bg-black/20"></div>
                <span>{chapter.name}</span>
              </div>

              <div class="flex gap-4">
                {#if chapterProgressData}
                  <span
                    class={lastReadChapterId == chapter.id
                      ? "text-accent"
                      : "text-text-light"}
                  >
                    {Math.round(
                      (chapterProgressData.currentPage /
                        chapterProgressData.totalPages) *
                        100,
                    )}%
                  </span>
                {/if}
                <span class="text-text-light">
                  {chapter.publishedAt.split("T")[0]}
                </span>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</Container>
