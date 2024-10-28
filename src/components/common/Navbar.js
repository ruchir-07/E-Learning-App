import { useEffect, useState } from "react"
import { AiOutlineShoppingCart } from "react-icons/ai"
import { FaChevronDown } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"
import { fetchCourseCategories } from "../../services/operations/CourseDetailsAPI"
import {setCategories} from "../../redux/slices/viewCourseSlice"
import MenuSlider from "./MenuSlider"
;
import { RiLoginBoxLine } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";
import SearchBar from "./SearchBar"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const { categories } = useSelector((state) => state.viewCourse)
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  // const [Categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      const Allcategory = await fetchCourseCategories()
      // console.log("categories", Allcategory)
      if (Allcategory?.length > 0) { 
        dispatch(setCategories(Allcategory));
      }
      setLoading(false)
    }
    getCategories();
    // eslint-disable-next-line
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }


  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 
      ${false && location.pathname !== "/" ? "bg-richblack-800" : "" /* This statement will be activated if false is removed from it */}
       transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        <MenuSlider/>
        {/* Logo */}
        <Link to="/" className={`${open ? "hidden  md:block": ""} ${user ? "" : "xs:ml-10"} lg:ml-0`}>
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation links */}
        <nav className={`hidden lg:block ${user ? "ml-8" : "ml-28"}`}>
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <FaChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : (categories && categories.length) ? (
                          <>
                            {categories
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0)
                              ?.sort((a, b) => {
                                return a.name.localeCompare(b.name);
                              })
                              ?.map((subLink, i) => {
                                let subLinkRoute =  `/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`
                                return (
                                  <Link
                                    to={subLinkRoute}
                                    className={`rounded-lg py-4 pl-4 ${matchRoute(`${subLinkRoute}`) ? "bg-richblack-100 hover:bg-richblack-200" : " bg-transparent hover:bg-richblack-50"} active:hover:bg-richblack-300`}
                                    key={i}
                                  >
                                    <p>{subLink.name}</p>
                                  </Link>
                                )
                              })
                            }
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={`flex gap-x-5 items-center justify-end ${user ? "lg:w-48" :  "lg:w-80" }`}>

          {/* search bar */}
          <SearchBar open={open} setOpen={setOpen}/>

          {/* Login / Signup / Dashboard*/}
          <div className={`gap-x-4 flex ${!user && "lg:w-44"} lg:justify-center lg:items-center bg-none`}>
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token === null && (
              <div>
                <Link to="/login">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 hidden lg:inline">
                    Log in
                  </button>
                  <button className="rounded-[8px] text-xl border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 lg:hidden">
                    <RiLoginBoxLine />
                  </button>
                </Link>
              </div>
            )}
            {token === null && (
              <div className="xs:block hidden">
                <Link to="/signup">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 hidden lg:inline">
                    Sign up
                  </button>
                  <button className="rounded-[8px] border text-xl border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 lg:hidden">
                    <IoMdPersonAdd />
                  </button>
                </Link>
              </div>
            )}
            {token !== null && <ProfileDropdown />}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Navbar