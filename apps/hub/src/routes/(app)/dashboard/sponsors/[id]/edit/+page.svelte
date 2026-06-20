<script lang="ts">
  import { Button } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let logoUrl = $state(data.business.logoUrl ?? '');
  let isActive = $state(data.business.status === 'ACTIVE');
  let selectedTierId = $state(form?.sponsorTierId ?? data.business.sponsorTierId ?? '');
  let uploading = $state(false);
  let uploadError = $state('');
  let submitting = $state(false);
  let deleting = $state(false);

  async function handleLogoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { uploadError = 'File must be under 2 MB'; return; }
    uploading = true;
    uploadError = '';
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, folder: 'businesses', id: data.business.id }),
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
  <PageHeader title="Edit sponsor" />

  <div class="card">
    <form
      method="POST"
      action="?/update"
      use:enhance={() => {
        submitting = true;
        return ({ update }) => { update(); submitting = false; };
      }}
    >
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="isActive" value={String(isActive)} />

      {#if form?.error}
        <p class="form-error">{form.error}</p>
      {/if}

      <div class="fields">
        <div class="field">
          <label class="label" for="name">Name <span class="req">*</span></label>
          <input id="name" name="name" type="text" class="input" value={form?.name ?? data.business.name} maxlength="120" required />
        </div>

        <div class="field">
          <label class="label" for="sponsorTierId">Tier <span class="req">*</span></label>
          <select id="sponsorTierId" name="sponsorTierId" class="input" bind:value={selectedTierId} required>
            <option value="" disabled>Select a tier…</option>
            {#each data.tiers as tier}
              <option value={tier.id}>{tier.name}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <label class="label" for="description">Description <span class="req">*</span></label>
          <textarea id="description" name="description" class="input textarea" maxlength="500" required>{form?.description ?? data.business.description ?? ''}</textarea>
          <span class="hint">Max 500 characters. Shown on the public hub.</span>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="label" for="email">Email <span class="opt">(optional)</span></label>
            <input id="email" name="email" type="email" class="input" value={form?.email ?? data.business.email ?? ''} />
          </div>
          <div class="field">
            <label class="label" for="phone">Phone <span class="opt">(optional)</span></label>
            <input id="phone" name="phone" type="tel" class="input" value={form?.phone ?? data.business.phone ?? ''} />
          </div>
        </div>

        <div class="field">
          <label class="label" for="websiteUrl">Website <span class="opt">(optional)</span></label>
          <input id="websiteUrl" name="websiteUrl" type="url" class="input" value={form?.websiteUrl ?? data.business.websiteUrl ?? ''} placeholder="https://" />
        </div>

        <div class="field">
          <span class="label">Logo <span class="opt">(optional)</span></span>
          <div class="logo-area">
            {#if logoUrl}
              <img src={logoUrl} alt="Logo preview" class="logo-preview" />
            {:else}
              <div class="logo-placeholder" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
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
          <span class="label">Status</span>
          <div class="toggle-row">
            <button
              type="button"
              class="toggle"
              class:on={isActive}
              onclick={() => (isActive = !isActive)}
              aria-pressed={isActive}
              aria-label="Toggle sponsor status"
            >
              <span class="toggle-thumb"></span>
            </button>
            <span class="toggle-label">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="ghost" href="/dashboard/sponsors">Cancel</Button>
      </div>
    </form>
  </div>

  <div class="danger-card">
    <h2 class="danger-title">Danger zone</h2>
    <p class="danger-sub">Deleting this sponsor is permanent and cannot be undone.</p>
    <form
      method="POST"
      action="?/delete"
      use:enhance={({ cancel }) => {
        if (!confirm('Are you sure you want to delete this sponsor? This cannot be undone.')) {
          cancel();
          return;
        }
        deleting = true;
        return ({ update }) => { update(); deleting = false; };
      }}
    >
      <Button variant="destructive" type="submit" disabled={deleting}>
        {deleting ? 'Deleting…' : 'Delete sponsor'}
      </Button>
    </form>
  </div>
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

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .req { color: var(--color-destructive); }
  .opt { font-weight: 400; color: var(--color-text-muted); }

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
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .textarea { resize: vertical; min-height: 100px; }

  .hint { font-size: var(--text-xs); color: var(--color-text-muted); }
  .field-error { font-size: var(--text-xs); color: var(--color-destructive); }

  .form-error {
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-destructive);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-5);
  }

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

  .upload-btn:hover { background: var(--color-surface); }

  .file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .toggle {
    width: 40px;
    height: 22px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    border: none;
    cursor: pointer;
    padding: 0;
    position: relative;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }

  .toggle.on { background: var(--color-accent); }

  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: var(--radius-full);
    background: #fff;
    transition: transform 0.2s ease;
  }

  .toggle.on .toggle-thumb { transform: translateX(18px); }

  .toggle-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .danger-card {
    background: var(--color-surface-2);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, var(--color-border));
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .danger-title {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-destructive);
    margin: 0;
  }

  .danger-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
  }

  @media (max-width: 820px) {
    .screen { padding: var(--space-6) var(--space-4); }
    .field-row { grid-template-columns: 1fr; }
  }
</style>
