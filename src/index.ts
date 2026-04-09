import type { CollectionSlug, Config } from 'payload'

import type { PayloadInviteConfig } from './types.js'

import { buildInvitesCollection } from './collections/Invites.js'

export type { PayloadInviteConfig } from './types.js'

export const payloadInvite =
  (pluginOptions: PayloadInviteConfig = {}) =>
  (config: Config): Config => {
    const userCollections: CollectionSlug[] = pluginOptions.userCollections ?? ['users']

    if (!config.collections) {
      config.collections = []
    }

    // Always add the invites collection (with its endpoints) so the DB schema stays consistent.
    // The collection's custom endpoints (/create, /validate, /accept) live on the collection
    // itself to avoid being shadowed by Payload's collection ID-lookup routing.
    config.collections.push(buildInvitesCollection(pluginOptions))

    if (pluginOptions.disabled) {
      return config
    }

    // Register the accept-invite page as a custom admin view.
    // Payload's isCustomAdminView() bypasses the auth redirect for all custom views,
    // so this page is publicly accessible even without being logged in — and it
    // inherits the full admin CSS/layout automatically.
    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.views) {
      config.admin.components.views = {}
    }

    config.admin.components.views['invite-accept'] = {
      Component: 'payload-invite/rsc#AcceptInviteView',
      exact: true,
      path: '/invite-accept',
    }

    // Add the "Invite User" button after the list table of each target user collection
    for (const collectionSlug of userCollections) {
      const collection = config.collections.find((c) => c.slug === collectionSlug)

      if (collection) {
        if (!collection.admin) {
          collection.admin = {}
        }

        if (!collection.admin.components) {
          collection.admin.components = {}
        }

        if (!collection.admin.components.afterListTable) {
          collection.admin.components.afterListTable = []
        }

        ;(collection.admin.components.afterListTable as string[]).push(
          `payload-invite/client#InviteUserButton`,
        )
      }
    }

    return config
  }
