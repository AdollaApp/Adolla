<script lang="ts">
  let isFocused = $state(false);
  let inputElement: HTMLInputElement;
  let formElement: HTMLFormElement;

  let {
    children = null,
    value = $bindable(),
    placeholder = "",
    type = "text",
    name = "",
    id = name,
    required = false,
    disabled = false,
    readonly = false,
  } = $props();

  function submit() {
    if (name && value.length > 0) formElement.requestSubmit();
  }
</script>

<button
  type="button"
  aria-label="Focus input"
  class={[
    "rounded-lg py-1 px-2 border bg-bg w-full flex items-center space-x-2",
    isFocused
      ? "border-accent outline-2 outline-accent/20"
      : "border-stroke-200",
  ]}
  onclick={() => inputElement.focus()}
>
  {#if children}
    <div class="text-text-lighter">
      {@render children()}
    </div>
  {/if}
  <form bind:this={formElement} data-sveltekit-keepfocus action="/search?q=">
    <input
      {type}
      {name}
      {id}
      {placeholder}
      bind:value
      {required}
      {disabled}
      {readonly}
      oninput={submit}
      class="focus:outline-0 w-full"
      onfocus={() => (isFocused = true)}
      onblur={() => (isFocused = false)}
      bind:this={inputElement}
    />
  </form>
</button>
