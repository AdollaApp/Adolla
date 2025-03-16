<script lang="ts">
  import { onMount } from "svelte";
  import AppsSolid from "../icons/AppsSolid.svelte";
  import UserSolid from "../icons/UserSolid.svelte";
  import Container from "../util/Container.svelte";
  import Logo from "./Logo.svelte";
  import NavFooter from "./NavFooter.svelte";
  import NavLink from "./NavLink.svelte";
  import SearchBox from "./SearchBox.svelte";
  import { page } from "$app/state";

  let header: HTMLElement | null = null;
  let headerHeight = $state(79);
  let scrollY = $state(0);
  const user = page.data.user;

  function updateHeaderHeight() {
    if (header) headerHeight = header.offsetHeight;
  }

  function onScroll() {
    scrollY = window.scrollY;
  }

  $effect(updateHeaderHeight);

  onMount(() => {
    window.addEventListener("resize", updateHeaderHeight);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      window.removeEventListener("scroll", onScroll);
    };
  });
</script>

<!-- BG gradient -->
<div
  class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-header-gradient-start/15 to-transparent z-0"
></div>

<!-- Main header -->
<header
  class={[
    "[border-top-width:calc(env(safe-area-inset-top)+4px)] border-t-accent py-2 md:py-4 fixed top-0 left-0 w-full z-20 border-b transition-colors duration-200",
    scrollY > 0 ? "border-b-stroke-100 bg-bg" : "border-b-transparent",
  ].join(" ")}
  bind:this={header}
>
  <Container>
    <div class="grid justify-center md:grid-cols-[1fr_300px_1fr] gap-4">
      <a class="flex items-center gap-4 md:text-[20px] font-bold" href="/">
        <Logo />
        Adolla
      </a>
      <div class="hidden md:flex justify-center items-center">
        <SearchBox />
      </div>
      <div class="hidden md:flex justify-end items-center gap-8">
        {#if user}
          <NavLink href="/lists" Icon={AppsSolid}>My lists</NavLink>
          <NavLink href="/@me" Icon={UserSolid}>@{user.username}</NavLink>
        {:else}
          <NavLink href="/login" Icon={AppsSolid}>Login</NavLink>
        {/if}
      </div>
    </div>
  </Container>
</header>

<div class="mb-7 md:mb-10" style={`height: ${headerHeight}px`}></div>

<NavFooter />
