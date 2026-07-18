import { Route, Routes } from 'react-router-dom'

import { AuthLayout } from '../layouts/AuthLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminHotelsPage } from '../pages/AdminHotelsPage'
import { AdminRoomTypesPage } from '../pages/AdminRoomTypesPage'
import { HomePage } from '../pages/HomePage'
import { HotelDetailPage } from '../pages/HotelDetailPage'
import { HotelsPage } from '../pages/HotelsPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { RegisterPage } from '../pages/RegisterPage'
import { GuestOnly } from './GuestOnly'
import { RequireAdmin } from './RequireAdmin'
import { RequireAuth } from './RequireAuth'

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="hotels" element={<HotelsPage />} />
      <Route path="hotels/map" element={<PlaceholderPage title="Карта отелей" />} />
      <Route path="hotels/:id" element={<HotelDetailPage />} />
      <Route element={<RequireAuth />}>
        <Route path="bookings/new" element={<PlaceholderPage title="New booking" />} />
        <Route path="favorites" element={<PlaceholderPage title="Favorites" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<PlaceholderPage title="Admin panel" />} />
        <Route path="admin/hotels" element={<AdminHotelsPage />} />
        <Route path="admin/room-types" element={<AdminRoomTypesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route element={<GuestOnly />}>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Route>
  </Routes>
)
