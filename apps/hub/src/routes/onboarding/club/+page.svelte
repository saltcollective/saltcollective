<script lang="ts">
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { siteDomain } from '$lib/domain';

  let { form }: { form: ActionData } = $props();

  let name = $state((form?.name as string) ?? '');
  let slug = $state((form?.slug as string) ?? '');
  let tagline = $state((form?.tagline as string) ?? '');
  let slugEdited = $state(!!(form?.slug));
  let submitting = $state(false);

  function toSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }

  function handleNameInput() {
    if (!slugEdited) slug = toSlug(name);
  }

  function handleSlugInput() {
    slug = slug.replace(/[^a-z0-9-]/g, '');
    slugEdited = true;
  }
</script>

<div class="ob-content">
  <header class="ob-header">
    <h2 class="ob-title">Create your club</h2>
    <p class="ob-sub">Set up the basic details for your Salt Collective hub.</p>
  </header>

  {#if form?.error && !form?.slugTaken}
    <div class="ob-form-error" role="alert">{form.error}</div>
  {/if}

  <form
    method="POST"
    action="?/create"
    class="ob-form"
    use:enhance={() => {
      submitting = true;
      return ({ update }) => {
        update();
        submitting = false;
      };
    }}
  >
    <div class="ob-field">
      <label class="ob-label" for="name">Club name</label>
      <input
        id="name"
        name="name"
        type="text"
        class="ob-input"
        bind:value={name}
        oninput={handleNameInput}
        placeholder="Riverside FC"
        maxlength="80"
        required
        autocomplete="off"
      />
    </div>

    <div class="ob-field">
      <label class="ob-label" for="slug">Hub URL</label>
      <div class="slug-wrap" class:has-error={form?.slugTaken}>
        <span class="slug-prefix">{siteDomain}/</span>
        <input
          id="slug"
          name="slug"
          type="text"
          class="slug-input"
          bind:value={slug}
          oninput={handleSlugInput}
          placeholder="riverside-fc"
          maxlength="60"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      {#if form?.slugTaken}
        <span class="ob-error">{form.error}</span>
      {:else}
        <span class="ob-hint">Only lowercase letters, numbers, and hyphens</span>
      {/if}
    </div>

    <div class="ob-field">
      <label class="ob-label" for="tagline">
        Tagline <span class="ob-label-opt">(optional)</span>
      </label>
      <input
        id="tagline"
        name="tagline"
        type="text"
        class="ob-input"
        bind:value={tagline}
        placeholder="Supporting local sport since 1987"
        maxlength="160"
      />
    </div>

    <div class="ob-actions">
      <button type="submit" class="ob-btn ob-btn-primary" disabled={submitting}>
        {submitting ? 'Creating…' : 'Continue'}
      </button>
    </div>
  </form>
</div>

<style>
  .slug-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    overflow: hidden;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .slug-wrap:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .slug-wrap.has-error { border-color: var(--color-destructive); }

  .slug-wrap.has-error:focus-within {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-destructive) 20%, transparent);
  }

  .slug-prefix {
    padding: var(--space-2) 0 var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
    user-select: none;
  }

  .slug-input {
    flex: 1;
    min-width: 0;
    padding: var(--space-2) var(--space-3) var(--space-2) 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    line-height: var(--leading-normal);
  }

  .slug-input::placeholder { color: var(--color-text-muted); }
</style>
