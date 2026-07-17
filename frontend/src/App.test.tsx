import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from './App'

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path)

  return render(<App />)
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('App', () => {
  it('renders the home page at the public root route', () => {
    renderAtPath('/')

    expect(
      screen.getByRole('heading', { name: 'Hotel Booking System' }),
    ).toBeInTheDocument()
  })

  it('renders a not-found page for an unknown route', () => {
    renderAtPath('/missing')

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
