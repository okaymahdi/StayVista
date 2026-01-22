import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { imageUpload } from '../../../Api/Utils/Index';
import AddRoomForm from '../../../components/Form/AddRoomForm';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useNavigate } from 'react-router';

const AddRoom = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState();
  const [imageText, setImageText] = useState('Upload Image');
  const [loading, setLoading] = useState(false);
  /** Date Range */
  const [dates, setDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  /** Handle Date Range */
  const handleDates = (range) => {
    setDates(range.selection);
  };

  /** Tanstack Query */
  const { mutateAsync } = useMutation({
    mutationFn: async (roomData) => {
      const { data } = await axiosSecure.post('/room', roomData);
      return data;
    },

    onSuccess: () => {
      console.log('Room Added Successfully');
      toast.success('Room Added Successfully');
      navigate('/dashboard/my-listings');
      setLoading(false);
    },
  });

  /** Handle Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const location = form.location.value;
    const category = form.category.value;
    const title = form.title.value;
    const from = dates.startDate.toISOString();
    const to = dates.endDate.toISOString();
    const price = Number(form.price.value);
    const guests = Number(form.guests.value);
    const bathrooms = Number(form.bathrooms.value);
    const bedrooms = Number(form.bedrooms.value);
    const description = form.description.value;
    const image = form.image.files[0];

    const host = {
      name: user?.displayName,
      image: user?.photoURL,
      email: user?.email,
    };

    /** Upload Image & Get Image Url */
    try {
      setLoading(true);
      const imageUrl = await imageUpload(image);
      const roomData = {
        location,
        category,
        title,
        to,
        from,
        price,
        guests,
        bathrooms,
        bedrooms,
        description,
        image: imageUrl,
        host,
      };
      console.table(roomData);

      /** Post Request to Server */
      await mutateAsync(roomData);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /** Handle Image Change */
  const handleImageChange = (image) => {
    setImagePreview(URL.createObjectURL(image));
    setImageText(image.name);
  };
  return (
    <>
      <Helmet>
        <title>StayVista | Add Room</title>
      </Helmet>
      {/* Add room form */}
      <AddRoomForm
        dates={dates}
        handleDates={handleDates}
        handleSubmit={handleSubmit}
        imagePreview={imagePreview}
        imageText={imageText}
        handleImageChange={handleImageChange}
        loading={loading}
      />
    </>
  );
};

export default AddRoom;
