<script lang="ts">
  import { getAuth } from "$lib/hooks/auth.js";
  import { api } from "$lib/hooks/fetch.js";
  1;
  const { data } = $props();
  if (data.user && getAuth()) {
    api.useFetch(
      fetch,
      `/api/v1/users/${data.user.id}/progress/${data.mangaId}/items/${data.chapterId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          totalPages: 30,
          currentPage: 10,
          chapterName: data.chapter.chapter.name,
        }),
      },
    );
  }
</script>

<!-- Images -->
<div>
  {#each data.chapter.content as imageThingyMeBob}
    <img src={imageThingyMeBob.url} alt="" />
  {/each}
</div>
