import { Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

interface AdminPageLink {
  label: string
  to: string
}

interface AdminPageHeaderProps {
  title: string
  links?: readonly AdminPageLink[]
}

export const AdminPageHeader = ({
  title,
  links = [],
}: AdminPageHeaderProps) => {
  return (
    <>
      <Typography component="h1" gutterBottom variant="h4">
        {title}
      </Typography>
      {links.length > 0 ? (
        <Typography sx={{ mb: 2 }}>
          {links.map((link, index) => (
            <Link
              component={RouterLink}
              key={link.to}
              sx={index > 0 ? { ml: 2 } : undefined}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </Typography>
      ) : null}
    </>
  )
}
