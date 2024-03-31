import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

const Protected = ({ children }) => {
  const navigate = useNavigate()
  useEffect(() => {

    if (!localStorage.AssembleToken) {
      navigate("/")
    }
    else if (localStorage.AssembleToken) {
      navigate("/events")
    }
  }, [])

  return children




}

export default Protected