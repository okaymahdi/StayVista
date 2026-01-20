import { createBrowserRouter } from 'react-router';
import Main from '../layouts/Main';
import ErrorPage from '../pages/ErrorPage';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import RoomDetails from '../pages/RoomDetails/RoomDetails';
import SignUp from '../pages/SignUp/SignUp';

import { RouterProvider } from 'react-router';
import PrivateRoute from './PrivateRoute';

const Router = createBrowserRouter([
  {
    path: '/',
    Component: Main,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: '/room/:id',
        element: (
          <PrivateRoute>
            <RoomDetails />
          </PrivateRoute>
        ),
      },
    ],
  },
  { path: '/login', Component: Login },
  { path: '/signup', Component: SignUp },
]);

const AppRouter = () => {
  return (
    <div>
      <RouterProvider router={Router} />
    </div>
  );
};

export { AppRouter };
