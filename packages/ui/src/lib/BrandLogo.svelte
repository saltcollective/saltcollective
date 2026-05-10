<script lang="ts">
  interface Props {
    height?: number;
    fullWidth?: boolean;
    class?: string;
  }

  let { height = 22, fullWidth = false, class: className = '' }: Props = $props();
</script>

<span class="wrap {className}" class:fullWidth>
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://d2hxbdf4sjiujo.cloudfront.net/static/logo-light.svg" />
    <img
      src="https://d2hxbdf4sjiujo.cloudfront.net/static/logo-dark.svg"
      alt="Salt Collective"
      style={fullWidth ? 'width: 100%; height: auto; display: block;' : `height: ${height}px; width: auto; display: block;`}
    />
  </picture>
</span>

<style>
  .wrap {
    display: inline-flex;
    align-items: center;
  }

  .wrap.fullWidth {
    display: flex;
    width: 100%;
  }

  .wrap.fullWidth picture {
    width: 100%;
  }
</style>
