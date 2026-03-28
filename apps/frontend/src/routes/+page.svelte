<script>
  import MangaGrid from "$lib/components/manga/Grid.svelte";
  import MangaCard from "$lib/components/manga/MangaCard.svelte";
  import LargeHeading from "$lib/components/text/LargeHeading.svelte";
  import Container from "$lib/components/util/Container.svelte";

  const { data } = $props();
</script>

<Container pageContainer={true}>
  <LargeHeading>Continue Reading</LargeHeading>
  {#if data.progressItems}
    <MangaGrid>
      {#each data.progressItems as result}
        <MangaCard
          id={result.mangaId}
          title={result.mangaMeta.meta.title}
          image={result.mangaMeta.meta.posterUrl}
          isNsfw={result.mangaMeta.meta.nsfw}
          isNew={false}
          lang="EN-US"
          allProgress={data.progressItems}
        />
      {/each}
    </MangaGrid>
  {/if}
</Container>
