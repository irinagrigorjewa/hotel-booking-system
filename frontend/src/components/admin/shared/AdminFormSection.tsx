import { Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface AdminFormSectionProps {
  title: string
  children: ReactNode
}

export const AdminFormSection = ({
  title,
  children,
}: AdminFormSectionProps) => {
  return (
    <Paper sx={{ mb: 3, p: 2 }} variant="outlined">
      <Typography component="h2" gutterBottom variant="h6">
        {title}
      </Typography>
      {children}
    </Paper>
  )
}
