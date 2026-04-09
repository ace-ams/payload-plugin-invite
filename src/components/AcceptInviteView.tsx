import { MinimalTemplate } from '@payloadcms/next/templates'
import React from 'react'

import { AcceptInviteForm } from './AcceptInviteForm.js'

export const AcceptInviteView: React.FC = () => {
  return (
    <MinimalTemplate>
      <AcceptInviteForm />
    </MinimalTemplate>
  )
}
