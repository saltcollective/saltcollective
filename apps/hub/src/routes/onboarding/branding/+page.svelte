<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  let { data }: { data: PageData } = $props();

  let logoUrl = $state(data.club.logoUrl ?? '');
  let primaryColour = $state(data.club.primaryColour ?? '#68b7d2');
  let secondaryColour = $state(data.club.secondaryColour ?? '#f4a27e');
  let uploading = $state(false);
  let uploadError = $state('');
  let submitting = $state(false);

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

<div class="ob-content">
  <header class="ob-header">
    <h2 class="ob-title">Brand your hub</h2>
    <p class="ob-sub">Add your logo and colours so the hub looks like yours.</p>
  </header>

  <form method="POST" action="?/update" class="ob-form"
    use:enhance={() => {
      submitting = true;
      return ({ update }) => { update(); submitting = false; };
    }}
  >
    <input type="hidden" name="clubId" value={data.club.id} />
    <input type="hidden" name="logoUrl" value={logoUrl} />

    <div class="ob-field">
      <span class="ob-label">Club logo <span class="ob-label-opt">(optional)</span></span>
      <div class="logo-area">
        {#if logoUrl}
          <img src={logoUrl} alt="Club logo preview" class="logo-preview" />
        {:else}
          <div class="logo-placeholder" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
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
            <span class="ob-error">{uploadError}</span>
          {:else}
            <span class="ob-hint">PNG, JPEG or SVG · max 2 MB</span>
          {/if}
        </div>
      </div>
    </div>

    <div class="ob-field">
      <label class="ob-label" for="primaryColour">
        Primary colour <span class="ob-label-opt">(optional)</span>
      </label>
      <div class="colour-row">
        <input type="color" bind:value={primaryColour} class="colour-picker" aria-label="Pick primary colour" />
        <input
          id="primaryColour"
          name="primaryColour"
          type="text"
          class="ob-input colour-text"
          bind:value={primaryColour}
          maxlength="7"
          placeholder="#68b7d2"
        />
      </div>
    </div>

    <div class="ob-field">
      <label class="ob-label" for="secondaryColour">
        Secondary colour <span class="ob-label-opt">(optional)</span>
      </label>
      <div class="colour-row">
        <input type="color" bind:value={secondaryColour} class="colour-picker" aria-label="Pick secondary colour" />
        <input
          id="secondaryColour"
          name="secondaryColour"
          type="text"
          class="ob-input colour-text"
          bind:value={secondaryColour}
          maxlength="7"
          placeholder="#f4a27e"
        />
      </div>
    </div>

    <div class="ob-actions">
      <button type="submit" class="ob-btn ob-btn-primary" disabled={submitting || uploading}>
        {submitting ? 'Saving…' : 'Continue'}
      </button>
      <a href="/onboarding/tiers?club={data.club.id}" class="ob-skip">Skip for now</a>
    </div>
  </form>
</div>

<style>
  .logo-area {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .logo-preview {
    width: 64px;
    height: 64px;
    object-fit: contain;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    flex-shrink: 0;
  }

  .logo-placeholder {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-md);
    border: 1px dashed var(--color-border);
    background: var(--color-surface-2);
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

  .upload-btn:hover { background: var(--color-surface-2); }

  .file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }

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
</style>
