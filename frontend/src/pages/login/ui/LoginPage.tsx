import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

import { getReturnUrl } from '@features/auth/model/getReturnUrl'
import { useAuth } from '@features/auth/ui/AuthContext'
import { getApiErrorMessage } from '@shared/lib/getApiErrorMessage'
import { fonts } from '@shared/theme/tokens'

interface LoginFormValues {
  email: string
  password: string
}

export const LoginPage = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  const submit = async (values: LoginFormValues): Promise<void> => {
    setSubmitError('')

    try {
      await login(values)
      navigate(getReturnUrl(location.search), { replace: true })
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, t('errors.loginFailed'), (key) => t(key)),
      )
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <Typography
        component="h1"
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('auth.loginTitle')}
      </Typography>
      <Typography sx={{ mb: 3, mt: 1 }} color="text.secondary">
        {t('auth.loginSubtitle')}
      </Typography>
      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}
      <TextField
        autoComplete="email"
        error={Boolean(errors.email)}
        fullWidth
        helperText={errors.email?.message}
        label={t('auth.email')}
        margin="normal"
        type="email"
        {...register('email', {
          required: t('auth.emailRequired'),
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: t('auth.emailInvalid'),
          },
        })}
      />
      <TextField
        autoComplete="current-password"
        error={Boolean(errors.password)}
        fullWidth
        helperText={errors.password?.message}
        label={t('auth.password')}
        margin="normal"
        type="password"
        {...register('password', {
          required: t('auth.passwordRequired'),
          minLength: { value: 8, message: t('auth.passwordMin') },
        })}
      />
      <Button
        color="cta"
        disabled={isSubmitting}
        fullWidth
        sx={{ mt: 2.5 }}
        type="submit"
        variant="contained"
      >
        {isSubmitting ? t('auth.loginSubmitting') : t('auth.loginSubmit')}
      </Button>
      <Typography sx={{ mt: 2.5 }} variant="body2">
        {t('auth.noAccount')}{' '}
        <Link component={RouterLink} to="/register">
          {t('nav.register')}
        </Link>
      </Typography>
      <Typography sx={{ mt: 1.5 }} variant="body2">
        <Link component={RouterLink} to="/">
          {t('auth.toHome')}
        </Link>
      </Typography>
    </Box>
  )
}
