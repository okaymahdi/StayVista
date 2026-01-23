import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useRole = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: role, isLoading } = useQuery({
    queryKey: ['role', user?.email],
    enabled: !!user?.email && !loading,
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/user/${user?.email}`);
      return data.role;
    },
  });

  /** Fetch User Info Using Logged In User Email */

  return [role, isLoading];
};

export default useRole;
