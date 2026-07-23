import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { useAuth } from '@features/auth/ui/AuthContext'
import { getApiErrorMessage } from '@shared/lib/getApiErrorMessage'
import { fonts } from '@shared/theme/tokens'

interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
}

export const RegisterPage = () => {
  const { t } = useTranslation()
  const { register: registerAccount } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>()

  const submit = async ({
    name,
    email,
    password,
    phone,
  }: RegisterFormValues): Promise<void> => {
    setSubmitError('')

    try {
      await registerAccount({
        name,
        email,
        password,
        phone: phone || null,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, t('errors.registerFailed'), (key) => t(key)),
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
        {t('auth.registerTitle')}
      </Typography>
      <Typography sx={{ mb: 3, mt: 1 }} color="text.secondary">
        {t('auth.registerSubtitle')}
      </Typography>
      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}
      <TextField
        autoComplete="name"
        error={Boolean(errors.name)}
        fullWidth
        helperText={errors.name?.message}
        label={t('auth.name')}
        margin="normal"
        {...register('name', {
          required: t('auth.nameRequired'),
          maxLength: { value: 100, message: t('auth.nameMax') },
        })}
      />
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
        autoComplete="new-password"
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
      <TextField
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        fullWidth
        helperText={errors.confirmPassword?.message}
        label={t('auth.confirmPassword')}
        margin="normal"
        type="password"
        {...register('confirmPassword', {
          required: t('auth.confirmRequired'),
          validate: (value) =>
            value === getValues('password') || t('auth.passwordsMismatch'),
        })}
      />
      <TextField
        autoComplete="tel"
        error={Boolean(errors.phone)}
        fullWidth
        helperText={errors.phone?.message}
        label={t('auth.phone')}
        margin="normal"
        type="tel"
        {...register('phone')}
      />
      <Button
        color="cta"
        disabled={isSubmitting}
        fullWidth
        sx={{ mt: 3 }}
        type="submit"
        variant="contained"
      >
        {isSubmitting ? t('auth.registerSubmitting') : t('auth.registerSubmit')}
      </Button>
      <Typography sx={{ mt: 2.5 }} variant="body2">
        {t('auth.hasAccount')}{' '}
        <Link component={RouterLink} to="/login">
          {t('nav.login')}
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
