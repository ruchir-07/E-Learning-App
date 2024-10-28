import { toast } from "react-hot-toast"

import { setUser } from "../../redux/slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { settingsEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
  REMOVE_PROFILE_PICTURE_API
} = settingsEndpoints

export function updateDisplayPicture(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      )
      // console.log("UPDATE_DISPLAY_PICTURE_API API RESPONSE............",response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Picture Updated Successfully")
      dispatch(setUser(response.data.data));

      if (document.cookie.includes('user')) {
        document.cookie = `user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`; // Delete the existing cookie
        document.cookie = `user=${JSON.stringify(response.data.data)}; path=/;`;
      }

      localStorage.setItem('user',  JSON.stringify(response.data.data));

    } catch (error) {
      // console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
      toast.error("Could Not Update Profile Picture")
    }
    toast.dismiss(toastId)
  }
}

export function removeProfilePicture(token) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector(
        "DELETE",
        REMOVE_PROFILE_PICTURE_API, null,
        {
          Authorization: `Bearer ${token}`,
        }
      )
      // console.log("REMOVE_PROFILE_PICTURE API RESPONSE............",response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Picture Removed Successfully")
      // console.log(response.data.user)
      dispatch(setUser(response.data.user));

      if (document.cookie.includes('user')) {
        document.cookie = `user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`; // Delete the existing cookie
        document.cookie = `user=${JSON.stringify(response.data.user)}; path=/;`;
      }

      localStorage.setItem('user',  JSON.stringify(response.data.user));

    } catch (error) {
      // console.log("REMOVE_PROFILE_PICTURE API ERROR............", error)
      toast.error("Could Not Remove Profile Picture")
    }
    toast.dismiss(toastId)
  }
}

export function updateProfile(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })
      // console.log("UPDATE_PROFILE_API API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      dispatch(
        setUser({ ...response.data.user })
      )
      
      if (document.cookie.includes('user')) {
        document.cookie = `user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`; // Delete the existing cookie
        document.cookie = `user=${JSON.stringify(response.data.user)}; path=/;`;
      }

      localStorage.setItem('user',  JSON.stringify(response.data.user));

      toast.success("Profile Updated Successfully")
    } catch (error) {
      // console.log("UPDATE_PROFILE_API API ERROR............", error)
      toast.error("Could Not Update Profile")
    }
    toast.dismiss(toastId)
  }
}

export async function changePassword(token, formData) {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
      Authorization: `Bearer ${token}`,
    })
    // console.log("CHANGE_PASSWORD_API API RESPONSE............", response);

    
    const message = response.data.message;
    if(message === "Current Password is Wrong, Try again"){
        toast.error(message);
        toast.dismiss(toastId);
        return false;
    }

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Password Changed Successfully")
    toast.dismiss(toastId);
    return true;
  } catch (error) {
    // console.log("CHANGE_PASSWORD_API API ERROR............", error)
    toast.error('Error in updating password')
    toast.dismiss(toastId)
    return false;
  }
}

export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })
      // console.log("DELETE_PROFILE_API API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Deleted Successfully")
      dispatch(logout(navigate))
    } catch (error) {
      // console.log("DELETE_PROFILE_API API ERROR............", error)
      toast.error("Could Not Delete Profile")
    }
    toast.dismiss(toastId)
  }
}