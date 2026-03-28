<script lang="ts">
  import MangaGrid from "$lib/components/manga/Grid.svelte";
  import MangaCard from "$lib/components/manga/MangaCard.svelte";
  import Container from "$lib/components/util/Container.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Container>
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
