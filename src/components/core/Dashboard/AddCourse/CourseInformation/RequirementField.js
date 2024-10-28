import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions)
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setValue(name, requirementsList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirementsList])

  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementsList([...requirementsList, requirement])
      setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          placeholder="Enter an instruction and click on Add"
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
      </div>
      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc w-full max-w-[62rem] xl:max-w-[33rem] overflow-auto">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              <span>{requirement}</span>
              <button
                type="button"
                className="ml-2 text-xs text-pure-greys-300 "
                onClick={() => handleRemoveRequirement(index)}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
      <div className="flex gap-x-8">
          <button
            type="button"
            onClick={handleAddRequirement}
            className="font-semibold text-yellow-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={()=>{setRequirement("")}}
            className="font-semibold text-yellow-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={()=>{setRequirementsList([])}}
            className="font-semibold text-yellow-50"
          >
            Clear All
          </button>
        </div>
    </div>
  )
}