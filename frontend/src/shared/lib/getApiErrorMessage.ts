interface ApiErrorResponse {
  data?: {
    detail?: string | { msg?: string }[]
  }
}

interface ApiError {
  message?: string
  response?: ApiErrorResponse
}

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null

const extractDetail = (error: ApiError): string | undefined => {
  const detail = error.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail) && detail[0]?.msg) {
    return detail[0].msg
  }

  return undefined
}

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
  translate?: (key: string) => string,
): string => {
  if (!isApiError(error)) {
    return fallbackMessage
  }

  const detail = extractDetail(error)

  if (detail) {
    if (translate) {
      const mapped = translate(`apiErrors.${detail}`)

      if (mapped !== `apiErrors.${detail}`) {
        return mapped
      }
    }

    return detail
  }

  return error.message || fallbackMessage
}
