import type { CollectionConfig } from 'payload'

import type { PayloadInviteConfig } from '../types.js'

import { acceptInviteEndpoint } from '../endpoints/acceptInvite.js'
import { createInviteEndpoint } from '../endpoints/createInvite.js'
import { validateInviteEndpoint } from '../endpoints/validateInvite.js'

export const buildInvitesCollection = (pluginOptions: PayloadInviteConfig): CollectionConfig => ({
  slug: 'plugin-invites',
  admin: { hidden: true },
  endpoints: [
    {
      handler: createInviteEndpoint(pluginOptions),
      method: 'post',
      path: '/create',
    },
    {
      handler: validateInviteEndpoint,
      method: 'get',
      path: '/validate',
    },
    {
      handler: acceptInviteEndpoint(pluginOptions),
      method: 'post',
      path: '/accept',
    },
  ],
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'tokenHash',
      type: 'text',
      required: true,
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'usedAt',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'accepted', 'expired'],
    },
  ],
})
