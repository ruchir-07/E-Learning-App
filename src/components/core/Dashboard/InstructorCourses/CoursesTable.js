import {
  useDispatch,
  //  useDispatch,
  useSelector,
} from "react-redux";

// import { setCourse, setEditCourse } from "../../../../redux/slices/courseSlice"
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { HiClock } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

import { formatDate } from "../../../../services/formatDate";
import {
  deleteCourse,
  fetchInstructorCourses,
} from "../../../../services/operations/CourseDetailsAPI";
import { COURSE_STATUS } from "../../../../utils/constants";
import ConfirmationModal from "../../../common/ConfirmationModal";
import { resetCourseState } from "../../../../redux/slices/courseSlice";

export default function Coursestable({ courses, setCourses }) {
  //   const dispatch = useDispatch()
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const TRUNCATE_LENGTH = 30;

  const handleCourseDelete = async (courseId) => {
    setLoading(true);
    await deleteCourse({ courseId: courseId }, token);
    const result = await fetchInstructorCourses(token);

    if (result) {
      setCourses(result);
    }
    if (course && course._id === courseId) {
      //if we have deleted the coures which is currently being made in add course section or being edited then empty add course section
      dispatch(resetCourseState());
    }
    setConfirmationModal(null);
    setLoading(false);
  };

  // console.log("All Course ", courses)

  return (
    <div className="overflow-x-scroll">
      <div className="rounded-md border-[3px] border-richblack-800 w-full min-w-[800px]">
        {courses?.length === 0 ? (
          <div>
            <div className="py-10 text-center text-2xl font-medium text-richblack-100">
              No courses found
              {/* TODO: Need to change this state */}
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="w-[67%] flex flex-col">
              <div className="text-left p-2 border-b-2 border-richblack-800 text-s font-medium uppercase w-full text-richblack-100">
                Course
              </div>
              {courses?.map((course) => (
                <div
                  key={course._id}
                  className="flex text-left flex-col border-b-2 border-richblack-800 px-6 py-8 h-[220px] overflow-y-scroll"
                >
                  <div className="flex gap-x-4 w-full">
                    <img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="h-[148px] md:w-[220px] rounded-lg object-cover"
                    />
                    <div className="flex flex-col justify-between">
                      <p className="text-lg font-semibold text-richblack-5">
                        {course.courseName}
                      </p>
                      <p className="text-xs text-richblack-300">
                        {course.courseDescription.split(" ").length >
                        TRUNCATE_LENGTH
                          ? course.courseDescription
                              .split(" ")
                              .slice(0, TRUNCATE_LENGTH)
                              .join(" ") + "..."
                          : course.courseDescription}
                      </p>
                      <p className="text-[12px] text-white">
                        Created: {formatDate(course.createdAt)}
                      </p>
                      {course.status === COURSE_STATUS.DRAFT ? (
                        <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
                          <HiClock size={14} />
                          Drafted
                        </p>
                      ) : (
                        <div className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
                          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
                            <FaCheck size={8} />
                          </div>
                          Published
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex w-[33%] justify-between">
              <div className="font-medium w-full text-richblack-100 flex flex-col">
                <div className="text-left p-2 border-b-2 border-richblack-800 text-s font-medium uppercase w-full text-richblack-100">
                  Duration
                </div>
                <div>
                  {courses?.map((course) => (
                    <div
                      key={course._id}
                      className="flex text-center flex-col border-b-2 border-richblack-800 h-[220px] overflow-y-scroll justify-center items-center"
                    >
                      <div className="text-sm font-medium text-richblack-100 overflow-y-scroll max-w-24">
                        {course.timeDuration ? course.timeDuration : "---"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="font-medium w-full text-richblack-100 flex flex-col">
                <div className="text-center p-2 border-b-2 border-richblack-800 text-s font-medium uppercase w-full text-richblack-100">
                  price
                </div>
                <div>
                  {courses?.map((course) => (
                    <div
                      key={course._id}
                      className="flex text-left flex-col border-b-2 border-richblack-800 h-[220px] overflow-y-scroll justify-center items-center"
                    >
                      <div className="text-sm font-medium text-richblack-100 overflow-y-scroll max-w-24">
                      ₹{course.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="font-medium w-full text-richblack-100 flex flex-col">
                <div className="text-center p-2 border-b-2 border-richblack-800 text-s font-medium uppercase w-full text-richblack-100">
                  Actions
                </div>
                {courses?.map((course) => (
                  <div
                    key={course._id}
                    className="flex text-left flex-col border-b-2 border-richblack-800 h-[220px] overflow-y-scroll justify-center items-center"
                  >
                    <div className="text-sm font-medium text-richblack-100">
                      <button
                        disabled={loading}
                        onClick={() => {
                          navigate(`/dashboard/edit-course/${course._id}`);
                        }}
                        title="Edit"
                        className="px-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => {
                          setConfirmationModal({
                            text1: "Do you want to delete this course?",
                            text2:
                              "All the data related to this course will be deleted",
                            btn1Text: !loading ? "Delete" : "Loading...  ",
                            btn2Text: "Cancel",
                            btn1Handler: !loading
                              ? () => handleCourseDelete(course._id)
                              : () => {},
                            btn2Handler: !loading
                              ? () => setConfirmationModal(null)
                              : () => {},
                          });
                        }}
                        title="Delete"
                        className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
                      >
                        <RiDeleteBin6Line size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
}

// import {
//   useDispatch,
//     //  useDispatch,
//      useSelector
// } from "react-redux"

// // import { setCourse, setEditCourse } from "../../../../redux/slices/courseSlice"
// import React, { useState } from "react"
// import { FaCheck } from "react-icons/fa"
// import { FiEdit2 } from "react-icons/fi"
// import { HiClock } from "react-icons/hi"
// import { RiDeleteBin6Line } from "react-icons/ri"
// import { useNavigate } from "react-router-dom"

// import { formatDate } from "../../../../services/formatDate"
// import { deleteCourse, fetchInstructorCourses } from "../../../../services/operations/CourseDetailsAPI"
// import { COURSE_STATUS } from "../../../../utils/constants"
// import ConfirmationModal from "../../../common/ConfirmationModal"
// import { resetCourseState } from "../../../../redux/slices/courseSlice"

// export default function Coursestable({ courses, setCourses }) {
// //   const dispatch = useDispatch()
//   const navigate = useNavigate();
//   const { token } = useSelector((state) => state.auth);
//   const { course } = useSelector((state) => state.course);
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);
//   const [confirmationModal, setConfirmationModal] = useState(null);
//   const TRUNCATE_LENGTH = 30;

//   const handleCourseDelete = async (courseId) => {
//     setLoading(true)
//     await deleteCourse({ courseId: courseId }, token)
//     const result = await fetchInstructorCourses(token);

//     if (result) {
//       setCourses(result)
//     }
//     if(course._id === courseId){ //if we have deleted the coures which is currently being made in add course section or being edited then empty add course section
//       dispatch(resetCourseState());
//     }
//     setConfirmationModal(null)
//     setLoading(false)
//   }

//   // console.log("All Course ", courses)

//   return (
//     <div className="overflow-x-scroll">
//       <div className="rounded-md border-[3px] border-richblack-800 w-full min-w-[800px]">
//         <div className="flex justify-between rounded-t-md border-[3px] border-b-richblack-800 px-6 py-2">
//           <div className="w-[67%]">
//             <p className="text-left text-sm font-medium uppercase text-richblack-100">
//               Courses
//             </p>
//           </div>
//           <div className="flex w-[33%] justify-between">
//             <p className="text-left text-sm font-medium uppercase text-richblack-100">
//                 Duration
//             </p>
//             <p className="text-left text-sm font-medium uppercase text-richblack-100">
//                 Price
//             </p>
//             <p className="text-left text-sm font-medium uppercase text-richblack-100">
//                 Actions
//             </p>
//         </div>
//         </div>
//         <div>
//           {courses?.length === 0 ? (
//             <div>
//               <div className="py-10 text-center text-2xl font-medium text-richblack-100">
//                 No courses found
//                 {/* TODO: Need to change this state */}
//               </div>
//             </div>
//           ) : (
//             courses?.map((course) => (
//               <div key={course._id} className="flex border-b border-richblack-800 px-6 py-8">
//                 <div className="w-[67%]">
//                     <div className="flex gap-x-4 w-full">
//                         <img
//                             src={course?.thumbnail}
//                             alt={course?.courseName}
//                             className="h-[148px] md:w-[220px] rounded-lg object-cover"
//                         />
//                         <div className="flex flex-col justify-between">
//                             <p className="text-lg font-semibold text-richblack-5">
//                             {course.courseName}
//                             </p>
//                             <p className="text-xs text-richblack-300">
//                             {course.courseDescription.split(" ").length >
//                             TRUNCATE_LENGTH
//                                 ? course.courseDescription
//                                     .split(" ")
//                                     .slice(0, TRUNCATE_LENGTH)
//                                     .join(" ") + "..."
//                                 : course.courseDescription}
//                             </p>
//                             <p className="text-[12px] text-white">
//                             Created: {formatDate(course.createdAt)}
//                             </p>
//                             {course.status === COURSE_STATUS.DRAFT ? (
//                             <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
//                                 <HiClock size={14} />
//                                 Drafted
//                             </p>
//                             ) : (
//                             <div className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
//                                 <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
//                                 <FaCheck size={8} />
//                                 </div>
//                                 Published
//                             </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//                 <div className="w-[32%] flex justify-between">
//                     <div className="text-sm font-medium text-richblack-100">
//                         {course.timeDuration}
//                     </div>
//                     <div className="text-sm font-medium text-richblack-100">
//                         ₹{course.price}
//                     </div>
//                     <div className="text-sm font-medium text-richblack-100 ">
//                         <button
//                             disabled={loading}
//                             onClick={() => {
//                             navigate(`/dashboard/edit-course/${course._id}`)
//                             }}
//                             title="Edit"
//                             className="px-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300"
//                         >
//                             <FiEdit2 size={20} />
//                         </button>
//                         <button
//                             disabled={loading}
//                             onClick={() => {
//                             setConfirmationModal({
//                                 text1: "Do you want to delete this course?",
//                                 text2:
//                                 "All the data related to this course will be deleted",
//                                 btn1Text: !loading ? "Delete" : "Loading...  ",
//                                 btn2Text: "Cancel",
//                                 btn1Handler: !loading
//                                 ? () => handleCourseDelete(course._id)
//                                 : () => {},
//                                 btn2Handler: !loading
//                                 ? () => setConfirmationModal(null)
//                                 : () => {},
//                             })
//                             }}
//                             title="Delete"
//                             className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
//                         >
//                             <RiDeleteBin6Line size={20} />
//                         </button>
//                     </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//       {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
//     </div>
//   )
// }