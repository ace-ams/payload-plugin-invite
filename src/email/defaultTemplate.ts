export const defaultEmailSubject = 'You have been invited'

export const defaultEmailHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You have been invited</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
          sans-serif;
        color: #18181b;
      }
      .wrapper {
        width: 100%;
        padding: 48px 16px;
        box-sizing: border-box;
      }
      .card {
        background: #ffffff;
        border-radius: 8px;
        max-width: 480px;
        margin: 0 auto;
        padding: 40px 40px 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .heading {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 12px;
      }
      .body-text {
        font-size: 15px;
        line-height: 1.6;
        color: #52525b;
        margin: 0 0 28px;
      }
      .btn {
        display: inline-block;
        background-color: #18181b;
        color: #ffffff !important;
        text-decoration: none;
        font-size: 15px;
        font-weight: 600;
        padding: 12px 28px;
        border-radius: 5px;
      }
      .divider {
        border: none;
        border-top: 1px solid #e4e4e7;
        margin: 32px 0 24px;
      }
      .fallback-label {
        font-size: 12px;
        color: #a1a1aa;
        margin: 0 0 6px;
      }
      .fallback-url {
        font-size: 12px;
        color: #71717a;
        word-break: break-all;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <h1 class="heading">You&rsquo;ve been invited</h1>
        <p class="body-text">
          You have been invited to create an account for <strong>{email}</strong>. Click the button
          below to set your password and get started. This link expires in 48&nbsp;hours.
        </p>
        <a class="btn" href="{url}">Accept Invitation</a>
        <hr class="divider" />
        <p class="fallback-label">Or copy and paste this URL into your browser:</p>
        <p class="fallback-url">{url}</p>
      </div>
    </div>
  </body>
</html>`

export const defaultEmailText = `You have been invited to create an account for {email}.

Accept your invitation here: {url}

This link will expire in 48 hours. If you did not expect this invitation, you can safely ignore this email.`

/**
 * Replaces all occurrences of {url} and {email} in a template string.
 */
export const renderTemplate = (template: string, values: { email: string; url: string }): string =>
  template.replaceAll('{url}', values.url).replaceAll('{email}', values.email)
