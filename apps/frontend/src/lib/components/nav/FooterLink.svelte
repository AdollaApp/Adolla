<script lang="ts">
  import { page } from "$app/state";

  const {
    href,
    children,
  }: {
    href: string;
    children: any;
  } = $props();

  console.log(href, page.url.pathname);
  let isActive = $state(
    page.url.pathname === href ||
      (href === "/search" && page.url.pathname.startsWith("/search")),
  );

  $effect(() => {
    isActive =
      page.url.pathname === href ||
      (href === "/search" && page.url.pathname.startsWith("/search"));
  });
</script>

<a
  {href}
  class={[
    "block py-1.5 px-5 rounded",
    isActive && "bg-primary bg-accent text-text-on-accent",
  ].join(" ")}
>
  {@render children()}
</a>
