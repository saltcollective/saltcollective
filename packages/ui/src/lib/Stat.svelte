<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
  }

  let { label, value }: Props = $props();
</script>

<div class="stat">
  <p class="label">{label}</p>
  <p class="value">{value}</p>
</div>

<style>
  .stat {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
  }

  .label {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .value {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--color-text);
    margin: 0;
  }
</style>
