import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NotificationProvider, useNotify } from './NotificationProvider'

const NotifyHarness = ({
  onReady,
}: {
  onReady: (notify: ReturnType<typeof useNotify>) => void
}) => {
  const notify = useNotify()
  onReady(notify)

  return (
    <button type="button" onClick={() => notify.notifySuccess('notifications.bookingCreated')}>
      Show success
    </button>
  )
}

describe('NotificationContext', () => {
  it('shows a success snackbar with translated message', async () => {
    render(
      <NotificationProvider>
        <NotifyHarness onReady={() => undefined} />
      </NotificationProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Show success' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Бронирование создано')
    })
  })

  it('shows API error details via notifyApiError', async () => {
    const ApiErrorHarness = () => {
      const { notifyApiError } = useNotify()

      return (
        <button
          type="button"
          onClick={() =>
            notifyApiError(
              {
                response: {
                  data: {
                    detail: 'Booking dates overlap with an existing booking',
                  },
                },
              },
              'errors.createBookingFailed',
            )
          }
        >
          Show API error
        </button>
      )
    }

    render(
      <NotificationProvider>
        <ApiErrorHarness />
      </NotificationProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Show API error' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Даты пересекаются с существующим бронированием',
      )
    })
  })
})
