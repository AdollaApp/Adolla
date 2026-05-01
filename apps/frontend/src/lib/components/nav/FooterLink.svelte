<script lang="ts">
  import { page } from "$app/state";

  const {
    href,
    children,
  }: {
    href: string;
    children: any;
  } = $props();

  let isActive = $state(page.url.pathname === href);

  $effect(() => {
    isActive = page.url.pathname === href;
  });
</script>

<a
  {href}
  class={[
    "block py-[7px] px-5 rounded",
    isActive && "bg-primary bg-accent text-text-on-accent",
  ].join(" ")}
>
  {@render children()}
</a>
