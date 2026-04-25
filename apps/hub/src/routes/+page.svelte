<script lang="ts">
  import { Show, UserButton, SignIn } from 'svelte-clerk';
</script>

<Show when="signed-in">
  <UserButton />
</Show>

<Show when="signed-out">
  <SignIn />
</Show>
