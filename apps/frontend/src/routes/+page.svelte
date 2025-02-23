<script>
  import MangaGrid from "$lib/components/manga/Grid.svelte";
  import MangaCard from "$lib/components/manga/MangaCard.svelte";
  import LargeHeading from "$lib/components/text/LargeHeading.svelte";
  import Container from "$lib/components/util/Container.svelte";
</script>

<Container>
  <LargeHeading>Continue Reading</LargeHeading>
  <MangaGrid>
    <MangaCard
      title="Karakai Jouzu no (Moto) Takagi-san"
      image="https://uploads.mangadex.org/covers/ddcebfa2-05a0-4fcd-9cd4-60d779c38f2c/d1ae5186-f108-4983-ac17-b2dbe6a38ae3.jpg.512.jpg"
      isNew={true}
      chapterName="Chapter 314.25"
      isNsfw={false}
      lang="English"
    />
    {#each new Array(10) as _}
      <MangaCard
        title="Telework Yotabanashi"
        image="https://uploads.mangadex.org/covers/d09c8abd-24ec-41de-ac8b-b6381a2f3a63/66c7de64-3449-4434-bd87-60a7c3400a1f.jpg.512.jpg"
        isNew={false}
        chapterName="Vol 1, chapter 8"
        isNsfw={false}
        lang="English"
      />
    {/each}
  </MangaGrid>
</Container>
