<script>
  import FooterLink from "./FooterLink.svelte";

  import SearchIcon from "../icons/Search.svelte";
  import HomeIcon from "../icons/Home.svelte";
  import AppsSolidIcon from "../icons/AppsSolid.svelte";
  import UserSolidIcon from "../icons/UserSolid.svelte";
</script>

<footer
  class="bg-bg py-2 fixed bottom-[calc(env(safe-area-inset-bottom)/2)] left-0 m-[10px] w-[calc(100%-20px)] md:hidden z-10 border border-stroke-100 rounded-xl shadow-custom flex items-center justify-around"
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
