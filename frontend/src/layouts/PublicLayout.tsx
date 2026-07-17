import { Link, Outlet } from 'react-router-dom'

export const PublicLayout = () => (
  <div>
    <header>
      <nav aria-label="Primary navigation">
        <Link to="/">Hotel Booking System</Link>
      </nav>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
)
