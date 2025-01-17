import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BsInfoCircle } from "react-icons/bs";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaSpinner,
  FaTiktok,
  FaTumblr,
  FaYelp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LiaEditSolid } from "react-icons/lia";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLazyGetUsersProjectStatusQuery } from "../Redux/api/apiSlice";
import { useGetMahfujurDetailsQuery } from "../Redux/api/dashboardApiSlice";
import {
  useLazyGetAllMessagesQuery,
  useSendMessageFromProfileMutation,
} from "../Redux/api/inboxApiSlice";
import {
  useGetAUserReviewsQuery,
  useGetAllAdminReviewsQuery,
  useUsersAllProjectsQuery,
} from "../Redux/api/orderApiSlice";
import { setChatData, setConversationUser } from "../Redux/features/chatSlice";
import { setOnlineUsers, setUser } from "../Redux/features/userSlice";
import Nextdoor from "../assets/svg/Nextdoor";
import ActiveProjects from "../components/customer-profile/ActiveProjects";
import AllReviews from "../components/customer-profile/AllReviews";
import CompletedProjects from "../components/customer-profile/CompletedProjects";
import ProfileInfo from "../components/customer-profile/ProfileInfo";
import { configApi } from "../libs/configApi";
import { connectSocket } from "../libs/socketService";
import { timeAgoTracker } from "../libs/timeAgoTracker";

function Profile({ user = {}, slug }) {
  const { data: usersProjects } = useUsersAllProjectsQuery({
    userId: user?.id,
  });

  const { data: adminReview } = useGetAllAdminReviewsQuery();
  const { data: userReview } = useGetAUserReviewsQuery({
    userName: user?.userName,
  });

  const [userReviews, setUserReviews] = useState([]);

  //functions for filtering projects
  const isActiveProject = (project) =>
    project?.projectStatus !== "Completed" &&
    project?.projectStatus !== "Canceled" &&
    project?.paymentStatus === "PAID";

  const isCompletedProject = (project) =>
    project?.projectStatus === "Completed" && project?.paymentStatus === "PAID";

  // Using useMemo to  optimization
  const filteredActiveProjects = useMemo(
    () => usersProjects?.filter(isActiveProject),
    [usersProjects],
  );

  const filteredCompletedProjects = useMemo(
    () => usersProjects?.filter(isCompletedProject),
    [usersProjects],
  );
  const [sendMessageFromProfile] = useSendMessageFromProfileMutation();

  const { data: adminProfileData } = useGetMahfujurDetailsQuery();
  const [getUserProfileData, { data: userProfileData }] =
    useLazyGetUsersProjectStatusQuery();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    user: loggedUser,
    onlineUsers,
    token,
  } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'completed'
  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState(false);
  const [showDesqEdit, setShowDesqEdit] = useState(false);
  const [description, setDescription] = useState(user?.description || "");

  useEffect(() => {
    if (user?.id) {
      getUserProfileData({ userId: user?.id });
    }
  }, [user, getUserProfileData]);

  useEffect(() => {
    // Update the state when the user prop changes
    setDescription(user?.description || "");
  }, [user]);

  useEffect(() => {
    if (user?.role === "USER" && userReview) {
      setUserReviews(userReview);
    } else if (user?.role !== "USER" && adminReview) {
      setUserReviews(adminReview);
    }
  }, [user, userReview, adminReview]);

  // for user creating date making readable and formatted
  const date = new Date(user?.createdAt);
  const options = { year: "numeric", month: "long" };
  const monthYear = date?.toLocaleDateString("en-US", options);

  const letterLogo = user?.userName?.trim()?.charAt(0)?.toUpperCase();

  const socket = connectSocket(`${configApi.socket}`, token);
  // all avaliable users
  useEffect(() => {
    socket?.emit("view-online-users");
    socket?.on("online-users", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });
  }, [socket, dispatch]);

  const isUserOnline = (userId) => {
    return onlineUsers.some((onlineUser) => onlineUser.userId === userId);
  };

  const handleProfileInfo = () => {
    setProfileInfo(!profileInfo);
  };

  const handleDesqEdit = () => {
    setShowDesqEdit(true);
  };

  const handleSave = async () => {
    if (user?.description !== description) {
      try {
        setLoading(true);
        const { data } = await axios.post(`${configApi.api}update-user`, {
          email: user?.email,
          description,
        });
        dispatch(setUser({ user: data?.data }));
        setShowDesqEdit(false);
        setLoading(false);
      } catch (error) {
        toast.error("Something went wrong!");
      }
    } else {
      setShowDesqEdit(false);
    }
  };

  const handleCancel = () => {
    setShowDesqEdit(false);
    setDescription(user?.description || "");
  };

  const {
    facebook,
    instagram,
    twitter,
    google,
    linkedin,
    yelp,
    tumblr,
    youtube,
    nextdoor,
    pinterest,
    tiktok,
  } = user.SocialMediaLinks || {};

  const isSocialExists =
    facebook ||
    instagram ||
    twitter ||
    google ||
    linkedin ||
    yelp ||
    tumblr ||
    youtube ||
    nextdoor ||
    pinterest ||
    tiktok;

  const lastSeen = timeAgoTracker(user?.lastSeen);

  // after clicking on the message button
  const [triggerGetAllMessages, { data: getAllMessages }] =
    useLazyGetAllMessagesQuery();

  useEffect(() => {
    if (getAllMessages) {
      dispatch(setChatData(getAllMessages));
      navigate("/inbox");
    }
  }, [dispatch, getAllMessages, navigate]);

  const handleMessageButton = (id) => {
    dispatch(setConversationUser(id));
    triggerGetAllMessages({
      receiverId: id,
    });
    try {
      sendMessageFromProfile({ userId: id }).unwrap();
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const timeFormatter = (datetime) => {
    const date = new Date(datetime); // Convert the ISO string into a Date object

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[date.getMonth()]; // Get the month name
    const day = date.getDate(); // Get the day of the month
    const year = date.getFullYear(); // Get the full year

    return `${month} ${day}, ${year}`;
  };

  return (
    <section className="max-width mt-10 flex flex-col gap-10 md:flex-row lg:gap-16">
      <div className="min-w-[300px] md:w-1/4">
        <div className="relative border border-gray-300 bg-[#edf7fd] p-4 py-6">
          {/* profile info  */}
          <BsInfoCircle
            className="absolute right-4 top-4 cursor-pointer text-base text-gray-500"
            onClick={handleProfileInfo}
          />
          {profileInfo && (
            <ProfileInfo
              handleProfileInfo={handleProfileInfo}
              profileInfo={profileInfo}
              user={user}
            />
          )}
          <div className="pb-4">
            <div className="relative mx-auto flex size-32 items-center justify-center rounded-full border border-gray-300 bg-[#ffefef]/30">
              {user?.image ? (
                <img
                  className="h-full w-full select-none rounded-full object-cover"
                  src={user?.image}
                  alt={user?.fullName}
                />
              ) : (
                <div className="text-[80px] font-bold text-[#7c7c7c]/50">
                  {letterLogo}
                </div>
              )}
              <span
                className={`absolute bottom-1.5 right-4 size-4 rounded-full border border-white ${isUserOnline(user?.id) ? "bg-primary" : "bg-gray-400"}`}
              ></span>
            </div>
            <h2 className="mt-3 text-center text-lg font-semibold sm:text-xl">
              {user?.userName}
            </h2>
            {loggedUser?.role !== "USER" &&
              user?.id !== loggedUser?.id &&
              user?.role === "USER" && (
                <button
                  onClick={() => handleMessageButton(user?.id)}
                  className="mx-auto mt-3 flex justify-center rounded-full border bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/85"
                >
                  Message Me
                </button>
              )}
          </div>

          <div className="space-y-3 border-y border-gray-300 py-4">
            <div className="flex justify-between gap-1 text-sm">
              <span>From</span>
              <p className="font-semibold">{user?.country}</p>
            </div>
            <div className="flex justify-between gap-1 text-sm">
              <span>Member Since</span>
              <p className="font-semibold">{monthYear}</p>
            </div>
            {user?.language && (
              <div className="flex justify-between gap-1 text-sm">
                <span>Language</span>
                <p className="font-semibold">{user?.language}</p>
              </div>
            )}
            <div className="flex justify-between gap-1 text-sm">
              <span>Last Visited</span>
              {lastSeen ? (
                // <p className="font-semibold">{lastSeen}</p>
                <p className="font-semibold">
                  {isUserOnline(user?.id) ? "Online" : lastSeen}
                </p>
              ) : (
                <p className="font-semibold">
                  {isUserOnline(user?.id) ? "Online" : "Offline"}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {user?.role === "USER" ? (
              <div className="flex justify-between gap-1 text-sm">
                <span>Completed Projects</span>
                <p className="font-semibold">
                  {filteredCompletedProjects?.length}
                </p>
              </div>
            ) : (
              <div className="flex justify-between gap-1 text-sm">
                <span>Avg. Response Time</span>
                <p className="font-semibold">1 hour</p>
              </div>
            )}
            {user?.role === "USER" ? (
              <div className="flex justify-between gap-1 text-sm">
                <span>Project Completion Rate</span>
                <p className="font-semibold">
                  {Math.round(userProfileData?.ProjectCompletedRate)}%
                </p>
              </div>
            ) : (
              <div className="flex justify-between gap-1 text-sm">
                <span>Avg. Rating</span>
                <p className="font-semibold">
                  {adminProfileData?.Avg_Rating?.toFixed(1)}
                </p>
              </div>
            )}
            {user?.role === "USER" ? (
              <div className="flex justify-between gap-1 text-sm">
                <span>Avg. Rating Taken</span>
                <p className="font-semibold">
                  {userProfileData?.AvgRatingTaken?.toFixed(1)} Stars
                </p>
              </div>
            ) : (
              <div className="flex justify-between gap-1 text-sm">
                <span>On-Time Delivery</span>
                <p className="font-semibold">
                  {parseInt(adminProfileData?.OnTimeDelivery) || 100}%
                </p>
              </div>
            )}
            {user?.role === "USER" ? (
              <div className="flex justify-between gap-1 text-sm">
                <span>Avg. Rating Given</span>
                <p className="font-semibold">
                  {userProfileData?.AvgRatingGiven?.toFixed(1)} Stars
                </p>
              </div>
            ) : (
              <div className="flex justify-between gap-1 text-sm">
                <span>Active Projects</span>
                <p className="font-semibold">
                  {adminProfileData?.Active_Projects}
                </p>
              </div>
            )}
            {user?.role === "USER" ? (
              userProfileData?.LastProjectOn && (
                <div className="flex justify-between gap-1 text-sm">
                  <span>Last Project on</span>
                  <p className="font-semibold">
                    {timeFormatter(userProfileData?.LastProjectOn)}
                  </p>
                </div>
              )
            ) : (
              <div className="flex items-center justify-between gap-1 text-sm">
                <span>Last Project Completed</span>
                <p className="text-nowrap font-semibold">
                  {adminProfileData?.LastProjectCompleted?.date?.replace(
                    "about",
                    "",
                  )}
                </p>
              </div>
            )}
          </div>

          {/* social medias icons  */}
          {(isSocialExists || user?.id === loggedUser?.id) && (
            <div className="relative mt-4 border-t border-gray-300">
              <p className="mb-4 pt-4 text-center">Social Media Links</p>
              {slug === loggedUser?.userName && (
                <Link className="absolute right-0 top-4" to="/social-media">
                  <LiaEditSolid className="size-6 cursor-pointer text-xl" />
                </Link>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {facebook && (
                  <Link
                    to={facebook}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaFacebookF />
                  </Link>
                )}

                {instagram && (
                  <Link
                    to={instagram}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaInstagram />
                  </Link>
                )}

                {twitter && (
                  <Link
                    to={twitter}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaXTwitter />
                  </Link>
                )}

                {pinterest && (
                  <Link
                    to={pinterest}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaPinterestP />
                  </Link>
                )}

                {linkedin && (
                  <Link
                    to={linkedin}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaLinkedinIn />
                  </Link>
                )}
                {google && (
                  <Link
                    to={google}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaGoogle />
                  </Link>
                )}
                {tumblr && (
                  <Link
                    to={tumblr}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaTumblr />
                  </Link>
                )}
                {youtube && (
                  <Link
                    to={youtube}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaYoutube />
                  </Link>
                )}
                {tiktok && (
                  <Link
                    to={tiktok}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaTiktok />
                  </Link>
                )}
                {yelp && (
                  <Link
                    to={yelp}
                    target="_blank"
                    className="rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <FaYelp />
                  </Link>
                )}
                {nextdoor && (
                  <Link
                    to={nextdoor}
                    target="_blank"
                    className="group flex-shrink-0 rounded-full border border-gray-400 bg-transparent p-2 text-primary duration-300 hover:bg-primary hover:text-white"
                  >
                    <Nextdoor className="!fill-primary group-hover:!fill-white" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
        {/* description  */}
        {(description || user?.id === loggedUser?.id) && (
          <div className="mt-6 border border-gray-300 bg-[#edf7fd] p-4 py-6">
            <div className="flex items-center justify-between gap-1 pb-3">
              <h2 className="text-base font-bold sm:text-lg">Description</h2>
              {!showDesqEdit && slug === loggedUser?.userName && (
                <LiaEditSolid
                  onClick={handleDesqEdit}
                  className="size-6 cursor-pointer text-xl"
                />
              )}
            </div>
            <div>
              {!showDesqEdit ? (
                <p className="border-t border-gray-300 pt-4 text-[15px] font-medium leading-relaxed">
                  {description}
                </p>
              ) : (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="border border-gray-300 bg-white p-4 text-[15px] font-medium leading-relaxed outline-none"
                  onBlur={(e) => setDescription(e.target.innerText)}
                >
                  {description}
                </p>
              )}
            </div>
            {showDesqEdit && (
              <div className="flex gap-4">
                <button
                  className="mt-4 w-full border border-primary bg-transparent px-4 py-2 font-semibold text-primary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  className="mt-4 flex w-full items-center justify-center bg-primary px-4 py-2 font-semibold text-white"
                  onClick={handleSave}
                >
                  {loading ? (
                    <span className="animate-spin text-xl">
                      <FaSpinner />
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* projects  */}
      <div className="flex-1">
        {user?.role === "USER" && slug === loggedUser?.userName && (
          <div className="flex justify-around gap-4">
            <h2
              className={`cursor-pointer text-lg font-semibold sm:text-xl ${
                activeTab === "active" && "text-primary underline"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active Projects ({filteredActiveProjects?.length})
            </h2>
            <h2
              className={`cursor-pointer text-lg font-semibold sm:text-xl ${
                activeTab === "completed" && "text-primary underline"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed Projects ({filteredCompletedProjects?.length})
            </h2>
          </div>
        )}
        {/* activeProject */}
        {user?.role === "USER" &&
          activeTab === "active" &&
          slug === loggedUser?.userName && (
            <ActiveProjects activeProjects={filteredActiveProjects} />
          )}
        {/* completedProjects */}
        {user?.role === "USER" &&
          activeTab === "completed" &&
          slug === loggedUser?.userName && (
            <CompletedProjects completedProjects={filteredCompletedProjects} />
          )}
        {/* All Reviews  */}
        <AllReviews user={user} allReviews={userReviews} />
      </div>
    </section>
  );
}

export default Profile;
