/** Safe internal return path from `?returnUrl=` (blocks open redirects). */
export const getReturnUrl = (search: string): string => {
  const returnUrl = new URLSearchParams(search).get('returnUrl')

  return returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
    ? returnUrl
    : '/'
}
