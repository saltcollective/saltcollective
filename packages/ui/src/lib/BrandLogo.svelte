<script lang="ts">
  interface Props {
    height?: number;
    class?: string;
  }

  let { height = 22, class: className = '' }: Props = $props();
</script>

<span class="wrap {className}">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://d2hxbdf4sjiujo.cloudfront.net/static/logo-light.svg" />
    <img
      src="https://d2hxbdf4sjiujo.cloudfront.net/static/logo-dark.svg"
      alt="Salt Collective"
      height={height}
      style="height: {height}px; width: auto; display: block;"
    />
  </picture>
</span>

<style>
  .wrap {
    display: inline-flex;
    align-items: center;
  }
</style>
