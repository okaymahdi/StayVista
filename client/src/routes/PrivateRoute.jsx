import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import useAuth from '../hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (user) return <Outlet />;
  return (
    <Navigate
      to='/login'
      state={{ from: location }}
      replace={true}
    />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.element,
};

export default PrivateRoute;
