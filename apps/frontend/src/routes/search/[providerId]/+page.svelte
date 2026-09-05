<script lang="ts">
  import { page } from "$app/state";
  import MangaGrid from "$lib/components/manga/Grid.svelte";
  import MangaCard from "$lib/components/manga/MangaCard.svelte";
  import SearchBox from "$lib/components/nav/SearchBox.svelte";
  import Button from "$lib/components/util/Button.svelte";
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
    /*{
      name: "BatCave",
      id: "batcave",
    },*/
  ];

  function makeScraperUrl(scraperId: string) {
    return `/search/${scraperId}${page.url.search}`;
  }
</script>

<!-- Mobile footer-adjacent source filter -->
<div
  class="fixed w-full py-2 bg-bg border-t border-stroke-100 bottom-[var(--footer-height)] z-100 md:hidden"
>
  <div class="flex gap-2 w-full px-4">
    {#each scrapers as scraper}
      <a
        href={makeScraperUrl(scraper.id)}
        class={[
          "w-full py-2 text-center rounded-lg border",
          data.provider === scraper.id
            ? "bg-accent text-text-on-accent border-accent"
            : "bg-transparent border-stroke-100",
        ].join(" ")}>{scraper.name}</a
      >
    {/each}
  </div>
</div>

<!-- Page content -->
<Container>
  <div class="mb-4 md:hidden">
    <SearchBox mobile />
  </div>
  <!-- Desktop source filter -->
  <div class="hidden md:flex gap-2 mb-4">
    {#each scrapers as scraper}
      <a href={makeScraperUrl(scraper.id)}>
        <Button
          buttonStyle={data.provider === scraper.id ? "primary" : "secondary"}
        >
          {scraper.name}
        </Button>
      </a>
    {/each}
  </div>
  <!-- Search results -->
  {#if data.searchResults}
    <MangaGrid>
      {#each data.searchResults as result}
        <MangaCard
          id={result.mangaId}
          title={result.meta.title}
          image={result.meta.posterUrl}
          isNsfw={result.meta.nsfw}
          isNew={false}
          scraper={result.scraper}
          lang="EN-US"
          allProgress={data.progressItems}
        />
      {/each}
    </MangaGrid>
  {/if}
</Container>
