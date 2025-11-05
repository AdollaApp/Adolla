<script lang="ts">
  export let buttonStyle: "primary" | "secondary" = "primary";
  export let classes = "";

  $: styles = (() => {
    let computedClasses = [
      "rounded-xl flex justify-center items-center px-4 py-2 transition-colors duration-100 gap-2 cursor-pointer",
      classes,
    ];

    if (buttonStyle === "primary")
      computedClasses.push(
        "bg-accent text-text-on-accent hover:bg-accent-hover",
      );

    if (buttonStyle === "secondary") {
      computedClasses.push("bg-secondary-bg text-text-on-secondary");
    }

    return computedClasses.join(" ");
  })();
</script>

<button on:click type="button" class={styles}>
  <slot />
</button>
