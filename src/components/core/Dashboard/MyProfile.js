import React, { useEffect, useState } from 'react';
import { RiEditBoxLine } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formattedDate } from '../../../utils/dateFormatter';
import Iconbtn from '../../common/Iconbtn';

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const [showEditButton, setShowEditButton] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowEditButton(false);
      } else {
        setShowEditButton(true);
      }
    };
    // console.log('image', user?.image)
    handleResize(); // Check initial window size
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5 flex justify-between">
        <p>My Profile</p>
        {!showEditButton && (
          <Iconbtn
            text="Edit"
            onclick={() => {
              navigate('/dashboard/settings');
            }}
            customClasses={"scale-75"}
          >
            <RiEditBoxLine />
          </Iconbtn>
        )}
      </h1>
      <div className="flex items-center justify-between rounded-md border-[1px] xs:border-richblack-700 xs:bg-richblack-800 xs:p-8 xs:px-12">
        <div className="flex items-center gap-x-4">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-richblack-5">
              {user?.firstName + ' ' + user?.lastName}
            </p>
            <p className="text-sm text-richblack-300">{user?.email}</p>
          </div>
        </div>
        {showEditButton && (
          <Iconbtn
            text="Edit"
            onclick={() => {
              navigate('/dashboard/settings');
            }}
          >
            <RiEditBoxLine />
          </Iconbtn>
        )}
      </div>
      <div className="my-10 flex flex-col gap-y-10 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-5">About</p>
          {showEditButton && (
            <Iconbtn
              text="Edit"
              onclick={() => {
                navigate('/dashboard/settings');
              }}
            >
              <RiEditBoxLine />
            </Iconbtn>
          )}
        </div>
        <p
          className={`${
            user?.additionalDetails?.about
              ? 'text-richblack-5'
              : 'text-richblack-400'
          } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? 'Write Something About Yourself'}
        </p>
      </div>
      <div className="my-10 flex flex-col gap-y-10 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-5">Personal Details</p>
          {showEditButton && (
            <Iconbtn
              text="Edit"
              onclick={() => {
                navigate('/dashboard/settings');
              }}
            >
              <RiEditBoxLine />
            </Iconbtn>
          )}
        </div>
        <div className="flex max-w-[500px] justify-between gap-y-4 flex-col md:flex-row">
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-richblack-600">First Name</p>
              <p className="text-sm font-medium text-richblack-5">{user?.firstName}</p>
            </div>
            {!showEditButton && 
              <div>
                <p className="mb-2 text-sm text-richblack-600">Last Name</p>
                <p className="text-sm font-medium text-richblack-5">{user?.lastName}</p>
              </div>
            }
            <div>
              <p className="mb-2 text-sm text-richblack-600">Email</p>
              <p className="text-sm font-medium text-richblack-5">{user?.email}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">Gender</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.additionalDetails?.gender ?? 'Add Gender'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-5">
            {showEditButton && 
              <div>
                <p className="mb-2 text-sm text-richblack-600">Last Name</p>
                <p className="text-sm font-medium text-richblack-5">{user?.lastName}</p>
              </div>
            }
            <div>
              <p className="mb-2 text-sm text-richblack-600">Phone Number</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.additionalDetails?.contactNumber ?? 'Add Contact Number'}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">Date Of Birth</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.additionalDetails?.dateOfBirth
                  ? formattedDate(user?.additionalDetails?.dateOfBirth)
                  : 'Add Date Of Birth'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

