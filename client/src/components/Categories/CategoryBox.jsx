import queryString from 'query-string';
import { useNavigate, useSearchParams } from 'react-router';

const CategoryBox = ({ label, icon: Icon }) => {
  const [params] = useSearchParams();
  const category = params.get('category');
  // console.log(category === label);
  const navigate = useNavigate();
  const handleClick = () => {
    let currentQuery = {};
    if (category !== label) {
      currentQuery.category = label;
    }
    const url = queryString.stringifyUrl(
      {
        url: window.location.href,
        // url: '/',
        query: currentQuery,
      },
      { skipNull: true },
    );
    navigate(url);
    // console.log(url);
  };
  return (
    <div
      onClick={handleClick}
      className={`flex 
  flex-col 
  items-center 
  justify-center 
  gap-2
  p-3
  border-b-2
  hover:text-rose-500
  transition
  cursor-pointer ${category === label && 'border-rose-500'}
  ${category === label ? 'text-rose-500' : 'text-neutral-500'}
  `}
    >
      {Icon && <Icon size={26} />}
      <div className='text-sm font-medium'>{label}</div>
    </div>
  );
};

export default CategoryBox;
