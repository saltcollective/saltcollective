<script lang="ts">
  import { enhance } from '$app/forms';
  import { Badge, Button } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let inviteEmail = $state('');
  let inviteRole = $state<'EDITOR' | 'ADMIN'>('EDITOR');
  let inviting = $state(false);

  const inviteSuccess = $derived(form?.action === 'invite' && form?.success);
  const inviteError = $derived(form?.action === 'invite' && 'error' in form ? form.error : null);

  const memberError = $derived(
    form && (form.action === 'role' || form.action === 'remove') && 'error' in form
      ? form.error
      : null
  );

  function memberName(member: PageData['members'][number]): string {
    return member.user.username ?? member.user.email.split('@')[0];
  }
</script>

<div class="screen">
  <PageHeader title="Team" subtitle="Manage who has access to your hub." />

  <!-- Members -->
  <section class="card">
    <h2 class="sectionTitle">Members</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Member</th>
          <th>Role</th>
          <th>Joined</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.members as member}
          {@const isSelf = member.user.id === data.currentUserId}
          <tr>
            <td>
              <div class="rowMain">
                <div class="avatar">{(member.user.username ?? member.user.email)[0].toUpperCase()}</div>
                <div class="rowMeta">
                  <span class="rowTitle">
                    {memberName(member)}{#if isSelf}<span class="youTag">You</span>{/if}
                  </span>
                  <span class="rowSub">{member.user.email}</span>
                </div>
              </div>
            </td>
            <td>
              <form method="POST" action="?/updateRole" use:enhance>
                <input type="hidden" name="membershipId" value={member.id} />
                <select
                  class="roleSelect"
                  name="role"
                  aria-label="Role for {memberName(member)}"
                  onchange={(e) => e.currentTarget.form?.requestSubmit()}
                >
                  <option value="EDITOR" selected={member.role === 'EDITOR'}>Editor</option>
                  <option value="ADMIN" selected={member.role === 'ADMIN'}>Admin</option>
                </select>
              </form>
            </td>
            <td class="muted">{new Date(member.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td class="actionCell">
              {#if !isSelf}
                <form
                  method="POST"
                  action="?/removeMember"
                  use:enhance={({ cancel }) => {
                    if (!confirm(`Remove ${memberName(member)} from this hub?`)) {
                      cancel();
                      return;
                    }
                    return ({ update }) => update();
                  }}
                >
                  <input type="hidden" name="membershipId" value={member.id} />
                  <Button variant="ghost" size="sm" type="submit">Remove</Button>
                </form>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if memberError}
      <p class="feedback error memberFeedback">{memberError}</p>
    {/if}
  </section>

  <!-- Pending invites -->
  {#if data.invites.length > 0}
    <section class="card">
      <h2 class="sectionTitle">Pending invites</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Sent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each data.invites as invite}
            <tr>
              <td class="rowTitle">{invite.email}</td>
              <td>
                <Badge variant={invite.role === 'ADMIN' ? 'success' : 'default'}>{invite.role}</Badge>
              </td>
              <td class="muted">{new Date(invite.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              <td class="actionCell">
                <form method="POST" action="?/revoke" use:enhance>
                  <input type="hidden" name="inviteId" value={invite.id} />
                  <Button variant="ghost" size="sm" type="submit">Revoke</Button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}

  <!-- Invite form -->
  <section class="card inviteCard">
    <h2 class="sectionTitle">Invite someone</h2>
    <form
      method="POST"
      action="?/invite"
      class="inviteForm"
      use:enhance={() => {
        inviting = true;
        return ({ update }) => {
          inviting = false;
          inviteEmail = '';
          update();
        };
      }}
    >
      <div class="fieldGroup">
        <input
          class="input"
          type="email"
          name="email"
          placeholder="colleague@example.com"
          bind:value={inviteEmail}
          required
          aria-label="Email address"
        />
        <select class="select" name="role" bind:value={inviteRole} aria-label="Role">
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Button size="sm" type="submit" disabled={inviting}>
          {inviting ? 'Sending…' : 'Send invite'}
        </Button>
      </div>
      {#if inviteSuccess}
        <p class="feedback success">Invite sent!</p>
      {/if}
      {#if inviteError}
        <p class="feedback error">{inviteError}</p>
      {/if}
    </form>
    <p class="hint">
      <strong>Editor</strong> can add and edit sponsors.
      <strong>Admin</strong> has full access including settings.
    </p>
  </section>
</div>

<style>
  .screen {
    padding: var(--space-8) var(--space-8) var(--space-12);
    max-width: 860px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .sectionTitle {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    margin: 0;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th {
    text-align: left;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    padding: var(--space-3) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-2);
  }

  .table td {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-sm);
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
  }

  .table tbody tr:last-child td {
    border-bottom: none;
  }

  .rowMain {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .rowMeta {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .rowTitle {
    font-weight: 600;
    color: var(--color-text);
    font-size: var(--text-sm);
  }

  .rowSub {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .muted {
    color: var(--color-text-muted);
  }

  .actionCell {
    text-align: right;
  }

  .youTag {
    display: inline-block;
    margin-left: var(--space-2);
    padding: 1px 6px;
    border-radius: var(--radius-full);
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    vertical-align: middle;
  }

  .roleSelect {
    height: 32px;
    padding: 0 var(--space-2);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .roleSelect:focus {
    border-color: var(--color-accent);
  }

  .memberFeedback {
    padding: var(--space-3) var(--space-5) var(--space-4);
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface-2));
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .inviteCard {
    overflow: visible;
  }

  .inviteForm {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .fieldGroup {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }

  .input {
    flex: 1;
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text);
    outline: none;
    transition: border-color 0.15s;
    min-width: 0;
  }

  .input:focus {
    border-color: var(--color-accent);
  }

  .input::placeholder {
    color: var(--color-text-muted);
  }

  .select {
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
    flex-shrink: 0;
  }

  .select:focus {
    border-color: var(--color-accent);
  }

  .feedback {
    font-size: var(--text-sm);
    margin: 0;
  }

  .feedback.success {
    color: var(--color-success, #4ade80);
  }

  .feedback.error {
    color: var(--color-destructive, #f87171);
  }

  .hint {
    padding: 0 var(--space-5) var(--space-5);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
  }

  @media (max-width: 640px) {
    .screen {
      padding: var(--space-5) var(--space-4) var(--space-10);
    }

    .fieldGroup {
      flex-wrap: wrap;
    }

    .input {
      width: 100%;
    }
  }
</style>
