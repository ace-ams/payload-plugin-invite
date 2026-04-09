'use client'

import { Button, Drawer, useConfig, useModal } from '@payloadcms/ui'
import React, { useCallback, useMemo, useState } from 'react'

import type { InviteField } from '../types.js'

const DRAWER_SLUG = 'invite-user-drawer'

type AuthCollection = {
  labels?: { plural?: Record<string, string> | string }
  slug: string
}

const fieldStyle: React.CSSProperties = {
  marginBottom: '1.25rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-200, #ccc)',
  borderRadius: '4px',
  fontSize: '1rem',
  padding: '0.5rem 0.75rem',
  width: '100%',
}

export const InviteUserButton: React.FC = () => {
  const { config } = useConfig()
  const { closeModal, openModal } = useModal()

  const authCollections: AuthCollection[] = (config.collections ?? []).filter(
    (c) => Boolean(c.auth) && c.slug !== 'plugin-invites',
  )

  const inviteFields = useMemo<InviteField[]>(
    () => (config.admin?.custom?.['payload-invite']?.fields as InviteField[] | undefined) ?? [],
    [config.admin?.custom],
  )

  const [email, setEmail] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string>(
    authCollections[0]?.slug ?? 'users',
  )
  // Extra field values keyed by field name
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(inviteFields.map((f) => [f.name, ''])),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [successEmail, setSuccessEmail] = useState<null | string>(null)

  const setFieldValue = useCallback((name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setEmail('')
    setError(null)
    setSuccessEmail(null)
    setFieldValues(Object.fromEntries(inviteFields.map((f) => [f.name, ''])))
  }, [inviteFields])

  const handleOpen = useCallback(() => {
    openModal(DRAWER_SLUG)
  }, [openModal])

  const handleClose = useCallback(() => {
    closeModal(DRAWER_SLUG)
    setTimeout(resetForm, 300)
  }, [closeModal, resetForm])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      try {
        const res = await fetch('/api/plugin-invites/create', {
          body: JSON.stringify({
            collection: selectedCollection,
            data: fieldValues,
            email,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })

        const result: { error?: string } = await res.json()

        if (!res.ok) {
          setError(result.error ?? 'Something went wrong')
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
    [email, fieldValues, selectedCollection],
  )

  const handleInviteAnother = useCallback(() => {
    resetForm()
  }, [resetForm])

  const collectionSelect = useMemo(() => {
    if (authCollections.length <= 1) {
      return null
    }

    return (
      <div style={fieldStyle}>
        <label htmlFor="invite-collection" style={labelStyle}>
          Invite To
        </label>
        <select
          aria-label="Invite To"
          disabled={isSubmitting}
          id="invite-collection"
          onChange={(e) => setSelectedCollection(e.target.value)}
          style={inputStyle}
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
    )
  }, [authCollections, isSubmitting, selectedCollection])

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

            {/* Email — always first */}
            <div style={fieldStyle}>
              <label htmlFor="invite-email" style={labelStyle}>
                Email Address
              </label>
              <input
                aria-label="Email Address"
                autoComplete="off"
                disabled={isSubmitting}
                id="invite-email"
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                type="email"
                value={email}
              />
            </div>

            {/* Extra fields from plugin config */}
            {inviteFields.map((field) => {
              const id = `invite-field-${field.name}`
              const label = field.label ?? field.name.charAt(0).toUpperCase() + field.name.slice(1)
              const value = fieldValues[field.name] ?? ''

              if (field.type === 'select' && field.options?.length) {
                return (
                  <div key={field.name} style={fieldStyle}>
                    <label htmlFor={id} style={labelStyle}>
                      {label}
                    </label>
                    <select
                      aria-label={label}
                      disabled={isSubmitting}
                      id={id}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      required={field.required}
                      style={inputStyle}
                      value={value}
                    >
                      <option value="">— Select —</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              }

              return (
                <div key={field.name} style={fieldStyle}>
                  <label htmlFor={id} style={labelStyle}>
                    {label}
                  </label>
                  <input
                    aria-label={label}
                    autoComplete="off"
                    disabled={isSubmitting}
                    id={id}
                    onChange={(e) => setFieldValue(field.name, e.target.value)}
                    required={field.required}
                    style={inputStyle}
                    type="text"
                    value={value}
                  />
                </div>
              )
            })}

            {/* Collection selector — only shown when there are multiple targets */}
            {collectionSelect}

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
