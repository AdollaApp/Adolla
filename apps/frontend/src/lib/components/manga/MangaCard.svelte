<script lang="ts">
  import ChevronsRight from "../icons/ChevronsRight.svelte";
  import Badge from "../util/Badge.svelte";

  // These props are temporary
  export let title;
  export let image;
  export let isNew;
  export let chapterName;
  export let isNsfw;
  export let lang;
</script>

<div>
  <div
    class="pb-[150%] rounded-xl border border-stroke-100 shadow-custom"
    style={`background-image: url(${image}); background-size: cover; background-position: center;`}
  ></div>
  <div>
    <h3 class="font-bold mt-2 text-[18px] leading-6 line-clamp-2">
      <img
        alt="Mangasee"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmV9SHT-qiohTt77FBMS6iky25BF0Q5GuVUA&s"
        class="-mt-1 w-[20px] aspect-square inline bg-stroke-100 rounded"
      />
      {title}
    </h3>
    <a
      href="/snoop"
      class="text-text-light hover:text-text group transition-colors duration-150 text-[14px] mt-2.5 block p-1 px-2 -mx-2 rounded-md hover:bg-hover-bg/8"
    >
      <h4 class="flex justify-between items-center gap-2">
        <div class="flex gap-[inherit] items-center">
          {#if isNew}
            <Badge>New</Badge>
          {/if}
          <span class="">
            {chapterName}
          </span>
        </div>
        <div
          class={[
            "mr-1",
            isNew
              ? "opacity-0 duration-150 transition-all group-hover:opacity-100 -translate-x-0.5 group-hover:translate-x-0"
              : "",
          ].join(" ")}
        >
          <ChevronsRight />
        </div>
      </h4>
    </a>
  </div>
</div>
