import type { CollectionSlug } from 'payload'

export type PayloadInviteConfig = {
  disabled?: boolean
  /**
   * How long invites are valid for in milliseconds. Defaults to 48 hours.
   */
  inviteExpiryMs?: number
  /**
   * Which user collections can be invited to. Defaults to ['users'].
   */
  userCollections?: CollectionSlug[]
}
