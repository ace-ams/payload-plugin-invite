import type { CollectionSlug } from 'payload'

export type InviteFieldType = 'select' | 'text'

export type InviteField = {
  /**
   * Human-readable label shown in the invite form. Defaults to the field name.
   */
  label?: string
  /**
   * The field name as it exists on the user collection document.
   * Also used as the placeholder key in email templates, e.g. {name}.
   */
  name: string
  /**
   * Options for select fields.
   */
  options?: string[]
  /**
   * Whether the field must be filled in before sending the invite.
   * @default false
   */
  required?: boolean
  /**
   * The type of input to render in the invite form.
   * @default 'text'
   */
  type?: InviteFieldType
}

export type InviteEmailOptions = {
  /**
   * Custom HTML body for the invite email.
   * Use {url}, {email}, or any field name defined in `fields` as placeholders.
   *
   * @example
   * '<p>Hey {name}, click <a href="{url}">here</a> to join.</p>'
   */
  html?: string
  /**
   * Custom subject line for the invite email.
   * Use {url}, {email}, or any field name defined in `fields` as placeholders.
   *
   * @default 'You have been invited'
   */
  subject?: string
  /**
   * Custom plain-text body for the invite email.
   * Use {url}, {email}, or any field name defined in `fields` as placeholders.
   *
   * @example
   * 'Hey {name}, accept your invite at {url}'
   */
  text?: string
}

export type PayloadInviteConfig = {
  disabled?: boolean
  /**
   * Customise the invite email. Any fields provided will overwrite the defaults.
   * Available placeholders: {url}, {email}, and any name from `fields`.
   */
  email?: InviteEmailOptions
  /**
   * Extra fields to collect when sending an invite.
   * Their values are stored on the invite and applied to the user document on account creation.
   * Each field name is also available as a placeholder in email templates.
   *
   * @example
   * fields: [{ name: 'name', label: 'Full Name' }]
   */
  fields?: InviteField[]
  /**
   * How long invites are valid for in milliseconds. Defaults to 48 hours.
   */
  inviteExpiryMs?: number
  /**
   * Which user collections can be invited to. Defaults to ['users'].
   */
  userCollections?: CollectionSlug[]
}
