import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/CourseDetailsAPI"
import Iconbtn from "../../common/Iconbtn"
import CoursesTable from "./InstructorCourses/CoursesTable"

export default function MyCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  function convertSecondsToTime(seconds) {
    // Get the number of hours
    const hours = Math.floor(seconds / 3600);
  
    // Get the number of minutes
    const minutes = Math.floor((seconds % 3600) / 60);
  
    // Get the number of seconds
    const secondsLeft = seconds % 60;
  
    // Return the time in a string format
    return `${(hours !== 0) ? hours + "h" : ""} ${(minutes!==0) ? minutes + "m" : ""} ${secondsLeft + "s"}`.trim();
  }

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await fetchInstructorCourses(token)
      if (result) {

        for(let Course of result){
          // console.log(Course)
          let totalDurationInSeconds = 0
          Course.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
              const timeDurationInSeconds = parseInt(subSection.timeDuration)
              totalDurationInSeconds += timeDurationInSeconds
            });
            Course.timeDuration = convertSecondsToTime(totalDurationInSeconds);
          });
          // console.log(Course.timeDuration);
        }

        setCourses(result)
      }
    }
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="mb-14 flex items-center justify-between">
        <h1 className="text-3xl font-medium text-richblack-5">My Courses</h1>
        <Iconbtn
          text="Add Course"
          onclick={() => navigate("/dashboard/add-course")}
        >
          <VscAdd />
        </Iconbtn>
      </div>
      {courses && <CoursesTable courses={courses} setCourses={setCourses} />}
    </div>
  )
}