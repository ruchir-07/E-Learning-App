import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import * as Icons from "react-icons/vsc"
import { sidebarLinks } from "../../../data/dashboard-links"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"

export default function ProfileDropdown() {
  const { user } = useSelector((state) => state.profile)
  // if(user?.image) {console.log(user.image);}

  const [confirmationModal, setConfirmationModal] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false))

  if (!user) return null

  return (
    <>
      <button className="relative" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-1">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[30px] rounded-full object-cover"
          />
          <AiOutlineCaretDown className="text-sm text-richblack-100" />
        </div>
        {open && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-[118%] right-0 z-[1000] divide-y-[1px] divide-richblack-700 w-fit rounded-md border-[1px] border-richblack-700 bg-richblack-800 "
            ref={ref}
          >
          {  
            sidebarLinks.map((link)=>{
            const Icon = Icons[link.icon]
              return (link.type === user.accountType || !link.type) && <Link to={`${link.path}`} onClick={() => setOpen(false)} key={link.id}>
                <div className="flex min-w-max items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
                  <Icon className="text-lg" />
                  {link.name}
                </div>
              </Link>
            })
          }
          <Link to="/dashboard/settings" onClick={() => setOpen(false)}>
                <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
                  <Icons.VscSettingsGear className="text-lg" />
                  Settings
                </div>
              </Link>

            <div
              onClick={() => {
                setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
                setOpen(false)
              }}
              className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"
            >
              <VscSignOut className="text-lg" />
              Logout
            </div>
          </div>
        )}
      </button>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal}/>}
      </>
  )
}