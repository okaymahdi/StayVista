import { useState } from 'react';
import useAuth from './useAuth';

const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState();

  /** Fetch User Info Using Logged In User Email */

  return role;
};

export default useRole;
