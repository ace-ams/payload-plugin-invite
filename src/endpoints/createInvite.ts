import type { PayloadHandler } from 'payload'

import crypto from 'node:crypto'

import type { PayloadInviteConfig } from '../types.js'

import {
  defaultEmailHtml,
  defaultEmailSubject,
  defaultEmailText,
  renderTemplate,
} from '../email/defaultTemplate.js'

export const createInviteEndpoint =
  (pluginOptions: PayloadInviteConfig): PayloadHandler =>
  async (req) => {
    // Require authenticated admin user
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { collection?: string; data?: Record<string, string>; email?: string }

    try {
      body = (await req.json?.()) ?? {}
    } catch {
      body = {}
    }

    const { collection, data: extraData = {}, email } = body

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

    // Persist the invite (extra field values stored in `data` for use on account creation)
    await req.payload.create({
      collection: 'plugin-invites',
      data: {
        collection,
        data: extraData,
        email,
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
        tokenHash,
      },
    })

    // Build the full invite URL — serverURL is always absolute (e.g. https://example.com)
    const serverURL = req.payload.config.serverURL ?? ''
    const adminRoute = req.payload.config.routes.admin ?? '/admin'
    const inviteURL = `${serverURL}${adminRoute}/invite-accept?token=${rawToken}`

    // Merge default templates with any user overrides.
    // Extra field values are included so they can be used as placeholders, e.g. {name}.
    const templateValues: Record<string, string> = { email, url: inviteURL, ...extraData }

    const subject = renderTemplate(
      pluginOptions.email?.subject ?? defaultEmailSubject,
      templateValues,
    )

    const html = renderTemplate(pluginOptions.email?.html ?? defaultEmailHtml, templateValues)

    const text = renderTemplate(pluginOptions.email?.text ?? defaultEmailText, templateValues)

    await req.payload.sendEmail({ html, subject, text, to: email })

    return Response.json({ success: true })
  }
