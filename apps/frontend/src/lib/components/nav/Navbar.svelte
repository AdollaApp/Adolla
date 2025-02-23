<script>
  import AppsSolid from "../icons/AppsSolid.svelte";
  import UserSolid from "../icons/UserSolid.svelte";
  import Container from "../util/Container.svelte";
  import Logo from "./Logo.svelte";
  import NavLink from "./NavLink.svelte";
</script>

<div
  class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-header-gradient-start/15 to-transparent -z-10"
></div>

<header class="border-t-4 border-accent py-4 mb-10">
  <Container>
    <div class="grid grid-cols-[1fr_300px_1fr] gap-4">
      <a class="flex items-center gap-4 text-[20px] font-bold" href="/">
        <Logo />
        Adolla
      </a>
      <div class="flex justify-center items-center">Search bar here</div>
      <div class="flex justify-end items-center gap-8">
        <NavLink href="/list" Icon={AppsSolid}>My lists</NavLink>
        <NavLink href="/@me" Icon={UserSolid}>@jip</NavLink>
      </div>
    </div>
  </Container>
</header>
