'use client'

import { Button } from '@payloadcms/ui'
import React, { useCallback, useEffect, useState } from 'react'

type Status = 'error' | 'invalid' | 'loading' | 'submitting' | 'success' | 'valid'

const baseClass = 'login'

export const AcceptInviteForm: React.FC = () => {
  const [status, setStatus] = useState<Status>('loading')
  const [email, setEmail] = useState('')
  const [collection, setCollection] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setErrorMessage('No invitation token found in the URL.')
      setStatus('invalid')
      return
    }

    void fetch(`/api/plugin-invites/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data: { collection?: string; email?: string; error?: string } = await res.json()
        if (!res.ok) {
          setErrorMessage(data.error ?? 'Invalid or expired invitation.')
          setStatus('invalid')
          return
        }
        setEmail(data.email ?? '')
        setCollection(data.collection ?? '')
        setStatus('valid')
      })
      .catch(() => {
        setErrorMessage('Network error while validating the invitation.')
        setStatus('invalid')
      })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setPasswordError('')

      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.')
        return
      }

      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters.')
        return
      }

      setStatus('submitting')

      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      try {
        const res = await fetch('/api/plugin-invites/accept', {
          body: JSON.stringify({ collection, password, token }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })

        const data: { error?: string } = await res.json()

        if (!res.ok) {
          setErrorMessage(data.error ?? 'Failed to create account.')
          setStatus('error')
          return
        }

        setStatus('success')
      } catch {
        setErrorMessage('Network error. Please try again.')
        setStatus('error')
      }
    },
    [collection, confirmPassword, password],
  )

  if (status === 'loading') {
    return (
      <div className={`${baseClass}__brand`}>
        <p>Validating your invitation&hellip;</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <>
        <div className={`${baseClass}__brand`} />
        <div className="form-header">
          <h1>Invitation Invalid</h1>
          <p>{errorMessage}</p>
        </div>
        <a href="/admin/login">Go to login &rarr;</a>
      </>
    )
  }

  if (status === 'success') {
    return (
      <>
        <div className={`${baseClass}__brand`} />
        <div className="form-header">
          <h1>Account Created!</h1>
          <p>
            Your account has been created. You can now log in with your email and the password you
            just set.
          </p>
        </div>
        <a className="btn btn--style-primary btn--size-large" href="/admin/login">
          Go to login &rarr;
        </a>
      </>
    )
  }

  return (
    <>
      <div className={`${baseClass}__brand`} />

      <div className="form-header">
        <h1>Accept Invitation</h1>
        <p>
          Set a password for <strong>{email}</strong> to create your account.
        </p>
      </div>

      {status === 'error' && (
        <div className="banner banner--type-error" style={{ marginBottom: 'calc(var(--base))' }}>
          {errorMessage}
        </div>
      )}

      <form className={`${baseClass}__form`} onSubmit={handleSubmit}>
        <div className={`${baseClass}__form__inputWrap`}>
          {/* Read-only email field */}
          <div className="field-type text">
            <div className="field-label-wrap">
              <label className="field-label" htmlFor="accept-email">
                Email
              </label>
            </div>
            <input
              aria-label="Email"
              disabled
              id="accept-email"
              onChange={() => undefined}
              readOnly
              type="email"
              value={email}
            />
          </div>

          {/* Password field */}
          <div className={`field-type password${passwordError ? ' error' : ''}`}>
            <div className="field-label-wrap">
              <label className="field-label" htmlFor="accept-password">
                Password
              </label>
            </div>
            <input
              aria-label="Password"
              autoComplete="new-password"
              disabled={status === 'submitting'}
              id="accept-password"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {/* Confirm password field */}
          <div className={`field-type password${passwordError ? ' error' : ''}`}>
            <div className="field-label-wrap">
              <label className="field-label" htmlFor="accept-confirm">
                Confirm Password
              </label>
            </div>
            <input
              aria-label="Confirm Password"
              autoComplete="new-password"
              disabled={status === 'submitting'}
              id="accept-confirm"
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
            {passwordError && (
              <div
                style={{
                  color: 'var(--theme-error-500)',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                }}
              >
                {passwordError}
              </div>
            )}
          </div>
        </div>

        <Button disabled={status === 'submitting'} size="large" type="submit">
          {status === 'submitting' ? 'Creating account\u2026' : 'Create Account'}
        </Button>
      </form>
    </>
  )
}
