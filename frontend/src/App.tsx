import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from './routes/AppRoutes'

export const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
