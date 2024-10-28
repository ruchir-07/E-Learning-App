import React, { useEffect, useState } from "react";

// components import
import HighlightText from "../components/common/HighlightText";
import CTAButton from "../components/core/HomePage/Button";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import TimeLineSection from "../components/core/HomePage/TimeLineSection";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import Footer from "../components/common/Footer";
import ExploreMore from "../components/core/HomePage/ExploreMore";

//images/videos import
import Banner from "../assets/Images/banner.mp4";

// other packages
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import ReviewSlider from "../components/common/ReviewSlider";

const Home = () => {

  const {user} = useSelector((state)=>state.profile);
  const {categories} = useSelector((state)=>state.viewCourse);
  const [randomPath, setRandomPath] = useState(null);
  useEffect(()=>{
    const getRandomCategoryPath =()=>{
      const filteredCategories = [...categories].filter(c => c.courses.length > 0);
      const index = Math.floor(Math.random() * filteredCategories.length)
      const category = filteredCategories[index]?.name;
      const path = category?.split(" ").join("-").toLowerCase();
      setRandomPath(`catalog/${path}`);
      // console.log('printing', randomPath);
    }
    if(categories){
      getRandomCategoryPath();
    }
  }, [categories])
  
  return (
    <div>
      {/* Section 1 */}
      <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between gap-8">
        <Link to={user ? (user?.accountType === "Instructor" ?  "/dashboard/add-course" : "/dashboard/my-profile") : "/login"} className="group mx-auto mt-16 w-fit     rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
          <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900">
            <p>Become an Instructor</p>
            <FaArrowRight />
          </div>
        </Link>

        <div className="text-center text-4xl font-semibold">
          Empower Your Future with
          <HighlightText text="Coding Skills" />
        </div>

        <div className="-mt-3 w-[90%] text-center text-lg font-bold text-richblack-300">
          With our online coding courses, you can learn at your own pace, from
          anywhere in the world, and get access to a wealth of resources,
          including hands-on projects, quizzes, and personalized feedback from
          instructors
        </div>

        <div className="mt-8 flex flex-row gap-7">
          <CTAButton active={true} linkto={randomPath !== "catalog/undefined" ? randomPath : "/signup"}>
            Learn More
          </CTAButton>
          <CTAButton active={false} linkto={randomPath !== "catalog/undefined" ? randomPath : "/login"}>
            Book a demo
          </CTAButton>
        </div>

        <div className="mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200 w-11/12">
          <video
            className="shadow-[20px_20px_rgba(255,255,255)]"
            muted
            loop
            autoPlay
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/* Code Section 1 */}
        <div>
          <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold">
                Unlock Your
                <HighlightText text={"coding potential "} />
                with our online courses
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you"
            }
            ctabtn1={{
              btnText: "Try it Yourself",
              linkto: randomPath !== "catalog/undefined" ? randomPath : "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn more",
              linkto: randomPath !== "catalog/undefined" ? randomPath : "/login",
              active: false,
            }}
            codeblock={
              '<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n</body>\n<h1><a href="/">Header</a></h1>\n<nav><a href="one/">One</a>\n<a href="/two">Two</a>\n<a href="/three">Three</a>\n</nav>\n</body>'
            }
            codecolor={"text-yellow-25"}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="text-4xl font-semibold">
                Start
                <HighlightText text={"coding in seconds"} />
              </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson"
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              linkto: randomPath !== "catalog/undefined" ? randomPath : "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn more",
              linkto: randomPath !== "catalog/undefined" ? randomPath : "/login",
              active: false,
            }}
            codeblock={`import React from "react";\nimport CTAButton from "./Button";\nimport image from "./image.jpg";\nimport {FaArrow} from "react-icons";\n\nconst Home = () => {\n  return (\n\t<div>Home</div>\n  );\n}\n\nexport default Home;`}
            codecolor={"text-blue-25"}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
          />
        </div>

        {/*Explore Section  */}
        <ExploreMore/>
      </div>

      {/* Section 2 */}
      <div className="bg-pure-greys-5 text-richblack-700">
        <div className="homepage_bg h-[320px]">
          {/* Explore Full Catagory Section */}
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
            <div className="lg:h-[150px]"></div>
            <div className="flex flex-row gap-7 text-white lg:mt-8">
              <CTAButton active={true} linkto={randomPath !== "catalog/undefined"? randomPath : "/signup"}>
                <div className="flex items-center gap-2">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>
              <CTAButton active={false} linkto={randomPath !== "catalog/undefined"? randomPath : "/login"}>
                Learn More
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 ">
          {/* Job that is in Demand - Section 1 */}
          <div className="mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0">
            <div className="text-4xl font-semibold lg:w-[45%] ">
              Get the skills you need for a
              <HighlightText text={"job that is in demand."} />
            </div>
            <div className="flex flex-col items-start gap-10 lg:w-[40%]">
              <div className="text-[16px]">
                The modern StudyCraze dictates its own terms. To be a
                competitive specialist today, it requires more than just
                professional skills
              </div>
              <CTAButton active={true} linkto={randomPath !== "catalog/undefined"? randomPath : "/signup"}>
                <div className="">Learn More</div>
              </CTAButton>
            </div>
          </div>

          <TimeLineSection />

          <LearningLanguageSection  />
        </div>
      </div>

      {/* Section 3 */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        <InstructorSection />

        <h2 className="text-center text-4xl font-semibold mt-8">
          Reviews from Other Learners
        </h2>
        {/* Review slider here */}
        <ReviewSlider/>
      </div>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;
