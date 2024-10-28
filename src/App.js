import React from 'react';
import './App.css'
import {Route, Routes} from "react-router-dom";

import Home from "./pages/Home"
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword'
import Error from './pages/Error'

import Navbar from './components/common/Navbar';
import OpenRoute from './components/core/Auth/OpenRoute'
import UpdatePassword from './pages/UpdatePassword';
import BackToTopButton from './components/common/BackToTop';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import Contact from './pages/Contact';
import MyProfile from './components/core/Dashboard/MyProfile';
import ProtectedRoute from './components/core/Auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Settings from './components/core/Dashboard/Settings'
import { useSelector } from 'react-redux';
import { ACCOUNT_TYPE } from './utils/constants';
import EnrolledCourses from './components/core/Dashboard/EnrolledCourses';
import Cart from './components/core/Dashboard/Cart';
import AddCourse from './components/core/Dashboard/AddCourse';
import MyCourses from './components/core/Dashboard/MyCourses';
import EditCourse from './components/core/Dashboard/EditCourse';
import Catalog from './pages/Catalog';
import CourseDetails from './pages/CourseDetails';
import ViewCourse from './pages/ViewCourse';
import VideoDetails from './components/core/ViewCourse/VideoDetails';
import Instructor from './components/core/Dashboard/InstructorDashboard/Instructor';

function App() {

  const {user} = useSelector((state) => state.profile)

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter min-w-[355px]">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="catalog/:catalogName" element={<Catalog/>} />
        <Route path="courses/:courseId" element={<CourseDetails/>}/>

        <Route 
          path="/signup" 
          element={
            <OpenRoute>
              <Signup/>
            </OpenRoute>
          }
        />
        <Route 
          path="/login" 
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />

        <Route 
          path="/forgot-password" 
          element={
            <OpenRoute>
              <ForgotPassword/>
             </OpenRoute>
          }
        />

        <Route 
          path="/update-password/:id" 
          element={
            // <OpenRoute>
              <UpdatePassword/>
            // </OpenRoute>
          }
        />

        <Route 
          path="/reset-password" 
          element={
            <ProtectedRoute>
              <ForgotPassword/>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/verify-email" 
          element={
            <OpenRoute>
              <VerifyEmail/>
            </OpenRoute>
          }
        />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="settings" element={<Settings />} />

        {user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
            <Route path="cart" element={<Cart />} />
            <Route path="enrolled-courses" element={<EnrolledCourses />} />
          </>
        )}

        {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
            <Route path="instructor" element={<Instructor />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="edit-course/:courseId" element={<EditCourse />} />
          </>
        )}

        { //this route is for the case when the user is null and there should exist some route in order to navigate all routes to Protected route
          user === null && <Route path="*"/>
        }
        
      </Route>
      
      <Route element={
        <ProtectedRoute>
          <ViewCourse />
        </ProtectedRoute>
      }>

      {
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
          <Route 
            path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails />}
          />
          </>
        )
      }

      </Route>

        <Route path="/about" element={ <About/> } />

        <Route path="/contact" element={<Contact/>} />

        <Route path="*" element={<Error/>} />

        
      </Routes>
      
      <BackToTopButton/>

    </div>
  );
}

export default App;
