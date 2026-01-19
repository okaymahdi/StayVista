import PropTypes from 'prop-types';
import { RingLoader } from 'react-spinners';

const LoadingSpinner = ({ smallHeight }) => {
  return (
    <div
      className={` ${smallHeight ? 'h-62.5' : 'h-[70vh]'}
      flex 
      flex-col 
      justify-center 
      items-center `}
    >
      <RingLoader
        loading={true}
        speedMultiplier={1}
        size={100}
        color='red'
      />
    </div>
  );
};

LoadingSpinner.propTypes = {
  smallHeight: PropTypes.bool,
};

export default LoadingSpinner;
