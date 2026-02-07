import { Outlet } from 'react-router';
import { Footer, NavBar } from '../components/Index';

/** 📱🖥️ দেখতে কেমন হবে
 *
 *|Screen    | Width
 * --------- | -----------------|
 * 📱 Mobile  | 94%
 * 💻 Tablet | 90%
 * 💻 Laptop | 88%
 * 🖥️ Large monitor | 85% (max 7xl)
 */

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
