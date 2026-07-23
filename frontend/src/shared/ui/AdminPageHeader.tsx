import { Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { fonts } from '@shared/theme/tokens'

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
      <Typography
        component="h1"
        sx={{
          fontFamily: fonts.display,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          mb: links.length > 0 ? 1 : 3,
        }}
        variant="h4"
      >
        {title}
      </Typography>
      {links.length > 0 ? (
        <Typography sx={{ mb: 3 }} variant="body2">
          {links.map((link, index) => (
            <Link
              component={RouterLink}
              key={link.to}
              sx={index > 0 ? { ml: 2 } : undefined}
              to={link.to}
              underline="hover"
            >
              {link.label}
            </Link>
          ))}
        </Typography>
      ) : null}
    </>
  )
}
