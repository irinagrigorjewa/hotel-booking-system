import { Button, Paper, Stack, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { User } from '@entities/user/model/types'
import { radius } from '@shared/theme/tokens'

interface ProfileAccountTabProps {
  user: User | null
  name: string
  phone: string
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onSave: () => void
  isSaving: boolean
}

export const ProfileAccountTab = ({
  user,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onSave,
  isSaving,
}: ProfileAccountTabProps) => {
  const { t } = useTranslation()

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.lg}px`,
        maxWidth: 440,
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <Stack spacing={2.5}>
        <TextField
          InputProps={{ readOnly: true }}
          label={t('auth.email')}
          value={user?.email ?? ''}
        />
        <TextField
          label={t('auth.name')}
          onChange={(event) => {
            onNameChange(event.target.value)
          }}
          value={name}
        />
        <TextField
          label={t('auth.phone')}
          onChange={(event) => {
            onPhoneChange(event.target.value)
          }}
          value={phone}
        />
        <TextField
          InputProps={{ readOnly: true }}
          label={t('profile.role')}
          value={user?.role ? t(`enums.role.${user.role}`) : ''}
        />
        <Button
          disabled={isSaving || name.trim().length === 0}
          onClick={() => void onSave()}
          variant="contained"
        >
          {t('profile.save')}
        </Button>
      </Stack>
    </Paper>
  )
}
