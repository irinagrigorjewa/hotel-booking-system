import { Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import { radius } from '@shared/theme/tokens'

interface AdminFormSectionProps {
  title: string
  children: ReactNode
}

export const AdminFormSection = ({
  title,
  children,
}: AdminFormSectionProps) => {
  return (
    <Paper
      sx={{ borderRadius: `${radius.md}px`, mb: 3, p: 2.5 }}
      variant="outlined"
    >
      <Typography component="h2" gutterBottom sx={{ fontWeight: 600 }} variant="h6">
        {title}
      </Typography>
      {children}
    </Paper>
  )
}
