<script lang="ts">
  const styles = {
    default:
      "border-stroke-accent text-text-accent bg-gradient-to-br from-gradient-start to-transparent",
    red: "border-stroke-red text-red-800 bg-gradient-to-br from-red-100 to-transparent",
  } as const;

  const {
    style = "default",
    children,
  }: {
    style?: keyof typeof styles;
    children?: () => any;
  } = $props();
</script>

<div
  class={[
    "uppercase font-semibold px-1.5 rounded-lg border",
    styles[style] ?? "",
  ].join(" ")}
>
  {@render children?.()}
</div>
