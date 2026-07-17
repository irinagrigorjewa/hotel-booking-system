import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

interface LoginFormValues {
  email: string
  password: string
}

const getReturnUrl = (search: string): string => {
  const returnUrl = new URLSearchParams(search).get('returnUrl')

  return returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
    ? returnUrl
    : '/'
}

export const LoginPage = () => {
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
      setSubmitError(getApiErrorMessage(error, 'Не удалось выполнить вход'))
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <Typography component="h1" variant="h4">
        Вход
      </Typography>
      <Typography sx={{ mb: 3 }} color="text.secondary">
        Войдите, чтобы управлять бронированиями.
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
        label="Email"
        margin="normal"
        type="email"
        {...register('email', {
          required: 'Укажите email',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Введите корректный email',
          },
        })}
      />
      <TextField
        autoComplete="current-password"
        error={Boolean(errors.password)}
        fullWidth
        helperText={errors.password?.message}
        label="Пароль"
        margin="normal"
        type="password"
        {...register('password', {
          required: 'Укажите пароль',
          minLength: {
            value: 8,
            message: 'Пароль должен содержать минимум 8 символов',
          },
        })}
      />
      <Button
        disabled={isSubmitting}
        fullWidth
        sx={{ mt: 3 }}
        type="submit"
        variant="contained"
      >
        {isSubmitting ? 'Выполняется вход...' : 'Войти'}
      </Button>
      <Typography sx={{ mt: 2 }}>
        Нет аккаунта?{' '}
        <Link component={RouterLink} to="/register">
          Зарегистрироваться
        </Link>
      </Typography>
    </Box>
  )
}
