import type { PayloadHandler } from 'payload'

import crypto from 'node:crypto'

import type { PayloadInviteConfig } from '../types.js'

export const acceptInviteEndpoint =
  (pluginOptions: PayloadInviteConfig): PayloadHandler =>
  async (req) => {
    let body: { password?: string; token?: string }

    try {
      body = (await req.json?.()) ?? {}
    } catch {
      body = {}
    }

    const { password, token: rawToken } = body

    if (!rawToken || typeof rawToken !== 'string') {
      return Response.json({ error: 'token is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'password is required' }, { status: 400 })
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    const result = await req.payload.find({
      collection: 'plugin-invites',
      limit: 1,
      where: {
        tokenHash: {
          equals: tokenHash,
        },
      },
    })

    const invite = result.docs[0]

    if (!invite) {
      return Response.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    if (invite.status === 'accepted') {
      return Response.json({ error: 'Invitation has already been used' }, { status: 410 })
    }

    const now = new Date()
    const expiresAt = new Date(invite.expiresAt as string)

    if (now > expiresAt) {
      if (invite.status !== 'expired') {
        await req.payload.update({
          id: invite.id,
          collection: 'plugin-invites',
          data: { status: 'expired' },
        })
      }

      return Response.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    const userCollections = pluginOptions.userCollections ?? ['users']
    const collectionSlug = invite.collection as string

    if (!userCollections.includes(collectionSlug as never)) {
      return Response.json({ error: 'Invalid collection' }, { status: 400 })
    }

    // Create the user account
    try {
      await req.payload.create({
        collection: collectionSlug,
        data: {
          email: invite.email as string,
          password,
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user'
      return Response.json({ error: message }, { status: 422 })
    }

    // Mark invite as accepted
    await req.payload.update({
      id: invite.id,
      collection: 'plugin-invites',
      data: {
        status: 'accepted',
        usedAt: now.toISOString(),
      },
    })

    return Response.json({ success: true })
  }
