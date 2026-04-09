'use client'

import { Button, Drawer, useConfig, useModal } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

const DRAWER_SLUG = 'invite-user-drawer'

type AuthCollection = {
  labels?: { plural?: Record<string, string> | string }
  slug: string
}

export const InviteUserButton: React.FC = () => {
  const { config } = useConfig()
  const { closeModal, openModal } = useModal()

  const authCollections: AuthCollection[] = (config.collections ?? []).filter(
    (c) => Boolean(c.auth) && c.slug !== 'plugin-invites',
  )

  const [email, setEmail] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string>(
    authCollections[0]?.slug ?? 'users',
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<null | string>(null)
  const [successEmail, setSuccessEmail] = useState<null | string>(null)

  const handleOpen = useCallback(() => {
    openModal(DRAWER_SLUG)
  }, [openModal])

  const handleClose = useCallback(() => {
    closeModal(DRAWER_SLUG)
    setTimeout(() => {
      setError(null)
      setSuccessEmail(null)
      setEmail('')
    }, 300)
  }, [closeModal])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      try {
        const res = await fetch('/api/plugin-invites/create', {
          body: JSON.stringify({ collection: selectedCollection, email }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })

        const data: { error?: string } = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Something went wrong')
          return
        }

        setSuccessEmail(email)
        setEmail('')
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, selectedCollection],
  )

  const handleInviteAnother = useCallback(() => {
    setSuccessEmail(null)
    setError(null)
  }, [])

  return (
    <>
      <Button onClick={handleOpen}>Invite User</Button>

      <Drawer Header="Invite User" slug={DRAWER_SLUG}>
        {successEmail ? (
          <div style={{ padding: '1.5rem' }}>
            <p
              style={{
                color: 'var(--theme-success-500, #16a34a)',
                fontSize: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              ✓ Invitation sent to <strong>{successEmail}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button onClick={handleInviteAnother}>Invite Another</Button>
              <Button buttonStyle="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {error && (
              <p
                style={{
                  background: 'var(--theme-error-100, #fee2e2)',
                  borderRadius: '4px',
                  color: 'var(--theme-error-500, #dc2626)',
                  marginBottom: '1.25rem',
                  padding: '0.625rem 0.875rem',
                }}
              >
                {error}
              </p>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="invite-email"
                style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem' }}
              >
                Email Address
              </label>
              <input
                aria-label="Email Address"
                autoComplete="off"
                disabled={isSubmitting}
                id="invite-email"
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  border: '1px solid var(--theme-elevation-200, #ccc)',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  padding: '0.5rem 0.75rem',
                  width: '100%',
                }}
                type="email"
                value={email}
              />
            </div>

            {authCollections.length > 1 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="invite-collection"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem' }}
                >
                  Invite To
                </label>
                <select
                  aria-label="Invite To"
                  disabled={isSubmitting}
                  id="invite-collection"
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  style={{
                    border: '1px solid var(--theme-elevation-200, #ccc)',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    padding: '0.5rem 0.75rem',
                    width: '100%',
                  }}
                  value={selectedCollection}
                >
                  {authCollections.map((c) => {
                    const rawLabel = c.labels?.plural
                    const label =
                      typeof rawLabel === 'string'
                        ? rawLabel
                        : c.slug.charAt(0).toUpperCase() + c.slug.slice(1)
                    return (
                      <option key={c.slug} value={c.slug}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Sending\u2026' : 'Send Invitation'}
              </Button>
              <Button buttonStyle="secondary" onClick={handleClose} type="button">
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  )
}
