<script lang="ts">
  import Label from './Label.svelte';

  interface Props {
    value?: string;
    label?: string;
    error?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    class?: string;
    inputClass?: string;
  }

  let {
    value = $bindable(''),
    label,
    error,
    id = `input-${Math.random().toString(36).slice(2, 8)}`,
    type = 'text',
    placeholder,
    disabled = false,
    required = false,
    name,
    class: className = '',
    inputClass = '',
  }: Props = $props();
</script>

<div class="field {className}">
  {#if label}
    <Label for={id} {required}>{label}</Label>
  {/if}
  <input
    {id}
    {name}
    {type}
    {placeholder}
    {disabled}
    {required}
    bind:value
    class="input {error ? 'hasError' : ''} {inputClass}"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${id}-error` : undefined}
  />
  {#if error}
    <p id="{id}-error" class="errorMessage">{error}</p>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .input {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    padding: var(--space-3) var(--space-4);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
  }

  .input::placeholder {
    color: var(--color-text-muted);
  }

  .input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent);
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hasError {
    border-color: var(--color-destructive);
  }

  .hasError:focus {
    border-color: var(--color-destructive);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-destructive) 25%, transparent);
  }

  .errorMessage {
    font-size: var(--text-sm);
    color: var(--color-destructive);
    margin: 0;
  }
</style>
