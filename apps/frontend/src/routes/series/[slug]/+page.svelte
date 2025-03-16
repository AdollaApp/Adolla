<script lang="ts">
  import Container from "$lib/components/util/Container.svelte";

  const { data } = $props();

  const genres = ["Romance", "Smut", "The Smuttiest Smut of all Time"];
</script>

<!--
  ! Didn't I tell you not to look?
-->

<div class="absolute top-0 left-0 w-full h-[330px] bg-stroke-50">
  <div class="relative inset-0 h-[600px]">
    <div
      class="bg-cover bg-center absolute inset-0"
      style={`background-image: url('${data.manga.meta.posterUrl}')`}
    ></div>
    <div
      class="bg-gradient-to-b from-[#DBDEFF]/90 via-bg/70 to-bg/70 absolute inset-0"
    ></div>
  </div>
</div>

<Container>
  <div class="grid grid-cols-[300px_1fr] gap-4">
    <div class="mt-[1rem]">
      <div
        aria-label={data.manga.meta.title}
        class="pb-[150%] rounded-xl border border-stroke-100 shadow-custom row-span-4 md:row-span-1 bg-stroke-50 bg-cover bg-center"
        style={`background-image: url(${data.manga.meta.posterUrl});`}
      ></div>
    </div>
    <div class="mt-[7rem]">
      <h1 class="text-3xl font-bold line-clamp-1">{data.manga.meta.title}</h1>
      <span class="mt-2 inline-block text-text-light">
        {#each genres as genre, i}
          <span
            class={Number(i) !== 0
              ? "before:content-['·'] before:text-text-lighter before:mx-2"
              : ""}
          >
            {genre}
          </span>
        {/each}
      </span>

      <!-- BG color..... Sorry! -->
      <div
        class="w-[300vw] -translate-x-1/2 h-96 bg-bg mt-6 -z-10 relative"
      ></div>
    </div>
  </div>
</Container>
