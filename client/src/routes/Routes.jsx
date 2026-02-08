import { createBrowserRouter } from 'react-router';
import ErrorPage from '../pages/ErrorPage';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import RoomDetails from '../pages/RoomDetails/RoomDetails';
import SignUp from '../pages/SignUp/SignUp';

import { RouterProvider } from 'react-router';
import DashboardLayout from '../layouts/DashboardLayout';
import Statistics from '../pages/Dashboard/Common/Statistics';
import AddRoom from '../pages/Dashboard/Host/AddRoom';
import MyListings from '../pages/Dashboard/Host/MyListings';
import PrivateRoute from './PrivateRoute';
import Profile from '../pages/Dashboard/Common/Profile';
import RootLayout from '../layouts/RootLayout';

const Router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        /** 12.2 Single Room Details */
        path: '/room/:id',
        Component: PrivateRoute,
        children: [
          {
            index: true,
            Component: RoomDetails,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: SignUp,
  },
  {
    path: '/dashboard',
    Component: DashboardLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: Statistics,
      },
      {
        path: 'add-room',
        Component: AddRoom,
      },
      {
        path: 'my-listings',
        Component: MyListings,
      },
      {
        path: 'profile',
        Component: Profile,
      },
    ],
  },
]);

const AppRouter = () => {
  return (
    <div>
      <RouterProvider router={Router} />
    </div>
  );
};

export { AppRouter };
