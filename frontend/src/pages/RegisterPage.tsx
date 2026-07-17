import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
}

export const RegisterPage = () => {
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
      setSubmitError(getApiErrorMessage(error, 'Не удалось зарегистрироваться'))
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <Typography component="h1" variant="h4">
        Регистрация
      </Typography>
      <Typography sx={{ mb: 3 }} color="text.secondary">
        Создайте аккаунт для бронирования номеров.
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
        label="Имя"
        margin="normal"
        {...register('name', {
          required: 'Укажите имя',
          maxLength: {
            value: 100,
            message: 'Имя не должно превышать 100 символов',
          },
        })}
      />
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
        autoComplete="new-password"
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
      <TextField
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        fullWidth
        helperText={errors.confirmPassword?.message}
        label="Подтвердите пароль"
        margin="normal"
        type="password"
        {...register('confirmPassword', {
          required: 'Подтвердите пароль',
          validate: (value) =>
            value === getValues('password') || 'Пароли должны совпадать',
        })}
      />
      <TextField
        autoComplete="tel"
        error={Boolean(errors.phone)}
        fullWidth
        helperText={errors.phone?.message}
        label="Телефон"
        margin="normal"
        type="tel"
        {...register('phone')}
      />
      <Button
        disabled={isSubmitting}
        fullWidth
        sx={{ mt: 3 }}
        type="submit"
        variant="contained"
      >
        {isSubmitting ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
      </Button>
      <Typography sx={{ mt: 2 }}>
        Уже есть аккаунт?{' '}
        <Link component={RouterLink} to="/login">
          Войти
        </Link>
      </Typography>
    </Box>
  )
}
