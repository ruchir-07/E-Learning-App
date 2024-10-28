import React, { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineMenu } from "react-icons/ai";
import logo from "../../assets/Logo/Logo-Full-Light.png";
import { RxCross1 } from "react-icons/rx";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { FaChevronDown } from "react-icons/fa";
import { useSelector } from "react-redux";

const MenuSlider = () => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const categories = useSelector((state) => state.viewCourse);
  // console.log(categories)

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className="mr-4 lg:hidden text-white">
      <AiOutlineMenu
        fontSize={24}
        fill="#AFB2BF"
        onClick={() => setOpen(!open)}
      />
      <div
        id="slider"
        className={`absolute inset-0 backdrop-blur-2xl shadow-black shadow-2xl w-80 h-full text-[#b8b8b8] transition-all ease-in-out lg:hidden overflow-y-scroll z-[1000] ${
          open ? "translate-x-0" : "-translate-x-80"
        }`}
        ref={ref}
      >
        <div className="flex h-[3.8rem] items-center justify-between">
          <div className="flex text-base font-orbitron text-white items-center pl-4">
            <img src={logo} width="150" alt="Logo" />
          </div>
          <div className="p-4">
            <RxCross1 onClick={() => setOpen(false)} />
          </div>
        </div>

        <NavLink to="/" onClick={() => setOpen(false)}>
          <div className="p-3.5 flex items-center active:bg-richblack-500">
            Home
          </div>
        </NavLink>
        <div
          className="flex items-center justify-between active:bg-richblack-500"
          onClick={() => setCatalogOpen(!catalogOpen)}
        >
          <div className="p-3.5">Catalog</div>{" "}
          <FaChevronDown
            className={`${
              catalogOpen && "rotate-180"
            } transition-all ease-in-out mr-6`}
          />
        </div>
        <div>
          {!categories ? (
            <p className="text-center">Loading...</p>
          ) : categories?.categories && categories?.categories?.length ? (
            <div className={`h-0 transition-all ease-in-out ${catalogOpen && "h-fit"}`}>
              {categories?.categories
                ?.filter((subLink) => subLink?.courses?.length > 0)
                ?.sort((a, b) => {
                  return a.name.localeCompare(b.name);
                })
                ?.map((subLink, i) => {
                  let subLinkRoute = `/catalog/${subLink.name
                    .split(" ")
                    .join("-")
                    .toLowerCase()
                  }`;
                  return (
                    <NavLink
                      to={subLinkRoute}
                      className={`p-3.5 ml-8 flex items-center active:bg-richblack-500 h-[100%] ${!catalogOpen ? "text-[0px]" : "transition-all ease-in-out duration-300"}`}
                      onClick={() => setOpen(false)}
                      key={i}
                    >
                      <p>{subLink.name}</p>
                    </NavLink>
                  );
                })}
            </div>
          ) : (
            <p className="text-center">No Courses Found</p>
          )}
        </div>
        <NavLink to="/about" onClick={() => setOpen(false)}>
          <div className="p-3.5 flex items-center active:bg-richblack-500">
            About
          </div>
        </NavLink>
        <NavLink to="/contact" onClick={() => setOpen(false)}>
          <div className="p-3.5 flex items-center active:bg-richblack-500">
            Contact
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default MenuSlider;
