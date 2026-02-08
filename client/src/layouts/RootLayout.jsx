import { Outlet } from 'react-router';
import { Footer, NavBar } from '../components/Index';

const RootLayout = () => {
  return (
    <div>
      {/* Header */}
      <NavBar />
      {/* Main Outlet */}
      <div className='pt-24 min-h-[calc(100vh-68px)]'>
        <Outlet />
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RootLayout;
