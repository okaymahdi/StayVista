import { differenceInCalendarDays } from 'date-fns';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { DateRange } from 'react-date-range';
import Button from '../Shared/Button/Button';

const RoomReservation = ({ room }) => {
  console.log('start date =>', new Date(room.from).toLocaleDateString());
  console.log('end date =>', new Date(room.to).toLocaleDateString());
  const [state, setState] = useState([
    {
      startDate: new Date(room.from),
      endDate: new Date(room.to),
      key: 'selection',
    },
  ]);

  /** Calculation Total Days + Total Price */
  const totalPrice =
    parseInt(differenceInCalendarDays(new Date(room.to), new Date(room.from))) *
    room?.price;
  console.log(totalPrice);

  return (
    <div className='rounded-xl border border-neutral-200 overflow-hidden bg-white'>
      <div className='flex items-center gap-1 p-4'>
        <div className='text-2xl font-semibold'>$ {room?.price}</div>
        <div className='font-light text-neutral-600'>/Night</div>
      </div>
      <hr />
      <div className='flex justify-center'>
        {/* Calender */}
        <DateRange
          showDateDisplay={false}
          rangeColors={['oklch(64.5% 0.246 16.439)']}
          editableDateInputs={false}
          onChange={() => {
            setState([
              {
                startDate: new Date(room.from),
                endDate: new Date(room.to),
                key: 'selection',
              },
            ]);
          }}
          moveRangeOnFirstSelection={false}
          ranges={state}
        />
      </div>
      <hr />
      <div className='p-4'>
        <Button label={'Reserve'} />
      </div>
      <hr />
      <div className='p-4 flex items-center justify-between font-semibold text-lg'>
        <div>Total</div>
        <div>${totalPrice}</div>
      </div>
    </div>
  );
};

RoomReservation.propTypes = {
  room: PropTypes.object,
};

export default RoomReservation;
