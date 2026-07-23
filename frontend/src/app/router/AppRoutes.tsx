import { Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@app/layouts/AdminLayout'
import { AuthLayout } from '@app/layouts/AuthLayout'
import { PublicLayout } from '@app/layouts/PublicLayout'
import { GuestOnly } from '@app/router/GuestOnly'
import { RequireAdmin } from '@app/router/RequireAdmin'
import { RequireAuth } from '@app/router/RequireAuth'
import { AdminBookingsPage } from '@pages/admin/bookings/ui/AdminBookingsPage'
import { AdminHomePage } from '@pages/admin/home/ui/AdminHomePage'
import { AdminHotelsPage } from '@pages/admin/hotels/ui/AdminHotelsPage'
import { AdminReviewsPage } from '@pages/admin/reviews/ui/AdminReviewsPage'
import { AdminRoomTypesPage } from '@pages/admin/room-types/ui/AdminRoomTypesPage'
import { AdminRoomsPage } from '@pages/admin/rooms/ui/AdminRoomsPage'
import { AdminUsersPage } from '@pages/admin/users/ui/AdminUsersPage'
import { BookingNewPage } from '@pages/booking-new/ui/BookingNewPage'
import { FavoritesPage } from '@pages/favorites/ui/FavoritesPage'
import { HomePage } from '@pages/home/ui/HomePage'
import { HotelDetailPage } from '@pages/hotel-detail/ui/HotelDetailPage'
import { HotelsMapPage } from '@pages/hotels-map/ui/HotelsMapPage'
import { HotelsPage } from '@pages/hotels/ui/HotelsPage'
import { LoginPage } from '@pages/login/ui/LoginPage'
import { NotFoundPage } from '@pages/not-found/ui/NotFoundPage'
import { ProfilePage } from '@pages/profile/ui/ProfilePage'
import { RegisterPage } from '@pages/register/ui/RegisterPage'

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
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route element={<GuestOnly />}>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Route>
    <Route element={<RequireAdmin />}>
      <Route element={<AdminLayout />}>
        <Route path="admin" element={<AdminHomePage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/hotels" element={<AdminHotelsPage />} />
        <Route path="admin/room-types" element={<AdminRoomTypesPage />} />
        <Route path="admin/rooms" element={<AdminRoomsPage />} />
        <Route path="admin/bookings" element={<AdminBookingsPage />} />
        <Route path="admin/reviews" element={<AdminReviewsPage />} />
      </Route>
    </Route>
  </Routes>
)
