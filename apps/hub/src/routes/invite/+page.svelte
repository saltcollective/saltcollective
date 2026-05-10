<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const STORAGE_KEY = 'invite_code';

  let status = $state<'loading' | 'error'>('loading');
  let errorMsg = $state('');

  onMount(async () => {
    const codeFromUrl = page.url.searchParams.get('code');
    const token = codeFromUrl ?? localStorage.getItem(STORAGE_KEY) ?? '';

    if (!token) {
      errorMsg = 'No invite code found. Please use the link from your invitation email.';
      status = 'error';
      return;
    }

    // Persist in case we need to survive a sign-in redirect
    if (codeFromUrl) localStorage.setItem(STORAGE_KEY, codeFromUrl);

    if (!data.user) {
      // Not signed in — go to sign-in, then come back here (no code in URL needed, it's in localStorage)
      goto(`/sign-in?redirect_url=${encodeURIComponent('/invite')}`);
      return;
    }

    // Signed in — submit the accept form programmatically
    const fd = new FormData();
    fd.set('token', token);

    const res = await fetch('?/accept', { method: 'POST', body: fd });

    if (res.redirected) {
      localStorage.removeItem(STORAGE_KEY);
      goto(new URL(res.url).pathname);
      return;
    }

    // SvelteKit returns a 200 with JSON payload for form action results (including redirects on some adapters)
    try {
      const json = await res.json();
      if (json?.type === 'redirect') {
        localStorage.removeItem(STORAGE_KEY);
        goto(json.location);
        return;
      }
      if (json?.data?.error) {
        errorMsg = json.data.error;
        status = 'error';
        return;
      }
    } catch {
      // ignore parse errors
    }

    if (!res.ok) {
      errorMsg = 'Something went wrong. Please try again or contact support.';
      status = 'error';
    }
  });
</script>

<svelte:head>
  <title>Accepting invite — Salt Collective</title>
</svelte:head>

<div class="page">
  <div class="card">
    {#if status === 'loading'}
      <div class="spinner" aria-label="Loading"></div>
      <p class="msg">Accepting your invite…</p>
    {:else}
      <svg class="errIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="msg">{errorMsg || (form && 'error' in form ? form.error : 'Something went wrong.')}</p>
      <a href="/" class="back">Go home</a>
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    padding: var(--space-6);
  }

  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-10) var(--space-8);
    max-width: 400px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .errIcon {
    width: 40px;
    height: 40px;
    color: var(--color-destructive, #f87171);
  }

  .msg {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
    line-height: var(--leading-normal);
  }

  .back {
    font-size: var(--text-sm);
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 500;
  }

  .back:hover {
    text-decoration: underline;
  }
</style>
