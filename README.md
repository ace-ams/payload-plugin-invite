# payload-invite

A [Payload CMS](https://payloadcms.com) plugin that lets admins invite users by email. Instead of creating accounts with a password directly, an invitation email is sent and the user sets their own password by following a secure, time-limited link.

---

## How it works

1. An admin clicks **Invite User** from any user collection list view and enters an email address.
2. The plugin creates a signed invite record and sends an email with a unique link.
3. The user visits the link (served inside the Payload admin at `/admin/invite-accept`) and sets their password.
4. The account is created and the invite is marked as used.

Tokens are never stored in plain text — only a SHA-256 hash is persisted. Each token is single-use and expires after 48 hours by default.

---

## Installation

```bash
npm install payload-invite
# or
pnpm add payload-invite
```

---

## Setup

Add the plugin to your `payload.config.ts`:

```ts
import { buildConfig } from 'payload'
import { payloadInvite } from 'payload-invite'

export default buildConfig({
  plugins: [
    payloadInvite({
      userCollections: ['users'],
    }),
  ],
  // ...rest of your config
})
```

That's it. The plugin will:

- Add an **Invite User** button to the list view of every collection you specify.
- Register a hidden `plugin-invites` collection to store pending invites.
- Mount the accept-invite page at `/admin/invite-accept` (no extra Next.js pages needed).
- Send invite emails through whatever email adapter you have configured in Payload.

> **Note:** Make sure `serverURL` is set in your Payload config so the invite links in emails are fully qualified (e.g. `https://example.com/admin/invite-accept?token=…`).

---

## Options

```ts
payloadInvite({
  /**
   * Which auth-enabled collections users can be invited to.
   * Defaults to ['users'].
   */
  userCollections: ['users', 'admins'],

  /**
   * How long an invite link stays valid, in milliseconds.
   * Defaults to 48 hours.
   */
  inviteExpiryMs: 72 * 60 * 60 * 1000, // 72 hours

  /**
   * Customise the invite email. See the Email section below.
   */
  email: { ... },

  /**
   * Set to true to disable all plugin behaviour while keeping
   * the plugin-invites collection in the database schema.
   */
  disabled: false,
})
```

---

## Email customisation

The plugin ships with a default HTML email template. You can override the subject, HTML body, text body, or any combination of them via the `email` option.

### Available placeholders

| Placeholder | Replaced with |
|-------------|---------------|
| `{url}`     | The full invite URL, e.g. `https://example.com/admin/invite-accept?token=…` |
| `{email}`   | The email address of the person being invited |

### Overriding just the subject

```ts
payloadInvite({
  email: {
    subject: 'You have been invited to join Acme',
  },
})
```

### Overriding subject, HTML, and plain text

```ts
payloadInvite({
  email: {
    subject: 'Your invite to Acme is ready',
    html: `
      <p>Hi {email},</p>
      <p>You have been invited. <a href="{url}">Click here</a> to set your password.</p>
      <p>Or copy this link: {url}</p>
    `,
    text: `Hi {email},\n\nAccept your invite here: {url}`,
  },
})
```

Any field you omit falls back to the built-in default. You do not need to provide all three.

---

## Extra fields

You can collect additional information when sending an invite — for example a name or a role. Those values are stored with the invite and written directly onto the user document when the account is created. Each field name is also available as a placeholder in your email templates.

```ts
payloadInvite({
  userCollections: ['users'],
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: ['editor', 'viewer'],
    },
  ],
})
```

The admin will see these inputs in the **Invite User** drawer, below the email field. On account creation the values are spread onto the user document, so `name: 'Jane'` will set the `name` field on the `users` collection document.

### Field options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | — | **Required.** Must match the field name on the user collection. |
| `label` | `string` | Field name | Label shown in the invite form. |
| `type` | `'text' \| 'select'` | `'text'` | Input type rendered in the form. |
| `options` | `string[]` | — | Required when `type` is `'select'`. |
| `required` | `boolean` | `false` | Prevents the form from submitting if left empty. |

### Using field values in email templates

Every field name is automatically available as a placeholder alongside `{url}` and `{email}`:

```ts
payloadInvite({
  fields: [{ name: 'name', label: 'Full Name' }],
  email: {
    subject: 'Hi {name}, your invitation is ready',
    html: '<p>Hi {name},</p><p><a href="{url}">Click here</a> to set your password.</p>',
    text: 'Hi {name},\n\nAccept your invite here: {url}',
  },
})
```

---

## API endpoints

The plugin registers three endpoints on the `plugin-invites` collection:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/plugin-invites/create` | Required | Creates an invite and sends the email |
| `GET` | `/api/plugin-invites/validate?token=…` | None | Validates a token and returns the associated email |
| `POST` | `/api/plugin-invites/accept` | None | Creates the user account and marks the invite as used |

---

## Requirements

- Payload `^3.37.0`
- An [email adapter](https://payloadcms.com/docs/email/overview) configured in Payload (nodemailer, Resend, etc.)
- `serverURL` set in your Payload config