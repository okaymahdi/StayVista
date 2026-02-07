import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import useAxiosCommon from '../../hooks/useAxiosCommon';
import Container from '../Shared/Container';
import Heading from '../Shared/Heading';
import LoadingSpinner from '../Shared/LoadingSpinner';
import Card from './Card';

const Rooms = () => {
  // const [rooms, setRooms] = useState([]);
  // const [loading, setLoading] = useState(false);
  const axiosCommon = useAxiosCommon();
  const [params] = useSearchParams();

  const category = params.get('category');
  // console.log(category);

  /** 8. Fetch Data From Server with Tanstack Query */
  const {
    data: rooms = [],
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['rooms', category],
    queryFn: async () => {
      const url = category ? `/rooms?category=${category}` : '/rooms';

      const { data } = await axiosCommon.get(url);
      return data;
    },
  });

  // useEffect(() => {
  //   setLoading(true);
  //   fetch(`./rooms.json`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setRooms(data);
  //       setLoading(false);
  //     });
  // }, []);

  // useEffect(() => {
  //   setLoading(true);
  //   fetch(`${import.meta.env.VITE_API_URL}/rooms`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setRooms(data);
  //       setLoading(false);
  //     });
  // }, []);

  if (isLoading) return <LoadingSpinner />;
  if (isPending) return <LoadingSpinner />;
  if (isError) return <div>Error: {isError.message}</div>;

  return (
    <Container>
      {rooms && rooms.length > 0 ? (
        <div className='pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8'>
          {rooms.map((room) => (
            <Card
              key={room._id}
              room={room}
            />
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center min-h-[calc(100vh-300px)]'>
          <Heading
            center={true}
            title='No Rooms Available In This Category!'
            subtitle='Please Select Other Categories.'
          />
        </div>
      )}
    </Container>
  );
};

export default Rooms;
