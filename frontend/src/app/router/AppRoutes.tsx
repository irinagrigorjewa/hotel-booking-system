import { Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@app/layouts/AuthLayout'
import { PublicLayout } from '@app/layouts/PublicLayout'
import { GuestOnly } from '@app/router/GuestOnly'
import { RequireAdmin } from '@app/router/RequireAdmin'
import { RequireAuth } from '@app/router/RequireAuth'
import { AdminBookingsPage } from '@pages/AdminBookingsPage'
import { AdminHomePage } from '@pages/AdminHomePage'
import { AdminHotelsPage } from '@pages/AdminHotelsPage'
import { AdminReviewsPage } from '@pages/AdminReviewsPage'
import { AdminRoomTypesPage } from '@pages/AdminRoomTypesPage'
import { AdminRoomsPage } from '@pages/AdminRoomsPage'
import { AdminUsersPage } from '@pages/AdminUsersPage'
import { BookingNewPage } from '@pages/BookingNewPage'
import { FavoritesPage } from '@pages/FavoritesPage'
import { HomePage } from '@pages/HomePage'
import { HotelDetailPage } from '@pages/HotelDetailPage'
import { HotelsMapPage } from '@pages/HotelsMapPage'
import { HotelsPage } from '@pages/HotelsPage'
import { LoginPage } from '@pages/LoginPage'
import { NotFoundPage } from '@pages/NotFoundPage'
import { ProfilePage } from '@pages/ProfilePage'
import { RegisterPage } from '@pages/RegisterPage'

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="hotels" element={<HotelsPage />} />
      <Route path="hotels/map" element={<HotelsMapPage />} />
      <Route path="hotels/:id" element={<HotelDetailPage />} />
      <Route element={<RequireAuth />}>
        <Route path="bookings/new" element={<BookingNewPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<AdminHomePage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/hotels" element={<AdminHotelsPage />} />
        <Route path="admin/room-types" element={<AdminRoomTypesPage />} />
        <Route path="admin/rooms" element={<AdminRoomsPage />} />
        <Route path="admin/bookings" element={<AdminBookingsPage />} />
        <Route path="admin/reviews" element={<AdminReviewsPage />} />
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
