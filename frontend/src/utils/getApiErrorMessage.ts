interface ApiErrorResponse {
  data?: {
    detail?: string
  }
}

interface ApiError {
  message?: string
  response?: ApiErrorResponse
}

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!isApiError(error)) {
    return fallbackMessage
  }

  const detail = error.response?.data?.detail

  if (detail) {
    return detail
  }

  return error.message || fallbackMessage
}
