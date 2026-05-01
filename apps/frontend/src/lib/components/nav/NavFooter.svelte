<script>
  import FooterLink from "./FooterLink.svelte";

  import SearchIcon from "../icons/Search.svelte";
  import HomeIcon from "../icons/Home.svelte";
  import AppsSolidIcon from "../icons/AppsSolid.svelte";
  import UserSolidIcon from "../icons/UserSolid.svelte";
</script>

<footer
  class="bg-bg pt-[8px] pb-[calc(8px+env(safe-area-inset-bottom))] fixed left-0 w-full bottom-0 md:hidden border-t border-stroke-100 flex items-center justify-around px-5 z-100"
>
  <FooterLink href="/">
    <HomeIcon />
  </FooterLink>
  <FooterLink href="/search">
    <SearchIcon />
  </FooterLink>
  <FooterLink href="/lists">
    <AppsSolidIcon />
  </FooterLink>
  <FooterLink href="/@me">
    <UserSolidIcon />
  </FooterLink>
</footer>

<!-- <div
  class="fixed bottom-0 z-[200] w-full h-[var(--footer-height)] bg-yellow-300"
></div> -->

<style>
  :global(body) {
    /* A footer link is 38px */
    /* + 1px for the border. The 8px is the padding on both sides, plus the safe area inset */
    --footer-height: calc(8px + 8px + env(safe-area-inset-bottom) + 38px + 1px);
  }
</style>
