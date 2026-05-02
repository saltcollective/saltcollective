<script lang="ts">
  import { SignIn } from 'svelte-clerk';
</script>

<div class="wrap">
  <SignIn />
</div>

<style>
  .wrap {
    display: flex;
    justify-content: center;
    padding-block: var(--space-16);
  }
</style>
