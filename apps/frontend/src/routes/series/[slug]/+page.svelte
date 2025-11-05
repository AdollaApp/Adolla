<script lang="ts">
  import FolderPlusIcon from "$lib/components/icons/FolderPlus.svelte";
  import OpenBook from "$lib/components/icons/OpenBook.svelte";
  import OpenBookIcon from "$lib/components/icons/OpenBook.svelte";

  import Button from "$lib/components/util/Button.svelte";
  import Container from "$lib/components/util/Container.svelte";

  const { data } = $props();

  console.log(data);
  console.log(data.manga.chapters.sort((a, b) => a.chapterNum - b.chapterNum));

  const genres = ["Romance", "Smut", "The Smuttiest Smut of all Time"];
</script>

<div class="w-full">
  <div class="bg-stroke-50 absolute top-0 left-0 inset-0 h-[330px]">
    <div
      class="bg-cover bg-center absolute inset-0"
      style={`background-image: url('${data.manga.meta.posterUrl}')`}
    ></div>
    <div
      class="bg-gradient-to-b from-[#DBDEFF]/90 via-bg/70 to-bg/90 absolute inset-0"
    ></div>
  </div>
</div>

<Container>
  <div class="grid grid-cols-[300px_1fr] gap-4">
    <div class="mt-[1rem] relative z-10">
      <div
        aria-label={data.manga.meta.title}
        class="pb-[150%] rounded-xl border border-stroke-100 shadow-custom row-span-4 md:row-span-1 bg-stroke-50 bg-cover bg-center"
        style={`background-image: url(${data.manga.meta.posterUrl});`}
      ></div>

      <Button on:click={() => alert(1)} classes="w-full mt-2">
        <OpenBookIcon />
        Start reading
      </Button>
      <Button
        on:click={() => alert(1)}
        classes="w-full mt-2"
        buttonStyle="secondary"
      >
        <FolderPlusIcon />
        Add to List
      </Button>
    </div>
    <div class="mt-[7rem]">
      <div class="relative z-10">
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
      </div>

      <!-- BG color..... Sorry! -->
      <div class="absolute w-[300vw] -translate-x-1/2 h-96 bg-bg mt-6"></div>
      <div class="h-6"></div>

      <!-- Back to your regularly scheduled content, now -->
      <div class="relative z-10 mt-4.5 text-text-light">
        <p>{data.manga.meta.description}</p>
      </div>
    </div>
  </div>
</Container>
