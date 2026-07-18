<script lang="ts">
  import { Button } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { enhance } from '$app/forms';
  import { siteDomain } from '$lib/domain';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Identity section
  let name = $state(data.club.name);
  let slug = $state(data.club.slug);
  let tagline = $state(data.club.tagline ?? '');
  let slugAvailable = $state<boolean | null>(null);
  let slugChecking = $state(false);
  let submittingIdentity = $state(false);

  // Branding section
  let logoUrl = $state(data.club.logoUrl ?? '');
  let primaryColour = $state(data.club.primaryColour ?? '#68b7d2');
  let secondaryColour = $state(data.club.secondaryColour ?? '#f4a27e');
  let backgroundColour = $state(data.club.backgroundColour ?? '');
  let colorScheme = $state<'SYSTEM' | 'LIGHT' | 'DARK'>(data.club.colorScheme ?? 'SYSTEM');
  let uploading = $state(false);
  let uploadError = $state('');
  let submittingBranding = $state(false);

  // Danger zone
  let confirmName = $state('');
  let deleting = $state(false);

  async function checkSlug() {
    if (!slug || slug === data.club.slug) {
      slugAvailable = null;
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 2) {
      slugAvailable = false;
      return;
    }
    slugChecking = true;
    try {
      const res = await fetch(
        `/api/slug-available?slug=${encodeURIComponent(slug)}&excludeId=${data.club.id}`
      );
      const json = await res.json();
      slugAvailable = json.available;
    } catch {
      slugAvailable = null;
    } finally {
      slugChecking = false;
    }
  }

  function toSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }

  async function handleLogoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      uploadError = 'File must be under 2 MB';
      return;
    }
    uploading = true;
    uploadError = '';
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, folder: 'clubs', id: data.club.id }),
      });
      if (!res.ok) throw new Error();
      const { uploadUrl, publicUrl } = await res.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      logoUrl = publicUrl;
    } catch {
      uploadError = 'Upload failed — please try again';
    } finally {
      uploading = false;
    }
  }
</script>

<div class="screen">
  <PageHeader title="Settings" subtitle="Manage your club's identity, branding, and account." />

  <!-- Identity -->
  <section class="card">
    <h2 class="section-title">Club identity</h2>
    <form
      method="POST"
      action="?/updateIdentity"
      use:enhance={() => {
        submittingIdentity = true;
        return ({ update }) => {
          update({ reset: false });
          submittingIdentity = false;
        };
      }}
    >
      {#if form?.updated === 'identity' && form?.error}
        <p class="form-error">{form.error}</p>
      {/if}
      {#if form?.updated === 'identity' && form?.success}
        <p class="form-success">Saved.</p>
      {/if}

      <div class="fields">
        <div class="field">
          <label class="label" for="name">Club name <span class="req">*</span></label>
          <input
            id="name"
            name="name"
            type="text"
            class="input"
            bind:value={name}
            maxlength="80"
            required
          />
        </div>

        <div class="field">
          <label class="label" for="slug">Hub URL <span class="req">*</span></label>
          <div class="slug-wrap">
            <span class="slug-prefix">{siteDomain}/</span>
            <input
              id="slug"
              name="slug"
              type="text"
              class="input slug-input"
              bind:value={slug}
              onblur={checkSlug}
              maxlength="60"
              required
            />
          </div>
          {#if slugChecking}
            <span class="hint">Checking…</span>
          {:else if form?.updated === 'identity' && form?.slugTaken}
            <span class="slug-taken">Already taken</span>
          {:else if slugAvailable === true}
            <span class="slug-ok">Available</span>
          {:else if slugAvailable === false}
            <span class="slug-taken">Already taken</span>
          {/if}
        </div>

        <div class="field">
          <label class="label" for="tagline">Tagline <span class="opt">(optional)</span></label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            class="input"
            bind:value={tagline}
            maxlength="160"
            placeholder="A short line about your club"
          />
          <span class="hint">Shown under your club name on the public hub. Max 160 characters.</span
          >
        </div>
      </div>

      <div class="actions">
        <Button type="submit" disabled={submittingIdentity}>
          {submittingIdentity ? 'Saving…' : 'Save identity'}
        </Button>
      </div>
    </form>
  </section>

  <!-- Branding -->
  <section class="card">
    <h2 class="section-title">Branding</h2>
    <form
      method="POST"
      action="?/updateBranding"
      use:enhance={() => {
        submittingBranding = true;
        return ({ update }) => {
          update({ reset: false });
          submittingBranding = false;
        };
      }}
    >
      <input type="hidden" name="logoUrl" value={logoUrl} />

      {#if form?.updated === 'branding' && form?.error}
        <p class="form-error">{form.error}</p>
      {/if}
      {#if form?.updated === 'branding' && form?.success}
        <p class="form-success">Saved.</p>
      {/if}

      <div class="fields">
        <div class="field">
          <span class="label">Logo <span class="opt">(optional)</span></span>
          <div class="logo-area">
            {#if logoUrl}
              <img src={logoUrl} alt="Club logo preview" class="logo-preview" />
            {:else}
              <div class="logo-placeholder" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            {/if}
            <div class="logo-right">
              <label class="upload-btn">
                {uploading ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload logo'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  class="file-input"
                  onchange={handleLogoChange}
                  disabled={uploading}
                />
              </label>
              {#if uploadError}
                <span class="field-error">{uploadError}</span>
              {:else}
                <span class="hint">PNG, JPEG or SVG · max 2 MB</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label" for="primaryColour">Primary colour</label>
          <div class="colour-row">
            <input
              type="color"
              bind:value={primaryColour}
              class="colour-picker"
              aria-label="Pick primary colour"
            />
            <input
              id="primaryColour"
              name="primaryColour"
              type="text"
              class="input colour-text"
              bind:value={primaryColour}
              maxlength="7"
              placeholder="#68b7d2"
            />
          </div>
        </div>

        <div class="field">
          <label class="label" for="secondaryColour">Secondary colour</label>
          <div class="colour-row">
            <input
              type="color"
              bind:value={secondaryColour}
              class="colour-picker"
              aria-label="Pick secondary colour"
            />
            <input
              id="secondaryColour"
              name="secondaryColour"
              type="text"
              class="input colour-text"
              bind:value={secondaryColour}
              maxlength="7"
              placeholder="#f4a27e"
            />
          </div>
        </div>

        <div class="field">
          <label class="label" for="backgroundColour"
            >Background colour <span class="opt">(optional)</span></label
          >
          <div class="colour-row">
            <input
              type="color"
              bind:value={backgroundColour}
              class="colour-picker"
              aria-label="Pick background colour"
            />
            <input
              id="backgroundColour"
              name="backgroundColour"
              type="text"
              class="input colour-text"
              bind:value={backgroundColour}
              maxlength="7"
              placeholder="Default"
            />
          </div>
          <span class="hint"
            >Overrides the default background on your public hub, if empty, it will use defualts.</span
          >
        </div>

        <div class="field">
          <span class="label">Hub appearance</span>
          <div class="scheme-group" role="group" aria-label="Hub colour scheme">
            <label class="scheme-option" class:scheme-active={colorScheme === 'SYSTEM'}>
              <input
                type="radio"
                name="colorScheme"
                value="SYSTEM"
                bind:group={colorScheme}
                class="scheme-radio"
              />
              System
            </label>
            <label class="scheme-option" class:scheme-active={colorScheme === 'LIGHT'}>
              <input
                type="radio"
                name="colorScheme"
                value="LIGHT"
                bind:group={colorScheme}
                class="scheme-radio"
              />
              Light
            </label>
            <label class="scheme-option" class:scheme-active={colorScheme === 'DARK'}>
              <input
                type="radio"
                name="colorScheme"
                value="DARK"
                bind:group={colorScheme}
                class="scheme-radio"
              />
              Dark
            </label>
          </div>
          <span class="hint"
            >Controls whether your public hub shows in light or dark mode, regardless of your
            visitors' system preference.</span
          >
        </div>
      </div>

      <div class="actions">
        <Button type="submit" disabled={submittingBranding || uploading}>
          {submittingBranding ? 'Saving…' : 'Save branding'}
        </Button>
      </div>
    </form>
  </section>

  <!-- Danger zone -->
  <section class="card danger-card">
    <h2 class="section-title danger-heading">Danger zone</h2>
    <p class="danger-sub">
      Deleting your club will permanently remove all sponsors, tiers, and analytics data. This
      cannot be undone.
    </p>

    <form
      method="POST"
      action="?/deleteClub"
      use:enhance={({ cancel }) => {
        deleting = true;
        return ({ update }) => {
          update();
          deleting = false;
        };
      }}
    >
      {#if form?.error && !('updated' in (form ?? {}))}
        <p class="form-error">{form.error}</p>
      {/if}

      <div class="field">
        <label class="label" for="confirmName">
          Type <strong>{data.club.name}</strong> to confirm
        </label>
        <input
          id="confirmName"
          name="confirmName"
          type="text"
          class="input"
          bind:value={confirmName}
          autocomplete="off"
        />
      </div>

      <div class="actions" style="margin-top: var(--space-4)">
        <Button
          variant="destructive"
          type="submit"
          disabled={deleting || confirmName !== data.club.name}
        >
          {deleting ? 'Deleting…' : 'Delete club'}
        </Button>
      </div>
    </form>
  </section>
</div>

<style>
  .screen {
    padding: var(--space-8) var(--space-10);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 680px;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  .section-title {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 var(--space-5);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    margin-bottom: var(--space-6);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .req {
    color: var(--color-destructive);
  }
  .opt {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .input {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    color: var(--color-text);
    width: 100%;
    box-sizing: border-box;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
  .field-error {
    font-size: var(--text-xs);
    color: var(--color-destructive);
  }

  .form-error {
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-destructive);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-5);
  }

  .form-success {
    background: color-mix(in srgb, var(--color-success) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-success);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-5);
  }

  /* Slug field */
  .slug-wrap {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .slug-wrap:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .slug-prefix {
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .slug-input {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0;
    flex: 1;
  }

  .slug-input:focus {
    outline: none;
    box-shadow: none !important;
  }

  .slug-ok {
    font-size: var(--text-xs);
    color: var(--color-success);
  }
  .slug-taken {
    font-size: var(--text-xs);
    color: var(--color-destructive);
  }

  /* Logo upload */
  .logo-area {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .logo-preview {
    width: 56px;
    height: 56px;
    object-fit: contain;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    flex-shrink: 0;
  }

  .logo-placeholder {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    border: 1px dashed var(--color-border);
    background: var(--color-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .logo-right {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .upload-btn {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    font-family: var(--font-sans);
    color: var(--color-text);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background-color 0.15s ease;
  }

  .upload-btn:hover {
    background: var(--color-surface);
  }

  .file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }

  /* Colour pickers */
  .colour-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .colour-picker {
    width: 40px;
    height: 40px;
    padding: 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    cursor: pointer;
    flex-shrink: 0;
  }

  .colour-text {
    flex: 1;
    font-family: monospace;
  }

  /* Appearance segmented control */
  .scheme-group {
    display: inline-flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-bg);
  }

  .scheme-option {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background-color 0.12s ease,
      color 0.12s ease;
    user-select: none;
  }

  .scheme-option + .scheme-option {
    border-left: 1px solid var(--color-border);
  }

  .scheme-option:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }

  .scheme-active {
    background: var(--color-surface-2);
    color: var(--color-text);
    font-weight: 600;
  }

  .scheme-radio {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
  }

  /* Danger zone */
  .danger-card {
    border-color: color-mix(in srgb, var(--color-destructive) 30%, var(--color-border));
  }

  .danger-heading {
    color: var(--color-destructive);
  }

  .danger-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: calc(var(--space-5) * -1) 0 var(--space-5);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  @media (max-width: 820px) {
    .screen {
      padding: var(--space-6) var(--space-4);
    }
  }
</style>
