import axios from "axios";
import { useFormik } from "formik";
import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Loader from "../components/Loader";

const Login = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  const Login = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      setLoader(true)
      const json = {
        email: values.email,
        password: values.password,
      };
      try {
        axios
          .post(`${window.$BackEndURL}/api/users/login`, json)
          .then((response) => {
            console.log(response?.data);
            toast.success("Login Successfully");
            setTimeout(() => {
             
              localStorage.setItem(
                "AssembleToken",
                response?.data?.accessToken
                );
                localStorage.setItem("tokenExpiry", response?.data?.expiresIn);
                navigate("/events");
                setLoader(false);
              }, 2000);
          }).catch((error) => {
            toast.error("Invalid Email And Password")
            
          }).finally(()=>{
            setLoader(false);
          });
      } catch (error) {
        toast.error("Login Failed");
        console.log(error);
      }
    },
  });
  return (
    <>
<div className="min-h-screen mx-auto flex flex-col items-center justify-center relative p-4 sm:p-8 b-image">
                

                <div className="absolute top-4 flex items-center justify-center w-full">
                  <h2 className="text-2xl font-semibold">assemble</h2>
                </div>
                <form
                  onSubmit={Login.handleSubmit}
                  className="w-full max-w-lg mt-4 relative flex flex-col items-center"
                >
                  <div className="bg-white rounded-3xl sm:pb-6 pb-8 pt-10 sm:pt-8 px-8 w-full">
                    <div className="mb-5">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={Login.values.email}
                        onChange={Login.handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={Login.values.password}
                        onChange={Login.handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                      />
                    </div>
    
                    <div className="flex items-center justify-center mt-4">
                     
                        <button
                          type="submit"
                          className="bg-gray-900 text-white w-full sm:w-44 h-11 rounded-full text-sm items-center flex justify-center"
                        >
                          LOGIN
                        </button>
                     
                    </div>
                  </div>
                  <div className="absolute -top-5 bg-white border shadow-sm rounded-full w-60 sm:w-80 h-11 flex items-center justify-center">
                    <h2 className="text-base font-medium">Login</h2>
                  </div>
                </form>
              </div> 
     
          <Toaster richColors />
          {loader && <Loader />}
        </>

  );
};

export default Login;
