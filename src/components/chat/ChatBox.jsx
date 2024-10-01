import { useEffect, useRef, useState } from "react";
import { BiDownload } from "react-icons/bi";
import { BsFillReplyFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaCheckCircle, FaTrashAlt } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp, IoIosAttach } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../../assets/images/default_user.png";
import DownArrow from "../../assets/images/icons/Down Arrow.svg";
import UpArrow from "../../assets/images/icons/Upper Arrow.svg";
import thumbnailDemo from "../../assets/images/project-thumbnail.jpg";
import { useLocalStorageObject } from "../../hooks/useLocalStorageObject";
import useOutsideClick from "../../hooks/useOutsideClick";
import formatFileSize from "../../libs/formatFileSize";
import { connectSocket } from "../../libs/socketService";
import Divider from "../Divider";
import AddQuickMsgModal from "./AddQuickMsgModal";
import CreateOfferModal from "./CreateOfferModal";
import EditQuickMsgModal from "./EditQuickMsgModal";
import EmojiPicker from "./EmojiPicker";

import toast from "react-hot-toast";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  useDeleteQuickResMsgMutation,
  useFetchQuickResMsgQuery,
} from "../../Redux/api/inboxApiSlice";

const ChatBox = ({ openToggle }) => {
  //Set the conversation user id
  const { conversationUser, chatData } = useSelector((state) => state.chat);
  const [expand, setExpand] = useState(false);
  const [expandDot, setExpandDot] = useState(false);
  const endOfMessagesRef = useRef(null);
  const dotMenuRef = useRef(null);
  const [{ quickResponse }, updateItem] = useLocalStorageObject("utils", {
    quickResponse: false,
  });
  const { user, token } = useSelector((state) => state.user);
  // const token = Cookies.get("authToken");
  const socket = connectSocket("http://localhost:3000", token);
  const { data: quickMsgs } = useFetchQuickResMsgQuery();
  const [deleteQuickResMsg] = useDeleteQuickResMsgMutation();

  const [onlineUsers, setOnlineUsers] = useState([]);

  console.log(onlineUsers, "checking the online users");

  // all avaiable user's
  useEffect(() => {
    socket.emit("view-online-users");
    socket.on("online-users", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });
  }, []);

  const userProfilePic = user?.image;

  const isAdmin = user?.role === "ADMIN";
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [qucikMsgBtnController, setQucikMsgBtnController] = useState(null);
  const [openAddMsgModal, setOpenAddMsgModal] = useState(false);
  const [openEditMsgModal, setOpenEditMsgModal] = useState(null);
  const [openOfferModal, setOpenOfferModal] = useState(false);

  // messages state
  // eslint-disable-next-line no-unused-vars
  const [messages, setMessages] = useState([
    // {
    //   userImage: userProfilePic,
    //   senderName: user?.fullName,
    //   messageId: 1,
    //   msgDate: "Apr 22, 2023",
    //   msgTime: "07:33 AM",
    //   messageText:
    //     "hello, looking for a flyer for my bathroom and kitchen company. I like the black and gold one you have listed",
    //   attachment: [],
    //   customOffer: null,
    //   contactForm: null,
    // },
  ]);

  const [visibility, setVisibility] = useState({});

  // Socket connection reader
  useEffect(() => {
    // Listen for incoming messages
    socket?.on("message", (msg) => {
      // setMessages((prevMessages) => [...prevMessages, msg]);
      console.log(msg, "socket message testing");
    });

    // Cleanup on component unmount
    return () => {
      socket?.off("message");
    };
  }, [socket]);

  useEffect(() => {
    // Inital Scroll to last message
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });

    const checkVisibility = () => {
      const newVisibility = {};
      const currentTime = new Date();

      messages.forEach((message) => {
        const messageDate = new Date(`${message.msgDate} ${message.msgTime}`);
        const fiveMinutesLater = new Date(
          messageDate.getTime() + 5 * 60 * 1000,
        );
        newVisibility[message.messageId] = currentTime < fiveMinutesLater;
      });

      setVisibility(newVisibility);
    };

    // Initial visibility check
    checkVisibility();

    // Set an interval to check every minute
    const intervalId = setInterval(checkVisibility, 60 * 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [messages]);

  // Quick Messages Handlers
  const handleQuickMsgs = (id) => {
    setQucikMsgBtnController(qucikMsgBtnController === id ? null : id);
  };

  const handleDeleteQuickMsg = async (id) => {
    try {
      await deleteQuickResMsg(id).unwrap();
      toast.success("Quick Message deleted successfully");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  // input handling
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Insert the emoji at the cursor position
    const newText =
      textValue.substring(0, startPos) +
      emoji +
      textValue.substring(endPos, textValue.length);

    setTextValue(newText);

    // Move the cursor position after the emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + emoji.length;
      textarea.focus();
    }, 0);
  };
  const handleChangeQuickMsg = (e) => {
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Insert the emoji at the cursor position
    const newText =
      textValue.substring(0, startPos) +
      e.target.value +
      textValue.substring(endPos, textValue.length);

    setTextValue(newText);

    // Move the cursor position after the emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd =
        startPos + e.target.value.length;
      textarea.focus();
    }, 0);
  };

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  // Image Preview Controllers

  const getImagesWithDimensions = (files) => {
    const images = [];

    const handleImageLoad = (file) => {
      images.push({
        file: file,
        url: URL.createObjectURL(file),
      });
      if (images.length === files.length) {
        setSelectedImages((prevImages) => {
          // Ensure prevImages is an array
          return Array.isArray(prevImages)
            ? [...prevImages, ...images]
            : images;
        });
      }
    };

    for (let i = 0; i < files.length; i++) {
      handleImageLoad(files[i]);
    }
  };

  const handleChangeSelectedImage = (event) => {
    const files = Array.from(event.target.files);
    getImagesWithDimensions(files);
  };

  const handleImageRemove = (index) => {
    setSelectedImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);
      return newImages;
    });

    // Reset the file input to allow re-uploading the same file
    fileInputRef.current.value = null;
  };

  // click outside the box it will be toggled
  useOutsideClick(menuRef, () => setQucikMsgBtnController(null));
  useOutsideClick(dotMenuRef, () => setExpandDot(false));

  // handler for Submitting/Send a Message
  const handleSubmitMessage = (e) => {
    e.preventDefault();

    if (textValue || selectedImages) {
      const response = () => {
        const date = new Date();
        const msgDate = date.toLocaleDateString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const msgTime = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const maxId =
          messages.length > 0
            ? Math.max(...messages.map((item) => item.messageId)) + 1
            : 1;
        const attachments = selectedImages?.map((img) => ({
          name: img.file.name,
          size: img.file.size,
          url: img.url,
        }));
        const submitForm = {
          messageId: maxId,
          userImage: userProfilePic,
          senderUserName: user?.userName,
          msgDate,
          msgTime,
          messageText: textValue,
          attachment: attachments || null,
          customOffer: null,
        };
        if (isAdmin) {
          socket.emit("admin-message", {
            userId: "66f4597cf2259c272ecaf810",
            ...submitForm,
          });
        } else {
          socket.emit("user-message", {
            userId: "66f4597cf2259c272ecaf810",
            ...submitForm,
          });
        }
        return { result: "Success" };
      };
      const result = response();
      if (result.result === "Success") {
        setTextValue("");
        // Clear the state
        setSelectedImages(null);

        // Reset the file input value
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // handle download all button
  const handleDownloadAll = (files) => {
    files.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.url; // Ensure this points to the file's URL
      link.setAttribute("download", file.name); // Set the filename
      document.body.appendChild(link);
      link.click(); // Simulate click to download
      document.body.removeChild(link); // Clean up
    });
  };

  return (
    <div className="h-full">
      {/* Header Part */}
      <div className="flex h-[70px] items-center justify-between rounded-tl-lg rounded-tr-lg bg-[#efefef] p-4 md:rounded-tl-none">
        <div className="">
          <h1 className="text-base font-semibold sm:text-lg">clientusername</h1>
          <div className="flex flex-col items-start text-xs sm:flex-row sm:items-center sm:gap-3 lg:text-sm">
            <p>Last seen: 18 hours ago</p>
            <Divider
              className={"hidden h-[15px] w-[2px] !bg-black/50 sm:block"}
            />
            <p className="hidden sm:block">Local time: 1:10 PM, May 29, 2023</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center justify-end gap-1 sm:gap-3">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-slate-300 text-xs font-semibold">
              3
            </div>
            <div className="relative" onClick={() => setExpandDot(!expandDot)}>
              <BsThreeDotsVertical className="text-2xl" />
              {expandDot && (
                <div
                  className="absolute right-0 top-full z-10 rounded-lg border border-solid bg-white py-2 text-center *:block *:p-[5px_15px]"
                  ref={dotMenuRef}
                >
                  <button
                    type="button"
                    className="w-full text-xs hover:bg-gray-200"
                    // onClick={() => setOpenEditMsgModal(msg)}
                  >
                    Read/Unread
                  </button>
                  <button
                    type="button"
                    // onClick={() => handleDeleteQuickMsg(msg.id)}
                    className="w-full text-xs hover:bg-gray-200"
                  >
                    Star/Starred
                  </button>
                  <button
                    type="button"
                    className="w-full text-xs hover:bg-gray-200"
                    // onClick={() => setOpenEditMsgModal(msg)}
                  >
                    Block/Unblock
                  </button>
                  <button
                    type="button"
                    // onClick={() => handleDeleteQuickMsg(msg.id)}
                    className="w-full text-xs hover:bg-gray-200"
                  >
                    Archive/Archived
                  </button>
                  <button
                    type="button"
                    // onClick={() => console.log("deleted")}
                    className="w-full text-xs hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="block md:hidden"
              onClick={() => openToggle(true)}
            >
              <RxHamburgerMenu className="text-2xl" />
            </button>
          </div>
        )}
      </div>
      {/* Conversation Field */}
      <div
        className={`${quickResponse && selectedImages?.length > 0 ? "h-[calc(100%_-_491px)]" : quickResponse ? "h-[calc(100%_-_350px)]" : selectedImages?.length > 0 ? "h-[calc(100%_-_391px)]" : "h-[calc(100%_-_250px)]"} overflow-y-auto p-5`}
      >
        {/* All message Container */}
        {/* Each message block */}
        {chatData?.map((msg, i) => (
          <div key={i} className="group mt-3 flex items-start gap-3 px-3">
            <div className="shrink-0">
              <img
                src={msg?.userImage ? msg?.userImage : logo}
                alt=""
                className="h-[30px] w-[30px] rounded-full object-cover"
              />
            </div>
            <div className="grow">
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="font-semibold">{msg?.senderUserName}</h1>
                  <p className="text-xs text-black/50">
                    {msg.msgDate}, {msg.msgTime}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-black/50 opacity-0 group-hover:opacity-100">
                  <button type="button">
                    <BsFillReplyFill className="text-xl" />
                  </button>
                  {visibility[msg.messageId] && (
                    <button type="button">
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
              {/* Here is the message text to preview */}
              {msg.messageText && (
                <div className="mt-1 w-11/12">
                  <p>{msg.messageText}</p>
                </div>
              )}
              {/* Here is the contact form message to preview */}
              {msg.contactForm && (
                <div className="mt-1">
                  <h1 className="font-semibold">Contact Form</h1>
                  <p className="my-1">
                    <span className="font-semibold">Name: </span> Client Name
                  </p>
                  <p className="my-1">
                    <span className="font-semibold">Email: </span>{" "}
                    info@industryname.com
                  </p>
                  <p className="my-1">
                    <span className="font-semibold">Website/Facebook: </span>{" "}
                    www.website.com
                  </p>
                  <p className="my-1">
                    <span className="font-semibold">Example design:</span>
                  </p>
                  {/* {msg.attachment && msg.attachment.length > 0 && ( */}
                  <div className="relative mt-2">
                    {/* {msg.attachment.length > 3 && ( */}
                    <Link className="mb-2 inline-block text-sm font-medium text-primary">
                      Download All
                    </Link>
                    {/* )} */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* {msg.attachment.map((att, i) => ( */}
                      {[1, 2, 3].map((i) => (
                        <div key={i}>
                          <img
                            src={thumbnailDemo}
                            alt=""
                            className="h-[180px] w-full object-cover"
                          />
                          <Link className="mt-2 flex items-center justify-center text-xs">
                            <BiDownload className="shrink-0 text-lg text-primary" />
                            <p
                              className="mx-2 line-clamp-1 font-medium"
                              // title={att.name}
                            >
                              Image name 00089.JPG
                            </p>
                            <span className="shrink-0 text-black/50">
                              (598.75 kb)
                            </span>
                          </Link>
                        </div>
                      ))}
                      {/* ))} */}
                    </div>
                    {/* {msg.attachment?.length >= 6 &&
                        (!expand ? (
                          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-white pb-8 pt-40">
                            <button
                              className="rounded-full border bg-white"
                              onClick={() => setExpand(!expand)}
                            >
                              <img
                                src={DownArrow}
                                alt=""
                                className="h-[50px] w-[50px]"
                              />
                            </button>
                          </div>
                        ) : (
                          <div className="relative z-10 flex justify-center bg-gradient-to-t from-white pb-8 pt-5">
                            <button
                              className="rounded-full border bg-white"
                              onClick={() => setExpand(!expand)}
                            >
                              <img
                                src={UpArrow}
                                alt=""
                                className="h-[50px] w-[50px]"
                              />
                            </button>
                          </div>
                        ))} */}
                  </div>
                  <p className="mt-5">
                    <span className="font-semibold">Message: </span> Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Necessitatibus
                    eveniet dolor provident consectetur iure ipsum officia qui
                    eligendi suscipit! Deserunt quas sed inventore eaque omnis.
                  </p>
                </div>
              )}
              {/* Here is the offer template to preview */}
              {msg.customOffer && (
                <div className="mt-1">
                  <p>Custom Offer</p>
                  <div className="border bg-lightskyblue">
                    <div className="flex items-center justify-between gap-3 bg-primary/20 p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={msg.customOffer.thumbnail}
                          className="h-[60px] w-[80px] object-cover"
                          alt=""
                        />
                        <h1 className="text-2xl font-semibold">
                          {msg.customOffer.title}
                        </h1>
                      </div>
                      <span className="shrink-0 px-3 text-3xl font-semibold text-primary">
                        ${msg.customOffer.price}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="mb-5 mt-2">{msg.customOffer.desc}</p>
                      <div className="flex items-center gap-2 font-medium">
                        <FaCheckCircle className="text-primary" />
                        <span>
                          {msg.customOffer.deliveryCount +
                            " " +
                            msg.customOffer.deliveryWay}{" "}
                          delivery
                        </span>
                      </div>
                      <div className="mt-4">
                        {isAdmin ? (
                          <button
                            type="button"
                            className="block w-full bg-primary p-2 text-center font-semibold text-white"
                          >
                            Withdraw Offer
                          </button>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className="block w-1/2 bg-primary p-2 text-center font-semibold text-white"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="block w-1/2 bg-gray-400 p-2 text-center font-semibold text-white"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Here is Image Upload Preview part */}
              {msg.attachment && msg.attachment.length > 0 && (
                <div className="relative mt-2">
                  {msg.attachment.length > 3 && (
                    <Link
                      onClick={() => handleDownloadAll(msg.attachment)}
                      className="mb-2 inline-block text-sm font-medium text-primary"
                    >
                      Download All
                    </Link>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    {msg.attachment.map((att, i) => (
                      <div key={i}>
                        <img
                          src={att.url}
                          alt=""
                          className="h-[180px] w-full object-cover"
                        />
                        {console.log(att)}
                        <a
                          href={att.url}
                          download={att.name}
                          className="mt-2 flex items-center justify-center text-xs"
                        >
                          <BiDownload className="shrink-0 text-lg text-primary" />
                          <p
                            className="mx-2 line-clamp-1 font-medium"
                            title={att.name}
                          >
                            {att.name}
                          </p>
                          <span className="shrink-0 text-black/50">
                            ({formatFileSize(att.size)})
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                  {msg.attachment?.length >= 6 &&
                    (!expand ? (
                      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-white pb-8 pt-40">
                        <button
                          className="rounded-full border bg-white"
                          onClick={() => setExpand(!expand)}
                        >
                          <img
                            src={DownArrow}
                            alt=""
                            className="h-[50px] w-[50px]"
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="relative z-10 flex justify-center bg-gradient-to-t from-white pb-8 pt-5">
                        <button
                          className="rounded-full border bg-white"
                          onClick={() => setExpand(!expand)}
                        >
                          <img
                            src={UpArrow}
                            alt=""
                            className="h-[50px] w-[50px]"
                          />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      {/* Text Field Part */}
      <div
        className={`${quickResponse && selectedImages?.length > 0 ? "h-[423px]" : quickResponse ? "h-[280px]" : "h-[180px]"} px-3`}
      >
        <div className="rounded-t-md border border-b border-slate-300">
          {selectedImages?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-b p-[10px]">
              {selectedImages?.map((image, index) => (
                <div key={index} className="w-[120px]">
                  <div className="group relative">
                    <img
                      className={`h-[80px] w-full object-contain`}
                      src={image.url}
                      alt={`Selected ${index}`}
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white"
                      onClick={() => handleImageRemove(index)}
                    >
                      <RiDeleteBin6Line size={15} />
                    </button>
                  </div>
                  <h1
                    className="truncate text-xs font-medium"
                    title={image.file.name}
                  >
                    {image.file.name}
                  </h1>
                  <span className="text-xs">
                    ({formatFileSize(image.file.size)})
                  </span>
                </div>
              ))}
            </div>
          )}
          <div
            className={`${quickResponse ? "h-[140px]" : "h-[40px]"} border-b border-slate-300 p-2`}
          >
            <div className="flex items-center gap-3 font-semibold">
              Quick Response{" "}
              <button
                type="button"
                className="bg-transparent"
                onClick={() => updateItem("quickResponse", !quickResponse)}
              >
                {quickResponse ? (
                  <IoIosArrowDown className="text-xl text-primary" />
                ) : (
                  <IoIosArrowUp className="text-xl text-primary" />
                )}
              </button>
            </div>
            <div
              className={`${quickResponse ? "block" : "hidden"} flex h-[100px] flex-wrap items-start gap-3 overflow-y-auto py-2`}
            >
              {quickMsgs?.map((msg, i) => (
                <div
                  key={i}
                  className="relative flex items-center gap-2 border border-gray-400 px-2 py-1 text-xs hover:bg-primary/10"
                >
                  <button
                    type="button"
                    value={msg.description}
                    onClick={handleChangeQuickMsg}
                  >
                    {msg.title}
                  </button>
                  <button type="button" onClick={() => handleQuickMsgs(msg.id)}>
                    <IoIosArrowDown className="text-base text-gray-400" />
                  </button>
                  {qucikMsgBtnController === msg.id && (
                    <div
                      className="absolute top-full z-10 rounded-lg border border-solid bg-white py-2 text-center *:block *:p-[5px_15px]"
                      ref={menuRef}
                    >
                      <button
                        type="button"
                        className="w-full text-xs hover:bg-gray-200"
                        onClick={() => setOpenEditMsgModal(msg)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuickMsg(msg.id)}
                        className="w-full text-xs hover:bg-gray-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 border border-gray-400 px-2 py-1 text-xs hover:bg-primary/10">
                <button type="button" onClick={() => setOpenAddMsgModal(true)}>
                  + Add New
                </button>
              </div>
            </div>
          </div>
          <textarea
            name=""
            className="block h-[90px] w-full resize-none p-3 outline-none"
            placeholder="Type a message..."
            ref={textareaRef}
            value={textValue}
            onChange={handleTextChange}
          ></textarea>
          <div className="flex h-[50px] items-center justify-between border-t border-slate-300">
            <div className="flex items-center gap-[2px] pl-1 sm:gap-3 sm:pl-3">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                style={{ transform: "translateX(-5%)" }}
              />
              <Divider className={"h-[30px] w-px !bg-gray-400"} />
              <div>
                <input
                  type="file"
                  multiple
                  id="select-images"
                  hidden
                  onChange={handleChangeSelectedImage}
                  ref={fileInputRef}
                />
                <label htmlFor="select-images" className="cursor-pointer">
                  <IoIosAttach className="text-2xl" />
                </label>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="bg-lightskyblue px-2 py-2 text-xs font-medium sm:text-sm"
                  onClick={() => setOpenOfferModal(true)}
                >
                  Create an Offer
                </button>
              )}
            </div>
            <button
              type="button"
              className="flex h-full w-[100px] items-center justify-center bg-primary text-sm font-semibold text-white sm:w-[120px] sm:text-base"
              onClick={handleSubmitMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      {/* Here all the modals components */}
      {openEditMsgModal && (
        <EditQuickMsgModal
          handleClose={setOpenEditMsgModal}
          value={openEditMsgModal}
          controller={setQucikMsgBtnController}
        />
      )}
      {openAddMsgModal && <AddQuickMsgModal handleClose={setOpenAddMsgModal} />}
      {openOfferModal && (
        <CreateOfferModal
          handleClose={setOpenOfferModal}
          onOfferSubmit={socket}
          values={messages}
        />
      )}
    </div>
  );
};

export default ChatBox;
