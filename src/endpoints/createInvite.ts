import type { PayloadHandler } from 'payload'

import crypto from 'node:crypto'

import type { PayloadInviteConfig } from '../types.js'

export const createInviteEndpoint =
  (pluginOptions: PayloadInviteConfig): PayloadHandler =>
  async (req) => {
    // Require authenticated admin user
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { collection?: string; email?: string }

    try {
      body = (await req.json?.()) ?? {}
    } catch {
      body = {}
    }

    const { collection, email } = body

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'email is required' }, { status: 400 })
    }

    if (!collection || typeof collection !== 'string') {
      return Response.json({ error: 'collection is required' }, { status: 400 })
    }

    const userCollections = pluginOptions.userCollections ?? ['users']

    if (!userCollections.includes(collection as never)) {
      return Response.json({ error: 'Invalid collection' }, { status: 400 })
    }

    const inviteExpiryMs = pluginOptions.inviteExpiryMs ?? 48 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + inviteExpiryMs)

    // Generate a secure random token and hash it for storage
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    // Persist the invite
    await req.payload.create({
      collection: 'plugin-invites',
      data: {
        collection,
        email,
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
        tokenHash,
      },
    })

    const serverURL = req.payload.config.serverURL ?? ''

    // Send the invite email
    const adminRoute = req.payload.config.routes.admin ?? '/admin'
    const inviteURL = `${serverURL}${adminRoute}/invite-accept?token=${rawToken}`

    await req.payload.sendEmail({
      html: `
        <p>You have been invited to create an account.</p>
        <p>Click the link below to accept your invitation. This link expires in ${Math.round(inviteExpiryMs / (60 * 60 * 1000))} hours.</p>
        <p><a href="${inviteURL}">Accept Invitation</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${inviteURL}</p>
      `,
      subject: 'You have been invited',
      text: `You have been invited to create an account. Visit ${inviteURL} to accept.`,
      to: email,
    })

    return Response.json({ success: true })
  }
