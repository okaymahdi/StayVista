import { createBrowserRouter } from 'react-router';
import Main from '../layouts/Main';
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

const Router = createBrowserRouter([
  {
    path: '/',
    Component: Main,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
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
