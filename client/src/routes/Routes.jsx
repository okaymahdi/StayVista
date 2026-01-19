import { createBrowserRouter } from 'react-router';
import Main from '../layouts/Main';
import ErrorPage from '../pages/ErrorPage';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import RoomDetails from '../pages/RoomDetails/RoomDetails';
import SignUp from '../pages/SignUp/SignUp';

import { RouterProvider } from 'react-router';

export const router = createBrowserRouter([
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
        Component: RoomDetails,
      },
    ],
  },
  { path: '/login', Component: Login },
  { path: '/signup', Component: SignUp },
]);

const AppRouter = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export { AppRouter };
