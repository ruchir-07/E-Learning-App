import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { MdDelete } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import { removeProfilePicture, updateDisplayPicture } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/Iconbtn"
import toast from "react-hot-toast"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [isDisabled, setIsDisabled] = useState(true);
  const [whatClicked, setWhatClicked] = useState(null);
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null);

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e?.target?.files[0]

    const supportedTypes = ['jpg', 'jpeg', 'png'];
    const fileType = file?.name?.split('.')[1]?.toLowerCase();
    //if file formated is not supported
    if(!supportedTypes.includes(fileType)){
        toast.error('File type not supported');
        return ;
    }

    // console.log(file)
    if (file) {
      setImageFile(file)
      previewFile(file)
      setIsDisabled(false);
    }
  }
  
  const handleCancel = () => {
    setImageFile(null);
    setPreviewSource(null);
    setIsDisabled(true);

    // Reset the file input element's value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = () => {
    if(isDisabled){
        toast.error('Select a file first');
        return ;
    }

    try {
      // console.log("uploading...")
      setWhatClicked('Upload');
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)
      // console.log("formdata", formData)
      dispatch(updateDisplayPicture(token, formData)).then(() => {
        setImageFile(null);
        setWhatClicked(null);
        setLoading(false)
        setPreviewSource(null)
        setIsDisabled(true);
        // Reset the file input element's value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })

    } catch (error) {
      // console.log("ERROR MESSAGE - ", error.message)
      toast.error("Error updating profile picture")
    }
  }

  const handleFileRemove = async()=>{
    try{
        setLoading(true)
        setWhatClicked('Remove')
        await dispatch(removeProfilePicture(token));
        setPreviewSource(null)
        setLoading(false)
        setWhatClicked(null);
        setImageFile(null)
        setIsDisabled(true);
        // Reset the file input element's value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    }
    catch(error){
        // console.log("ERROR MESSAGE - ", error.message)
        toast.error('Error removing profile picture')
    }
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])
  return (
    <>
      <div className="flex items-center justify-center lg:justify-between rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12 text-richblack-5">
        <div className="flex flex-col lg:flex-row items-center gap-x-4">
          <img
            src={previewSource || user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-2 text-center lg:text-start">
            <p>Change Profile Picture</p>
            <div className="flex flex-row flex-wrap justify-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/gif, image/jpeg"
              />
              {
                !imageFile ? ( <button
                        onClick={handleClick}
                        disabled={loading}
                        className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
                    >
                        Select
                    </button>
                ) : ( 
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
                    >
                        Cancel
                    </button>
                )
              }
              <IconBtn
                text={(loading && whatClicked === "Upload") ? "Uploading..." : "Upload"}
                onclick={handleFileUpload}
                disabled={loading}
              >
                {!(loading && whatClicked === "Upload") && (
                  <FiUpload className="text-lg text-richblack-900" />
                )}
              </IconBtn>
              <IconBtn
                text={(loading && whatClicked === "Remove") ? "Removing..." : "Remove"}
                onclick={handleFileRemove}
                disabled={loading}
                customClasses={"!bg-pink-100"}
              >
                {!(loading && whatClicked === "Remove") && (
                  <MdDelete className="text-lg text-richblack-900"/>
                )}
              </IconBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}