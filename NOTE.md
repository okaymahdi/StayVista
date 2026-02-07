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
  signInWithEmailAndPassword,
  signInWithPopup,
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

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(Auth, email, password);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(Auth, googleProvider);
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

  const AuthInfo = {
    user,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    resetPassword,
    logOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  // Array of children.
  children: PropTypes.array,
};

export { AuthContext };
export default AuthProvider;
```

# 3. MongoDB Setup In [Server] Side

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

/** Mongo Client Setup */
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db; // 🔑 store DB instance globally

/** Database Connection Function */
const connectDB = async () => {
  try {
    /** 🔗 Connect only once */
    if (!db) {
      await client.connect(); // connect once

      db = client.db(process.env.MONGO_DATABASE_NAME);

      /** 🟢 Optional ping  */
      await client.db('admin').command({ ping: 1 });

      /** ✅ Successful Connection Logs */
      console.log(
        `\n🍃 ${chalk.green.bold('MongoDB')} Connected Successfully!`,
      );
      console.log(`🏷️ Cluster Host: ${chalk.yellow(client.options.srvHost)}`);
      console.log(
        `🕒 Connected At: ${chalk.cyan(new Date().toLocaleString())}\n`,
      );
    }

    return db; // 🔑 important
  } catch (error) {
    // ❌ Connection Failed Logs
    console.error(
      chalk.red.bold(`❌ MongoDB Connection Failed: ${error.message || error}`),
    );
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
};

module.exports = { connectDB, getDB };
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
const express = require('express');
const app = express();

const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.get('/', (_, res) => {
  res.send('🚀 Career Code API is Running!');
});

module.exports = app;
```

# 4. Layout Setup In [Client] Side

- RootLayout.jsx

```js
import { Outlet } from 'react-router';
import { Footer, NavBar } from '../Components/Index';

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
    <div
      className='
    w-[94%]
    sm:w-[92%]
    md:w-[90%]
    lg:w-[88%]
    xl:w-[85%]
    max-w-7xl
    mx-auto
  '
    >
      {/* Header */}
      <NavBar />
      {/* Main Outlet */}
      <div className='min-h-[calc(100vh-306px)]'>
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

# 5. Router Setup In [Client] Side

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

# 6. Get All Rooms From DB

- rooms.controller.js

```js
const { getDB } = require('../config/db');
const { asyncHandler } = require('../middlewares/async.middleware');
const getAllRoomsController = asyncHandler(async (req, res) => {
  const db = getDB();
  const roomsCollection = await db.collection('rooms');
  const cursor = await roomsCollection.find();
  const rooms = await cursor.toArray();
  res.send(rooms);
});
```

- rooms.routes.js

```js
const express = require('express');
const { getAllRoomsController } = require('../controllers/rooms.controller');
const roomsRouter = express.Router();

/** Get All Rooms Router */
roomsRouter.get('/rooms', getAllRoomsController);

module.exports = { roomsRouter };
```

- app.js

```js
app.use('/', roomsRouter);
```

# 7.

- main.jsx

```js

```

# 8.

- main.jsx

```js

```

# 9.

- main.jsx

```js

```

# 10.

- main.jsx

```js

```
