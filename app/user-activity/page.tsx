"use client";
import Image from "next/image";
import { FormEvent, useContext, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaGreaterThan } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { getToken } from "firebase/app-check";
import AxiosProvider from "../../provider/AxiosProvider";
import StorageManager from "../../provider/StorageManager";
import LeftSideBar from "../component/LeftSideBar";
import { useRouter, useSearchParams } from "next/navigation";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import { number, setLocale } from "yup";
import { RiFilterFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { RiAccountCircleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Select from "react-select";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaRegIdCard, FaUserEdit, FaUserTag } from "react-icons/fa";
import { MdDateRange, MdViewModule } from "react-icons/md";
import CustomSelect from "../component/CustomSelect";

const axiosProvider = new AxiosProvider();

interface FilterData {
  uuId?: string;
  module?: string;
  type?: string;
}

interface UserActivity {
  id: number;
  uuid: string;
  user_activity: string;
  activity_timestamp: string; // ISO string
  module: string;
  type: string;
  user: {
    id: string;
    name: string;
  };
}

interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
interface Option {
  value: string;
  label: string;
}
interface OptionType {
  value: string;
  label: string;
}

const moduleOptions: OptionType[] = [
  { value: "document_management", label: "Document Management" },
  { value: "authentication", label: "Authentication" },
  { value: "activity_management", label: "Activity Management" },
  { value: "user_management", label: "User Management" },
  { value: "leads", label: "Leads" },
  { value: "task_management", label: "Task Management" },
];

const typeOptions: OptionType[] = [
  { value: "update", label: "Update" },
  { value: "create", label: "Create" },
  { value: "login", label: "Login" },
  { value: "delete", label: "Delete" },
  { value: "block", label: "Block" },
  { value: "unblock", label: "Unblock" },
];

export default function Home() {
  const checking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const [data, setData] = useState<UserActivity[]>([]);
  console.log("user activity dara", data);
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [pageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [filterPage, setFilterPage] = useState<number>(1);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFilterPages, setTotalFilterPages] = useState<number>(1);
  const [filterData, setFilterData] = useState<FilterData[]>([]);
  console.log("+++++++++++++++", filterData);

  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [clearFilter, setIsClearFilter] = useState<boolean>(false);
  const [hitApi, setHitApi] = useState<boolean>(false);
  const storage = new StorageManager();
  const userId = storage.getUserId();

  const router = useRouter();

  // Assuming `dataUserName` is an array of users
  const userOptions = agentList.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  const fetchAgent = async () => {
    try {
      const res = await AxiosProvider.get("/allagents");
      // adjust this if your payload differs
      const result = res.data?.data?.data ?? [];
      setAgentList(result);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      setAgentList([]);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);

  const toggleFlyout = () => setFlyoutOpen(!isFlyoutOpen);
  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);

  useEffect(() => {
    const fetchData = async () => {
      setIsFilter(false);
      setIsLoading(true);
      try {
        const response = await AxiosProvider.get(
          `/user-activity?page=${page}&pageSize=${pageSize}`
        );

        const result = response.data.data.data;
        console.log("888888888888888888", response);
        setData(result);
        setTotalPages(response.data.data.pagination.totalPages);
        setIsError(false);
      } catch (error: any) {
        setIsError(true);
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, hitApi]); // 👈 depends on `page`

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageChangeFilter = (newPage: number) => {
    if (newPage > 0 && newPage <= totalFilterPages) {
      setFilterPage(newPage);
    }
  };
  const clickedFilterClear = () => {
    setIsClearFilter(false);
    setHitApi(!hitApi);
  };

  // useEffect to trigger when filterPage changes
  useEffect(() => {
    // Check if filterData is empty
    if (filterData.length === 0) {
      return; // Don't do anything if filterData is empty
    }

    // Call API only when filterPage changes
    const fetchData = async () => {
      try {
        // Send the filterData (first object) and filterPage for pagination
        const response = await AxiosProvider.post(
          `/user-activity/filter?page=${filterPage}`,
          filterData[0] // Send the first object from filterData
        );

        console.log("Response Data:", response);

        // Handle the response data here
        setData(response.data.data.data); // Update data with API response
        setTotalFilterPages(response.data.data.pagination.totalPages); // Update total pages
      } catch (error) {
        console.error("Error while filtering:", error);
        toast.error("Error while fetching filtered data");
      }
    };

    fetchData(); // Call the async fetchData function when filterPage changes
  }, [filterPage]); // Only depend on filterPage

  const filterApiCall = async (values: {
    uuId: string;
    module: string;
    type: string;
  }) => {
    if (!values.uuId && !values.module && !values.type) {
      toast.error("At least one field is required!");
      return; // Prevent the function from running further
    }
    try {
      const response = await AxiosProvider.post(
        `/user-activity/filter?page=${filterPage}`,
        values
      );

      console.log("Response Dataaaaaaaaaaaaaaaaaaaaaaa:", response);
      setData(response.data.data.data);
      setIsFilter(true);
      setIsClearFilter(true);
      setTotalFilterPages(response.data.data.pagination.totalPages);
      setFlyoutFilterOpen(!isFlyoutFilterOpen);
    } catch (error) {
      console.error("Error while filtering:", error);
      toast.error("Error while fetching filtered data");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center">
        <Image
          src="/images/compressIcon.svg"
          alt="Table image"
          width={500}
          height={500}
          style={{ width: "150px", height: "auto" }}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  if (checking) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
        <Image
          src="/images/compressIcon.svg"
          alt="Loading"
          width={150}
          height={150}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  return (
    <>
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <LeftSideBar />
        <div className="ml-[97px] w-full md:w-[90%] m-auto  min-h-[500px]  rounded p-4 mt-0 ">
          {/* left section top row */}
          <DesktopHeader />

          {/* Main content middle section */}
          <div className="rounded-3xl   px-1 py-6 md:p-6 relative bg-white shadow-lastTransaction">
            {/* ----------------Table----------------------- */}
            <div className="relative overflow-x-auto  sm:rounded-lg">
              {/* Search and filter table row */}
              <div className=" flex justify-end items-center mb-6  w-full mx-auto">
                <div className=" flex justify-center items-center gap-4">
                  <div
                    className=" flex items-center gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 group hover:bg-primary-700"
                    onClick={toggleFilterFlyout}
                  >
                    <FiFilter className=" w-4 h-4 text-white group-hover:text-white" />
                    <p className=" text-white  text-base font-medium group-hover:text-white">
                      Filter
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-x-auto sm:rounded">
                {clearFilter && (
                  <button
                    type="button"
                    onClick={() => clickedFilterClear()}
                    className="flex items-center gap-2 text-primary-600 text-sm font-medium transition-colors p-1 border border-primary-500 rounded overflow-hidden mb-3"
                  >
                    <span>Clear Filter</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <table className="w-full text-sm text-left rtl:text-right text-secondBlack">
                  <thead className="text-xs ">
                    <tr className=" ">
                      <th scope="col" className="p-3  ">
                        <div className="flex items-center gap-2">
                          <RxAvatar className="w-6 h-6 text-[#D1D5DB]" />
                          <div className="font-medium  text-base leading-normal">
                            Name and User Activity
                          </div>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-0   hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <FaUserEdit className="w-6 h-6 text-[#D1D5DB]" />
                          <div className="font-medium  text-base leading-normal">
                            User&apos;s Name
                          </div>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-0   hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-2">
                          <FaRegIdCard className="w-6 h-6 text-[#D1D5DB]" />
                          <div className="font-medium  text-base leading-normal">
                            User&apos;s uuid
                          </div>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-0   hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-2">
                          <MdDateRange className="w-6 h-6 text-[#D1D5DB]" />
                          <div className="font-medium  text-base leading-normal">
                            Date
                          </div>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-0   hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-2">
                          <MdViewModule className="w-6 h-6 text-[#D1D5DB]" />
                          <div className="font-medium  text-base leading-normal">
                            Module
                          </div>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-0   hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-2">
                          <FaUserTag className="w-6 h-6 text-[#D1D5DB]" />
                          <div className="font-medium text-base leading-normal">
                            Type
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {!data || data.length === 0 || isError ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center text-xl mt-5 py-6 text-white"
                        >
                          <div className="mt-2">Data not found</div>
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr
                          key={index}
                          className="   hover:bg-primary-100 border-b border-[#E7E7E7] odd:bg-primary-50"
                        >
                          <td className="px-2 py-2  ">
                            <div className="flex">
                              <div className="md:hidden flex mr-1">
                                <FaEllipsisVertical
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-html={`<div>
                      <strong>Name and User Activity:</strong> <span style="text-transform: capitalize;">${
                        item.user_activity
                      }</span><br/>
                      <strong>User's Name:</strong> ${
                        item.user?.name ?? ""
                      }<br/>
                      <strong>User's uuid:</strong> ${item.uuid}<br/>
                      <strong>Date:</strong> ${item.activity_timestamp}<br/>
                      <strong>Module:</strong> ${item.module}<br/>
                      <strong>Type:</strong> ${item.type}<br/>
                    </div>`}
                                  className="text-white leading-normal capitalize relative top-1"
                                />
                                <Tooltip id="my-tooltip" place="right" float />
                              </div>
                              <div>
                                <p className="text-secondBlack text-base leading-normal capitalize">
                                  {item.user?.id} {item.user_activity}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-2 py-2   hidden sm:table-cell">
                            <p className="text-secondBlack text-base leading-normal capitalize">
                              {item.user?.name}
                            </p>
                          </td>

                          <td className="px-2 py-2   hidden sm:table-cell">
                            <p className="text-secondBlack text-base leading-normal">
                              {item.user.id}
                            </p>
                          </td>

                          <td className="px-2 py-2   hidden sm:table-cell">
                            <p className="text-secondBlack text-base leading-normal">
                              {item.activity_timestamp}
                            </p>
                          </td>

                          <td className="px-2 py-2   hidden sm:table-cell">
                            <p className="text-secondBlack text-base leading-normal capitalize">
                              {item.module}
                            </p>
                          </td>

                          <td className="px-2 py-2   hidden sm:table-cell">
                            <p className="text-secondBlack text-base leading-normal capitalize">
                              {item.type}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* ----------------End table--------------------------- */}
          {/* Pagination Controls */}
          {isFilter ? (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handlePageChangeFilter(filterPage - 1)}
                disabled={filterPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#717171] text-sm">
                Filter Page {filterPage} of {totalFilterPages}
              </span>
              <button
                onClick={() => handlePageChangeFilter(filterPage + 1)}
                disabled={filterPage === totalFilterPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#717171] text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
          )}
          {/* ------------------- */}
        </div>
      </div>
      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <>
          {/* DARK BG SCREEN */}
          <div
            className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
            onClick={() => setFlyoutFilterOpen(!isFlyoutFilterOpen)}
          ></div>
          {/* NOW MY FLYOUT */}
          <div
            className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}
          >
            <div className="w-full min-h-auto  p-4 text-white">
              {/* Header */}
              <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
                <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                  User Filter
                </p>
                <IoCloseOutline
                  onClick={toggleFilterFlyout}
                  className="h-7 sm:h-8 w-7 sm:w-8 border border-gray-700 text-secondBlack rounded cursor-pointer"
                />
              </div>
          

              <div className="w-full border-b border-gray-700 mb-4 sm:mb-6"></div>

              <Formik
                initialValues={{
                  uuId: "",
                  module: "",
                  type: "",
                }}
                validationSchema={Yup.object({
                  uuId: Yup.string(),
                  module: Yup.string(),
                  type: Yup.string(),
                })}
                onSubmit={async (values) => {
                  // Call the API after submission if needed
                  // console.log("Form Values: ", values)
                  setFilterData([values]);
                  filterApiCall(values);
                }}
              >
                {({ values, errors, touched, setFieldValue, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    <div className="w-full">
                      {/* User Name */}
                      <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6">
                        <div className="w-full">
                          <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                            User Name
                          </p>
                          <CustomSelect
                            value={values.uuId}
                            onChange={(value) => {
                              setFieldValue("uuId", value);
                              setFilterData((prev) => [
                                {
                                  ...(prev[0] || {}),
                                  uuId: value,
                                },
                              ]);
                            }}
                            options={userOptions}
                            placeholder="Select User ID"
                            isClearable={true}
                            error={!!(errors.uuId && touched.uuId)}
                          />
                          {errors.uuId && touched.uuId && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.uuId}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Module & Type */}
                      <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-4 sm:mb-6">
                        <div className="w-full md:w-[49%]">
                          <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                            Module
                          </p>
                          <CustomSelect
                            value={values.module}
                            onChange={(value) => {
                              setFieldValue("module", value);
                              setFilterData((prev) => [
                                {
                                  ...(prev[0] || {}),
                                  module: value,
                                },
                              ]);
                            }}
                            options={moduleOptions}
                            placeholder="Select Module"
                            isClearable={true}
                            error={!!(errors.module && touched.module)}
                          />
                          {errors.module && touched.module && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.module}
                            </div>
                          )}
                        </div>

                        <div className="w-full md:w-[49%]">
                          <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                            Type
                          </p>
                          <CustomSelect
                            value={values.type}
                            onChange={(value) => {
                              setFieldValue("type", value);
                              setFilterData((prev) => [
                                {
                                  ...(prev[0] || {}),
                                  type: value,
                                },
                              ]);
                            }}
                            options={typeOptions}
                            placeholder="Select Type"
                            isClearable={true}
                            error={!!(errors.type && touched.type)}
                          />
                          {errors.type && touched.type && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.type}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BUTTONS */}
                      <div className="mt-8 md:mt-10 w-full flex flex-col md:flex-row md:justify-between items-center gap-y-4 md:gap-y-0">
                        <button
                          type="submit"
                          className="py-[13px] px-[26px] bg-primary-700 hover:bg-primary-800 w-full md:w-[49%] rounded-[4px] text-base font-medium leading-6 text-white text-center"
                        >
                          Filter Now
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </>
      )}

      {/* FITLER FLYOUT END */}
    </>
  );
}