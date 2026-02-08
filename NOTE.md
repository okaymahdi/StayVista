# 1. Project Setup [Client] & [Server]

# 2. Firebase Setup in [Client] Side

- .env.local

```js
VITE_apiKey=AIzaSyDNDrQ8eyvX3zNe6z-fBpn2S49Uow0GCBg
VITE_authDomain=stayvista-16f17.firebaseapp.com
VITE_projectId=stayvista-16f17
VITE_storageBucket=stayvista-16f17.firebasestorage.app
VITE_messagingSenderId=671851320261
VITE_appId=1:671851320261:web:e7ecb06dc165285c3b71ac
```

- firebase.config.js

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

const app = initializeApp(firebaseConfig);
const Auth = getAuth(app);

export { Auth };
```

- AuthProvider.jsx

```js
import axios from 'axios';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signinWithEmailAndPassword,
  signinWithPopup,
  signOut,
  updateProfile,
} from 'firebase/Auth';
import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { app, Auth } from '../firebase/firebase.config';
const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(Auth, email, password);
  };

  const signin = (email, password) => {
    setLoading(true);
    return signinWithEmailAndPassword(Auth, email, password);
  };

  const signinWithGoogle = () => {
    setLoading(true);
    return signinWithPopup(Auth, googleProvider);
  };

  const resetPassword = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(Auth, email);
  };

  const logOut = async () => {
    setLoading(true);
    await axios.get(`${import.meta.env.VITE_API_URL}/logout`, {
      withCredentials: true,
    });
    return signOut(Auth);
  };

  const updateUserProfile = (name, photo) => {
    return updateProfile(Auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };
  // Get token from server
  const getToken = async (email) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/jwt`,
      { email },
      { withCredentials: true },
    );
    return data;
  };

  /** Save User to DB */
  const saveUser = async (user) => {
    const currentUser = {
      email: user.email,
      role: 'guest',
      status: 'Verified',
    };
    const data = await axios.put(
      `${import.meta.env.VITE_API_URL}/user`,
      currentUser,
    );
    return data;
  };

  // onAuthStateChange
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getToken(currentUser.email);
        saveUser(currentUser);
      }
      setLoading(false);
    });
    return () => {
      return unsubscribe();
    };
  }, []);

  const Authinfo = {
    user,
    loading,
    setLoading,
    createUser,
    signin,
    signinWithGoogle,
    resetPassword,
    logOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={Authinfo}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  // Array of children.
  children: PropTypes.array,
};

export { AuthContext };
export default AuthProvider;
```

# 3. MongoDB Setup in [Server] Side

- .env

```js
PORT = 8000;
MONGO_USER = StayVista;
MONGO_PASSWORD = StayVista_2026;
MONGO_CLUSTER_NAME = stayvista;
MONGO_DATABASE_NAME = StayVista;
ACCESS_TOKEN_SECRET = stayvista_super_secret_key_123;
NODE_ENV = development;
```

- db.js

```js
const { default: chalk } = require('chalk');
const { MongoClient, ServerApiVersion } = require('mongodb');

/** MongoDB Connection URI */
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_NAME}.gv00ql5.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`;

/** Mongo Client */
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let collections = {}; // 🔑 all collections here

/** 🔗 Connect DB (only once) */
const connectDB = async () => {
  try {
    if (!db) {
      await client.connect();

      db = client.db(process.env.MONGO_DATABASE_NAME);

      /** 🧩 Register collections here */
      collections.rooms = db.collection('rooms');
      collections.users = db.collection('users');

      /** 🟢 Ping check */
      await client.db('admin').command({ ping: 1 });

      console.log(
        `\n🍃 ${chalk.green.bold('MongoDB')} Connected Successfully!`,
      );
      console.log(`🏷️ Cluster Host: ${chalk.yellow(client.options.srvHost)}`);
      console.log(
        `🕒 Connected At: ${chalk.cyan(new Date().toLocaleString())}\n`,
      );
    }

    return db;
  } catch (error) {
    console.error(
      chalk.red.bold(`❌ MongoDB Connection Failed: ${error.message || error}`),
    );
    process.exit(1);
  }
};

/** 🔑 Get DB instance */
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

/** 📦 Get any collection safely */
const getCollection = (name) => {
  if (!collections[name]) {
    throw new Error(`Collection "${name}" is not registered`);
  }
  return collections[name];
};

module.exports = {
  connectDB,
  getDB,
  getCollection,
};
```

- app.js

```js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: 'unauthorized access' });
    }
    req.user = decoded;
    next();
  });
};

app.get('/', (_, res) => {
  res.send('🚀 Career Code API is Running!');
});

module.exports = app;
```

- server.js

```js
require('dotenv').config();

const { default: chalk } = require('chalk');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // 1️⃣ Connect MongoDB
    const db = await connectDB();

    // 2️⃣ List collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections in DB:');
    collections.forEach((c) => console.log(' -', c.name));

    // 3️⃣ Start Express server
    app.listen(PORT, () => {
      console.log(
        chalk.magenta.bold(
          `🔥 Career Code Server is Running at http://localhost:${PORT}`,
        ),
      );
    });
  } catch (error) {
    console.error(chalk.red('❌ Failed to start server:'), error);
    process.exit(1);
  }
};
startServer();
```

# 4. Layout Setup in [Client] Side

- RootLayout.jsx

```js
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
```

- Error.jsx

```js
import { useNavigate } from 'react-router';
import Button from '../components/Shared/Button/Button';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <section className='bg-white '>
      <div className='container flex items-center min-h-screen px-6 py-12 mx-auto'>
        <div className='flex flex-col items-center max-w-sm mx-auto text-center'>
          <p className='p-3 text-sm font-medium text-rose-500 rounded-full bg-blue-50 '>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
              />
            </svg>
          </p>
          <h1 className='mt-3 text-2xl font-semibold text-gray-800  md:text-3xl'>
            Something Went Wrong!
          </h1>
          <p className='mt-4 text-gray-500 '>Here are some helpful links:</p>

          <div className='flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto'>
            <button
              onClick={() => navigate(-1)}
              className='flex items-center justify-center w-1/2 px-5 py-1 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto   hover:bg-gray-100 '
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='w-5 h-5 rtl:rotate-180 text-rose-500'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18'
                />
              </svg>

              <span>Go back</span>
            </button>

            <Button
              label={'Take Me Home'}
              onClick={() => navigate('/')}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;
```

# 5. Router Setup in [Client] Side

- Routes.jsx

```js
const Router = createBrowserRouter([
  {
    path: '/',
    Component: Main,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: '/room/:id',
        Component: PrivateRoute,
        children: [
          {
            index: true,
            Component: RoomDetails,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: SignUp,
  },
  {
    path: '/dashboard',
    Component: DashboardLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: Statistics,
      },
      {
        path: 'add-room',
        Component: AddRoom,
      },
      {
        path: 'my-listings',
        Component: MyListings,
      },
      {
        path: 'profile',
        Component: Profile,
      },
    ],
  },
]);

const AppRouter = () => {
  return (
    <div>
      <RouterProvider router={Router} />
    </div>
  );
};

export { AppRouter };
```

- PrivateRoute.jsx

```js
import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import useAuth from '../hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (user) return <Outlet />;
  return (
    <Navigate
      to='/login'
      state={{ from: location }}
      replace={true}
    />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.element,
};

export default PrivateRoute;
```

- main.jsx

```js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AuthProvider from './providers/AuthProvider';
import { AppRouter } from './routes/Routes';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>,
);
```

# 6. Get All Rooms From DB in [Server] Side

- rooms.controller.js

```js
const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');
const { asyncHandler } = require('../middlewares/async.middleware');

/** 6.1 Get All Rooms Controller */
const getAllRoomsController = asyncHandler(async (req, res) => {
  const roomsCollection = getCollection('rooms');

  /** 🔍 Find all Rooms without Query Parameters */
  const cursor = roomsCollection.find();
  const rooms = await cursor.toArray();
  res.send(rooms);
});
```

- rooms.routes.js

```js
const express = require('express');
const { getAllRoomsController } = require('../controllers/rooms.controller');
const roomsRouter = express.Router();

/** 6.2 Get All Rooms Router */
roomsRouter.get('/rooms', getAllRoomsController);

module.exports = { roomsRouter };
```

- app.js

```js
/** 6.3 Main Rooms Routes */
app.use('/', roomsRouter);
```

# 7. Axios Setup For Base Url

```js
import axios from 'axios';

/** 7. Axios Common Instance */
const axiosCommon = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const AxiosCommon = () => {
  return axiosCommon;
};

export { AxiosCommon };
```

# 8. Show All Rooms in [Client] Side

- Home.jsx

```js
import { Helmet } from 'react-helmet-async';
import Rooms from '../../components/Home/Rooms';

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>StayVista | Vacation Homes & Condo Rentals</title>
      </Helmet>

      {/* 8.1 Rooms section */}
      <Rooms />
    </div>
  );
};

export default Home;
```

# 9. Setup @tanstack/react-query in [Client] Side

- main.jsx

```js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AuthProvider from './providers/AuthProvider';
import { AppRouter } from './routes/Routes';

/** 9.1 tanstack query client */
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  /** Helmet Provider */
  <HelmetProvider>
    {/* 9.2 tanstack query Provider */}
    <QueryClientProvider client={queryClient}>
      {/* Auth Provider */}
      <AuthProvider>
        {/* Root Router */}
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>,
);
```

# 10. Get All Rooms Show in [Client] Side with @tanstack/react-query

- Rooms.jsx

```js
import { useQuery } from '@tanstack/react-query';
import useAxiosCommon from '../../hooks/useAxiosCommon';

const Rooms = () => {
  const axiosCommon = useAxiosCommon();
  const {
    data: rooms = [],
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      /** 10. All Rooms Show with use Axios */
      const { data } = await axiosCommon.get('/rooms');
      return data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (isPending) return <LoadingSpinner />;
  if (isError) return <div>Error: {isError.message}</div>;

  return <></>;
};
```

# 11. Get Single Room By Id in [Server] Side

- rooms.controller.js

```js
const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');
const { asyncHandler } = require('../middlewares/async.middleware');

/** 11.1 Get Room by ID Controller */
const getRoomByIdController = asyncHandler(async (req, res) => {
  const roomsCollection = getCollection('rooms');
  const roomId = req.params.id;
  const query = { _id: new ObjectId(roomId) };
  const room = await roomsCollection.findOne(query);
  if (!room) {
    return res.status(404).send({ message: 'Room not found' });
  }
  res.send(room);
});

module.exports = { getRoomByIdController };
```

- rooms.routes.js

```js
/** 11.2 Get Room by ID Router */
roomsRouter.get('/room/:id', getRoomByIdController);
```

# 12. Get Single Room By Id in [Client] Side

- RoomDetails.jsx

```js
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import RoomReservation from '../../components/RoomDetails/RoomReservation';
import Container from '../../components/Shared/Container';
import Heading from '../../components/Shared/Heading';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { AxiosCommon } from '../../Api/Axios/AxiosCommon';

const RoomDetails = () => {
  const { id } = useParams();
  const axiosCommon = AxiosCommon();

  /** 12.1 Fetch Data From Server with Tanstack */
  const {
    data: room = {},
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      /** Single Room Fetching with Id */
      const { data } = await axiosCommon.get(`/room/${id}`);
      return data;
    },
  });

  if (isLoading || isPending) return <LoadingSpinner />;
  if (isError) return <div>Error: {isError.message}</div>;
  return <></>;
};
```

- Routes.jsx

```js
  {
    /** 12.2 Single Room Details */
    path: '/room/:id',
    Component: PrivateRoute,
    children: [
      {
        index: true,
        Component: RoomDetails,
      },
    ],
  },
```

# 13. Install Query String in [Client] Side

```js
npm i query-string
```

# 14. Show Categories [Client] Side

- Home.jsx

```js
import { Helmet } from 'react-helmet-async';
import Categories from '../../components/Categories/Categories';

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>StayVista | Vacation Homes & Condo Rentals</title>
      </Helmet>

      {/* 14.1 Categories section  */}
      <Categories />
    </div>
  );
};

export default Home;
```

- Categories.jsx

```js
import { Helmet } from 'react-helmet-async';
import Categories from '../../components/Categories/Categories';

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>StayVista | Vacation Homes & Condo Rentals</title>
      </Helmet>

      {/* 14.1 Categories section  */}
      <Categories />
    </div>
  );
};

export default Home;
```

- CategoriesData.js

```js
import { BsSnow } from 'react-icons/bs';
import { FaSkiing } from 'react-icons/fa';
import {
  GiBarn,
  GiBoatFishing,
  GiCactus,
  GiCastle,
  GiCaveEntrance,
  GiForestCamp,
  GiIsland,
  GiWindmill,
} from 'react-icons/gi';
import { IoDiamond } from 'react-icons/io5';
import { MdOutlineVilla } from 'react-icons/md';
import { TbBeach, TbMountain, TbPool } from 'react-icons/tb';

/** 14.2 Categories Data */
const categories = [
  {
    label: 'Beach',
    icon: TbBeach,
    description: 'This property is close to the beach!',
  },
  {
    label: 'Windmills',
    icon: GiWindmill,
    description: 'This property is has windmills!',
  },
  {
    label: 'Modern',
    icon: MdOutlineVilla,
    description: 'This property is modern!',
  },
  {
    label: 'Countryside',
    icon: TbMountain,
    description: 'This property is in the countryside!',
  },
  {
    label: 'Pools',
    icon: TbPool,
    description: 'This is property has a beautiful pool!',
  },
  {
    label: 'Islands',
    icon: GiIsland,
    description: 'This property is on an island!',
  },
  {
    label: 'Lake',
    icon: GiBoatFishing,
    description: 'This property is near a lake!',
  },
  {
    label: 'Skiing',
    icon: FaSkiing,
    description: 'This property has skiing activities!',
  },
  {
    label: 'Castles',
    icon: GiCastle,
    description: 'This property is an ancient castle!',
  },
  {
    label: 'Caves',
    icon: GiCaveEntrance,
    description: 'This property is in a spooky cave!',
  },
  {
    label: 'Camping',
    icon: GiForestCamp,
    description: 'This property offers camping activities!',
  },
  {
    label: 'Arctic',
    icon: BsSnow,
    description: 'This property is in arctic environment!',
  },
  {
    label: 'Desert',
    icon: GiCactus,
    description: 'This property is in the desert!',
  },
  {
    label: 'Barns',
    icon: GiBarn,
    description: 'This property is in a barn!',
  },
  {
    label: 'Lux',
    icon: IoDiamond,
    description: 'This property is brand new and luxurious!',
  },
];

export { categories };
```

- Categories.jsx

```js
import Container from '../Shared/Container';
import { categories } from './CategoriesData.js';
import CategoryBox from './CategoryBox';

/** 14.3 Categories Parent Component */
const Categories = () => {
  return (
    <Container>
      <div className='pt-4 flex items-center justify-between overflow-x-auto'>
        {categories.map((item) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
```

- CategoryBox.jsx

```js
import queryString from 'query-string';
import { useNavigate, useSearchParams } from 'react-router';

/** 15.4 Category Box Component */
const CategoryBox = ({ label, icon: Icon }) => {
  /** 15.1 Create Query String & Get Link with Query String */
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
        query: currentQuery || '/',
      },
      { skipNull: true },
    );
    navigate(url);
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
```

# 15. Query Set in Url in [Client] Side

- CategoryBox.jsx

```js
import queryString from 'query-string';
import { useNavigate, useSearchParams } from 'react-router';

const CategoryBox = ({ label, icon: Icon }) => {
  /** 15.1 Create Query String & Get Link with Query String */
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
        query: currentQuery || '/',
      },
      { skipNull: true },
    );
    navigate(url);
  };
};
```

- Rooms.jsx

```js
const Rooms = () => {
  const axiosCommon = AxiosCommon();

  /** 15.2 Query Set in Url */
  const [params] = useSearchParams();
  const category = params.get('category');

  /** 8. Fetch Data From Server with Tanstack Query */
  const {
    data: rooms = [],
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['rooms', category],
    queryFn: async () => {
      /** Query String Set in Url */
      const url = category ? `/rooms?category=${category}` : '/rooms';

      const { data } = await axiosCommon.get(url);
      return data;
    },
  });
  if (isLoading) return <LoadingSpinner />;
  if (isPending) return <LoadingSpinner />;
  if (isError) return <div>Error: {isError.message}</div>;

  return <></>;
};
```

# 16. Query Set with Category in [Server] Side

- rooms.controller.js

```js
const getAllRoomsController = asyncHandler(async (req, res) => {
  const roomsCollection = getCollection('rooms');
  /** 16. 🔍 Find Room by Category */
  const category = req.query.category;
  let query = {};
  if (category) {
    query = { category };
  }

  /** 🔍 Find all Rooms without Query Parameters */
  const cursor = roomsCollection.find();

  /** 16. 🔍 Find Room by Category */
  const cursor = roomsCollection.find(query);
  const rooms = await cursor.toArray();
  res.send(rooms);
});
```
