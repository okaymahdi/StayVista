import { Helmet } from 'react-helmet-async';
import Categories from '../../components/Categories/Categories';
import Rooms from '../../components/Home/Rooms';

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>StayVista | Vacation Homes & Condo Rentals</title>
      </Helmet>

      {/* 14.1 Categories section  */}
      <Categories />

      {/* 8.1 Rooms section */}
      <Rooms />
    </div>
  );
};

export default Home;
