import frameImg from "../../../assets/Images/frame.png";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function Template({ title, description1, description2, image, formType }) {

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center lg:items-start justify-around gap-y-12 py-12 lg:flex-row lg:gap-y-0 lg:gap-x-12">
          <div className="mx-auto w-11/12 max-w-[450px] md:mx-0">
            <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
              {title}
            </h1>
            <div className="mt-4 text-[1.125rem] leading-[1.625rem]">
              <p className="text-richblack-100">{description1}</p>{" "}
              <p className="font-edu-sa font-bold italic text-blue-100">
                {description2}
              </p>
            </div>
            {formType === "signup" ? <SignupForm /> : <LoginForm />}

          </div>
          <div className="flex lg:translate-y-16 justify-end lg:justify-start">
            <div className="relative mx-auto w-11/12 max-w-[450px] md:mx-0">
                <img
                src={frameImg}
                alt="Pattern"
                width={558}
                height={504}
                loading="lazy"
                />
                <img
                src={image}
                alt="Students"
                width={558}
                height={504}
                loading="lazy"
                className="absolute -top-4 right-4 z-10"
                />
            </div>
          </div>
        </div>
      {/* )} */}
    </div>
  );
}

export default Template;
