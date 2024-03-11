import React, { useState, Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useFormik } from "formik";
import { Toaster, toast } from "sonner";
import { ClipLoader } from "react-spinners";

const Header = () => {
  var AssembleToken = localStorage.getItem("AssembleToken");
  const config = {
    headers: { Authorization: `Bearer ${AssembleToken}` },
  };
  const [loading, setLoading] = useState(false);
  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [adminChangePassword, setAdminChangePassword] = useState(false);
  const [passwordChangeId, setPasswordChangeId] = useState("");
  const [adminChangePassLoader, setAdminChangePassLoader] = useState(false);
  const [addUserLoader, setAddUserLoader] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoading(true);
    toast.success("Logout Successfully");

    setTimeout(() => {
      localStorage.removeItem("AssembleToken");
      localStorage.removeItem("tokenExpiry");
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  useEffect(() => {
    axios.get(`${window.$BackEndURL}/api/users/get-all-users`).then((res) => {
      console.log(res?.data);
      setAllUsers(res?.data);
    });
  }, []);

  const AddUser = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      setAddUserLoader(true);
      const json = {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        password: values.password,
      };
      try {
        axios
          .post(`${window.$BackEndURL}/api/users/add`, json, config)
          .then((res) => {
            console.log(res?.data);
            toast.success(res.data.message);
            setAllUsers((prevUsers) => [...prevUsers, res?.data?.user]);
            setAddUserLoader(false);
            AddUser.resetForm();
            // setOpenSettingModal(false)
          });
      } catch (error) {
        console.log(error);
      }
    },
  });

  const AdminChangePass = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
    },
    onSubmit: (values) => {
      setAdminChangePassLoader(true)
      const json = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      console.log(json);
      try {
        axios
          .post(
            `${window.$BackEndURL}/api/users/update-password/${passwordChangeId}`,
            json,
            config
          )
          .then((res) => {
            console.log(res?.data);
            toast.success(res.data.message);
            setAdminChangePassLoader(false)
            AdminChangePass.resetForm();
            setAdminChangePassword(false);
          });
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleDeleteUserByAdmin = (id) => {
    try {
      axios
        .delete(`${window.$BackEndURL}/api/users/delete/${id}`, config)
        .then((res) => {
          console.log(res?.data);
          toast.success(res?.data?.message);
          const updatedUsers = allUsers?.filter(
            (user) => user._id !== res?.data?.deletedUser?._id
          );
          setAllUsers(updatedUsers);
        });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Toaster richColors />
      <div className="w-full flex items-center justify-between bg-[#F7F7F7] py-6 sm:px-10 px-3">
        <div>
          <button
            className="bg-gray-200 font-semibold px-5 py-1 rounded-full text-sm"
            onClick={() => setOpenSettingModal(true)}
          >
            Settings
          </button>
        </div>

        <div>
          <span className="text-base font-semibold">assemble</span>
        </div>
        <div className="">
          <button
            className="bg-gray-200 font-semibold px-5 py-1 rounded-full text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      {loading && <Loader />}

      <Transition.Root show={openSettingModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={setOpenSettingModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                  <div className="flex flex-col ">
                    <h2 className="text-gray-900 text-center text-lg">
                      Settings
                    </h2>
                    <span class="horizontal-line rounded-full bg-yellow-300"></span>
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pl-1 font-medium">Existing Users</h2>
                      {allUsers?.map((user) => (
                        <div className="bg-[#E9E6DD] rounded-md w-full h-12 flex items-center px-4 my-3 justify-between ">
                          <div className="flex items-center gap-x-4 text-sm">
                            <span>
                              {user?.firstname + " " + user?.lastname}
                            </span>
                            <span>{user?.role}</span>
                          </div>
                          {user?.role === "Admin" ? (
                            <button
                              className="bg-white rounded-full px-5 py-1 font-medium"
                              onClick={() => {
                                setAdminChangePassword(true);
                                setOpenSettingModal(false);
                                setPasswordChangeId(user?._id);
                              }}
                            >
                              Change Password
                            </button>
                          ) : (
                            <div>
                              <button className="bg-white rounded-full px-5 py-1 font-medium">
                                Change Password
                              </button>
                              <button
                                className="text-red-500 rounded-full px-5 py-1 font-medium"
                                onClick={() =>
                                  handleDeleteUserByAdmin(user?._id)
                                }
                              >
                                DELETE
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <form onSubmit={AddUser.handleSubmit} className="w-full">
                        <div className="mt-4 flex flex-col items-start justify-center w-full px-2">
                          <h2 className="font-medium mb-5">Add New User</h2>
                          <div class="grid gap-6 mb-4 md:grid-cols-2 w-full">
                            <div>
                              <label
                                for="firstname"
                                class="block mb-2 text-sm font-medium text-gray-900 "
                              >
                                First name
                              </label>
                              <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                value={AddUser.values.firstname}
                                onChange={AddUser.handleChange}
                                class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                required
                              />
                            </div>
                            <div>
                              <label
                                for="lastname"
                                class="block mb-2 text-sm font-medium text-gray-900 "
                              >
                                Last name
                              </label>
                              <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                value={AddUser.values.lastname}
                                onChange={AddUser.handleChange}
                                class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                required
                              />
                            </div>
                          </div>
                          <div class="grid gap-6 mb-4 md:grid-cols-2 w-full">
                            <div>
                              <label
                                for="email"
                                class="block mb-2 text-sm font-medium text-gray-900 "
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={AddUser.values.email}
                                onChange={AddUser.handleChange}
                                class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                required
                              />
                            </div>
                            <div>
                              <label
                                for="password"
                                class="block mb-2 text-sm font-medium text-gray-900 "
                              >
                                Password
                              </label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                value={AddUser.values.password}
                                onChange={AddUser.handleChange}
                                class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                required
                              />
                            </div>
                          </div>
                          <div>
                          {addUserLoader ? (
                              <button
                              className="bg-black text-white font-medium px-10 py-3 rounded-full flex items-center justify-center"
                              >
                                <ClipLoader color="#d2d2d2" size={25} />
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="bg-black text-white font-medium px-7 py-3 rounded-full"
                              >
                                Save
                              </button>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={adminChangePassword} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={setAdminChangePassword}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                  <div className="flex flex-col ">
                    <h2 className="text-gray-900 text-center text-lg">
                      Change Password
                    </h2>
                    <span class="horizontal-line rounded-full bg-yellow-300"></span>
                    <div className="flex flex-col items-start justify-center">
                      <form
                        onSubmit={AdminChangePass.handleSubmit}
                        className="w-full"
                      >
                        <div className="mt-4 flex flex-col items-start justify-center w-full px-2">
                          <h2 className="font-medium mb-5">Update Password</h2>
                          <div class="grid gap-6 mb-4 md:grid-cols-1 w-full">
                            <div>
                              <label
                                for="currentPassword"
                                class="block mb-2 text-sm font-medium text-gray-900 "
                              >
                                Current Password
                              </label>
                              <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={AdminChangePass.values.currentPassword}
                                onChange={AdminChangePass.handleChange}
                                class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                required
                              />
                            </div>
                            <div>
                              <label
                                for="newPassword"
                                class="block mb-2 text-sm font-medium text-gray-900 "
                              >
                                New Password
                              </label>
                              <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={AdminChangePass.values.newPassword}
                                onChange={AdminChangePass.handleChange}
                                class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                required
                              />
                            </div>
                          </div>
                          <div>
                            {adminChangePassLoader ? (
                              <button
                              className="bg-black text-white font-medium px-10 py-3 rounded-full flex items-center justify-center"
                              >
                                <ClipLoader color="#d2d2d2" size={25} />
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="bg-black text-white font-medium px-7 py-3 rounded-full"
                              >
                                Save
                              </button>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default Header;
