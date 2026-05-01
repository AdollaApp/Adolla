<script lang="ts">
  import { page } from "$app/state";
  import MangaGrid from "$lib/components/manga/Grid.svelte";
  import MangaCard from "$lib/components/manga/MangaCard.svelte";
  import SearchBox from "$lib/components/nav/SearchBox.svelte";
  import Container from "$lib/components/util/Container.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const scrapers: { name: string; id: string }[] = [
    {
      name: "WeebCentral",
      id: "weebcentral",
    },
    {
      name: "MangaDex",
      id: "mangadex",
    },
  ];

  function makeScraperUrl(scraperId: string) {
    return `/search/${scraperId}${page.url.search}`;
  }
</script>

<!-- Footer-adjacent source filter -->
<div
  class="fixed w-full py-2 bg-bg border-t border-stroke-100 bottom-[var(--footer-height)] z-100"
>
  <div class="flex gap-2 w-full px-4">
    {#each scrapers as scraper}
      <a
        href={makeScraperUrl(scraper.id)}
        class={[
          "w-full py-2 text-center rounded border border-stroke-100",
          data.provider === scraper.id
            ? "bg-accent text-text-on-accent"
            : "bg-transparent",
        ].join(" ")}>{scraper.name}</a
      >
    {/each}
  </div>
</div>

<!-- Page content -->
<Container>
  <div class="mb-4 lg:hidden">
    <SearchBox mobile />
  </div>
  {#if data.searchResults}
    <MangaGrid>
      {#each data.searchResults as result}
        <MangaCard
          id={result.mangaId}
          title={result.meta.title}
          image={result.meta.posterUrl}
          isNsfw={result.meta.nsfw}
          isNew={false}
          lang="EN-US"
          allProgress={data.progressItems}
        />
      {/each}
    </MangaGrid>
  {/if}
</Container>
