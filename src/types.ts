import type { CollectionSlug } from 'payload'

export type InviteEmailOptions = {
  /**
   * Custom HTML body for the invite email.
   * Use {url} and {email} as placeholders — they will be replaced at send time.
   *
   * @example
   * '<p>Hey {email}, click <a href="{url}">here</a> to join.</p>'
   */
  html?: string
  /**
   * Custom subject line for the invite email.
   * Use {url} and {email} as placeholders.
   *
   * @default 'You have been invited'
   */
  subject?: string
  /**
   * Custom plain-text body for the invite email.
   * Use {url} and {email} as placeholders.
   *
   * @example
   * 'Hey {email}, accept your invite at {url}'
   */
  text?: string
}

export type PayloadInviteConfig = {
  disabled?: boolean
  /**
   * Customise the invite email. Any fields provided will overwrite the defaults.
   * Available placeholders: {url}, {email}
   */
  email?: InviteEmailOptions
  /**
   * How long invites are valid for in milliseconds. Defaults to 48 hours.
   */
  inviteExpiryMs?: number
  /**
   * Which user collections can be invited to. Defaults to ['users'].
   */
  userCollections?: CollectionSlug[]
}
