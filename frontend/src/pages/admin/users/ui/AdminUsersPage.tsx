import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@shared/ui/AdminErrorAlert'
import { AdminPageHeader } from '@shared/ui/AdminPageHeader'
import { useAuth } from '@features/auth/ui/AuthContext'
import { useNotify } from '@app/providers/NotificationProvider'
import { useUserMutations } from '@entities/user/api/mutations/useUserMutations'
import { useUsers } from '@entities/user/api/queries/useUsers'
import type { UserRole } from '@entities/user/model/types'

export const AdminUsersPage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const usersQuery = useUsers({ page: 1, size: 100, search: appliedSearch || undefined })
  const { patchUser } = useUserMutations()

  const handleRoleChange = async (userId: number, role: UserRole): Promise<void> => {
    try {
      await patchUser.mutateAsync({ userId, payload: { role } })
      notifySuccess('notifications.roleUpdated')
    } catch (error) {
      notifyApiError(error, 'errors.updateRoleFailed')
    }
  }

  return (
    <Box>
      <AdminPageHeader title={t('admin.usersTitle')} />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          label={t('common.search')}
          onChange={(event) => {
            setSearch(event.target.value)
          }}
          size="small"
          value={search}
        />
        <Button
          onClick={() => {
            setAppliedSearch(search.trim())
          }}
          variant="contained"
        >
          {t('common.apply')}
        </Button>
      </Stack>
      {usersQuery.isError ? (
        <AdminErrorAlert
          message={t('admin.usersLoadFailed')}
          onRetry={() => {
            void usersQuery.refetch()
          }}
          retryLabel={t('common.retry')}
        />
      ) : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('auth.email')}</TableCell>
            <TableCell>{t('auth.name')}</TableCell>
            <TableCell>{t('auth.phone')}</TableCell>
            <TableCell>{t('profile.role')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(usersQuery.data?.items ?? []).map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.phone ?? '—'}</TableCell>
              <TableCell>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id={`role-${user.id}`}>{t('profile.role')}</InputLabel>
                  <Select
                    disabled={patchUser.isPending || user.id === currentUser?.id}
                    label={t('profile.role')}
                    labelId={`role-${user.id}`}
                    onChange={(event) => {
                      void handleRoleChange(user.id, event.target.value as UserRole)
                    }}
                    value={user.role}
                  >
                    <MenuItem value="CLIENT">{t('enums.role.CLIENT')}</MenuItem>
                    <MenuItem value="ADMIN">{t('enums.role.ADMIN')}</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
