import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SearchBar = ({ open, setOpen }) => {
  const ref = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const AllCategories = useSelector((state) => state.viewCourse.categories);

  useOnClickOutside(ref, () => {setOpen(false); setShow(false); setSearchTerm("")});

  const handleSubmit = (e) => {
    e.preventDefault();
    if(open === false || searchTerm === ""){
        return
    }
    navigate(`/catalog/${searchTerm.split(" ").join("-").toLowerCase()}`)
    setShow(false);
  };

  useEffect(() => {
    setLoading(true);

    let Categories = AllCategories;

    if (Categories && Categories.length) {
        let validCategories = Categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setCategories(validCategories);
    }

    setLoading(false);
    // eslint-disable-next-line
}, [searchTerm]);


  return (
    <div className="relative" ref={ref}>
      <form
        onSubmit={handleSubmit}
        className={`flex rounded-full shadow-lg ${
          open ? "bg-richblack-5 " : "w-0"
        }`}
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setShow(true)}}
          className={`px-2 rounded-l-full focus:outline-none ${
            open
              ? "transition-all duration-300 ease-in-out w-[5.5rem] bg-richblack-5"
              : "w-0 invisible"
          } h-[1.9rem]`}
          onClick={()=>setShow(true)}
        />
        <button
          type="submit"
          className={`px-2 ${
            open
              ? "bg-richblack-5 hover:bg-richblack-25"
              : "-translate-x-12 text-richblack-5 hover:text-richblack-50"
          } font-bold rounded-full`}
          onClick={() => setOpen(true)}
        >
          <FaSearch className="text-[1.2rem]" />
        </button>
        
      </form>

      {
            searchTerm && open && show &&
            <div className="absolute left-[50%] top-[30%] z-[1000] flex w-[200px] translate-x-[-70%] translate-y-[2em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 transition-all duration-150 lg:w-[300px]">
                {/* <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div> */}
                {loading ? (
                <p className="invert flex justify-center scale-75"><span className="spinner"></span></p>
                ) : categories && categories.length ? (
                <div className="max-h-[80vh] overflow-auto">
                    {categories
                    // ?.filter((subLink) => subLink?.courses?.length > 0)
                    ?.sort((a, b) => {
                      return a.name.localeCompare(b.name);
                    })
                    ?.map((subLink, i) => {
                        let subLinkRoute = `/catalog/${subLink.name
                        .split(" ")
                        .join("-")
                        .toLowerCase()}`;
                        return (
                        <Link
                            to={subLinkRoute}
                            className={`rounded-lg w-full block py-4 pl-4 ${
                            //   matchRoute(`${subLinkRoute}`)
                                // ? "bg-richblack-100 hover:bg-richblack-200" :
                                " bg-transparent hover:bg-richblack-50"
                            } active:hover:bg-richblack-300`}
                            key={i}
                        >
                            {subLink.name}
                        </Link>
                        );
                    })}
                </div>
                ) : (
                <p className="text-center">No Results</p>
                )}
            </div>
        }
    </div>
  );
};

export default SearchBar;
