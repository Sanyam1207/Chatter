import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import { useSelector } from 'react-redux';
import LoaderComponent from './components/LoaderComponent';
import Profile from './pages/profile';

function App() {

  const {Loader} = useSelector(state => state.loaderReducer)

  return (
    <div>
      <Toaster position='bottom-right' reverseOrder={false} />
      {Loader && <LoaderComponent />}
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>} />
            <Route path='/profile' element={ 
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
              } />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
