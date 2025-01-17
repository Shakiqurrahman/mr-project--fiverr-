import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoMdAttach,
  IoMdClose,
} from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import shortid from "shortid";
import {
  useDeleteQuickResMsgMutation,
  useFetchQuickResMsgQuery,
} from "../../Redux/api/inboxApiSlice";
import {
  useSendAOrderMessageMutation,
  useSubmitDeliveryMutation,
} from "../../Redux/api/orderApiSlice";
import { setMessages, setReplyTo } from "../../Redux/features/orderSlice";
import { useLocalStorageObject } from "../../hooks/useLocalStorageObject";
import useOutsideClick from "../../hooks/useOutsideClick";
import { TimeZoneConverter } from "../../libs/TimeZoneConverter";
import { configApi } from "../../libs/configApi";
import formatFileSize from "../../libs/formatFileSize";
import { connectSocket } from "../../libs/socketService";
import CircleProgressBar from "../CircleProgressBar";
import Divider from "../Divider";
import FilePreview from "../FilePreview";
import GenerateName from "../GenerateName";
import AddQuickMsgModal from "../chat/AddQuickMsgModal";
import EditQuickMsgModal from "../chat/EditQuickMsgModal";

const OrderDeliveryForm = ({ handleClose }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  const { projectDetails, replyTo } = useSelector((state) => state.order);
  // All reference states here
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const sourceInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // Socket Connection
  const socket = connectSocket(`${configApi.socket}`, token);

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "SUB_ADMIN"].includes(user?.role);

  // Redux query imports here
  const { data: quickMsgs } = useFetchQuickResMsgQuery();
  const [deleteQuickResMsg] = useDeleteQuickResMsgMutation();
  const [sendAOrderMessage] = useSendAOrderMessageMutation();
  const [submitDelivry] = useSubmitDeliveryMutation();

  //   all states here
  const [textValue, setTextValue] = useState("");
  const [qucikMsgBtnController, setQucikMsgBtnController] = useState(null);
  const [openEditMsgModal, setOpenEditMsgModal] = useState(null);
  const [openAddMsgModal, setOpenAddMsgModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [clientTimeAndDate, setClientTimeAndDate] = useState(null);
  const [uploadingLength, setUploadingLength] = useState(0);
  const [uploadingTempLength, setUploadingTempLength] = useState(0);

  // localStorage state
  const [{ quickResponse }, updateItem] = useLocalStorageObject("utils", {
    quickResponse: false,
  });
  const [deliveryDraft] = useLocalStorageObject("deliveryDraft", {
    messageText: textValue,
    attachments: selectedImages,
    thumbnailImage,
  });

  //   all side effects here
  useEffect(() => {
    if (projectDetails) {
      const dateTime = TimeZoneConverter(projectDetails?.orderFrom);
      setClientTimeAndDate(dateTime);
    }
  }, []);

  useEffect(() => {
    if (deliveryDraft) {
      setTextValue(deliveryDraft?.messageText);
      setSelectedImages(deliveryDraft?.attachments);
      setThumbnailImage(deliveryDraft?.thumbnailImage);
    }
  }, [deliveryDraft]);

  useEffect(() => {
    if (uploadingLength === uploadingTempLength) {
      setUploadingLength(0);
    }
  }, [uploadingTempLength]);

  //  all handler functions here
  // Quick Messages Handlers
  const handleQuickMsgs = (id) => {
    setQucikMsgBtnController(qucikMsgBtnController === id ? null : id);
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

  const handleDeleteQuickMsg = async (id) => {
    try {
      await deleteQuickResMsg(id).unwrap();
      toast.success("Quick Message deleted successfully");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  // Text Editor handler
  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  // Image Preview Controllers

  const getImagesWithDimensions = async (files) => {
    const handleImageLoad = async (file, index, i) => {
      const formData = new FormData();
      formData.append("files", file);

      const uploadUrl = `${configApi.api}upload-attachment`;

      setUploadingTempLength(i + 1);

      const uploadData = {
        name: file.name,
        size: file.size,
        progress: 0,
        url: null,
        type: file.type,
        format: null,
        watermark: null,
      };

      setSelectedImages((prev) => [...prev, uploadData]); // Add the new upload

      try {
        const response = await axios.post(uploadUrl, formData, {
          onUploadProgress: (data) => {
            const percentage = Math.round((data.loaded / data.total) * 100);
            setSelectedImages((prev) => {
              const newImages = [...prev];
              newImages[index].progress = percentage; // Update progress
              return newImages;
            });
          },
        });

        // Update image data upon successful upload
        const imageUrl = response.data.data.file.url.replaceAll(
          "-watermark-resized",
          "",
        );
        const watermarkUrl = response.data.data.file.url;

        const fileFormat = response.data.data.file.fileType;

        setSelectedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            url: imageUrl,
            progress: 100,
            format: fileFormat,
            watermark: watermarkUrl,
          }; // Set URL and progress to 100%
          return newImages;
        });
      } catch (error) {
        toast.error("Something went wrong!");
      }
    };

    // Process files one by one in sequence
    for (let i = 0; i < files.length; i++) {
      const index = selectedImages?.length + i;
      await handleImageLoad(files[i], index, i); // Wait for each file to finish uploading before starting the next
    }
  };

  const handleChangeSelectedImage = (event) => {
    const files = Array.from(event.target.files);
    getImagesWithDimensions(files);
    setUploadingLength(files?.length);

    // Reset the file input to allow re-uploading the same file
    sourceInputRef.current.value = null;
  };

  const handleThumbnailChange = async (e) => {
    const file = Array.from(e.target.files)[0];

    const formData = new FormData();
    formData.append("files", file);

    const uploadUrl = `${configApi.api}upload-attachment`;

    const uploadData = {
      name: file.name,
      size: file.size,
      progress: 0,
      url: null,
      type: file.type,
      format: null,
      watermark: null,
    };

    setThumbnailImage(uploadData); // Add the new upload

    try {
      const response = await axios.post(uploadUrl, formData, {
        onUploadProgress: (data) => {
          const percentage = Math.round((data.loaded / data.total) * 100);
          setThumbnailImage((prev) => ({
            ...prev,
            progress: percentage, // Update progress
          }));
        },
      });

      // Update image data upon successful upload
      const imageUrl = response.data.data.file.url.replaceAll(
        "-watermark-resized",
        "",
      );
      const watermarkUrl = response.data.data.file.url;
      const fileFormat = response.data.data.file.fileType;
      setThumbnailImage((prev) => ({
        ...prev,
        url: imageUrl,
        progress: 100,
        format: fileFormat,
        watermark: watermarkUrl,
      }));
    } catch (error) {
      toast.error("Something went wrong!");
    }

    thumbnailInputRef.current.value = "";
  };

  const handleThumbnailRemove = () => {
    setThumbnailImage(null);
    thumbnailInputRef.current.value = "";
  };

  const handleImageRemove = (index) => {
    setSelectedImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);
      return newImages;
    });
  };

  //   Saving Draft Data Handler
  const handleSaveDraft = () => {
    const formData = {
      messageText: textValue,
      attachments: selectedImages,
      thumbnailImage,
    };
    localStorage.setItem("deliveryDraft", JSON.stringify(formData));
  };

  // Setup sending message time and date
  const dates = new Date();
  const timeAndDate = dates.getTime();

  //   submitting form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      textValue.length <= 5000 &&
      selectedImages?.length > 0 &&
      thumbnailImage
    ) {
      const filteredImages = selectedImages?.filter(
        (i) => i?.url && i?.name && i?.size,
      );
      const formData = {
        firstAttempt: projectDetails?.deliveryAttempt > 0 ? false : true,
        attachments: filteredImages,
        thumbnailImage,
        isRevision: false,
        isAccepted: false,
      };
      const submitForm = {
        messageText: textValue,
        senderUserName: user?.userName,
        userImage: user?.image,
        attachment: [],
        additionalOffer: null,
        extendDeliveryTime: null,
        deliverProject: formData,
        cancelProject: null,
        revisionProject: null,
        imageComments: [],
        timeAndDate,
        replyTo,
        projectNumber: projectDetails?.projectNumber,
        uniqueId: shortid(),
      };

      if (isAdmin) {
        socket?.emit("order:admin-message", {
          userId: projectDetails?.userId,
          ...submitForm,
        });
      } else {
        socket?.emit("order:user-message", {
          ...submitForm,
        });
      }

      dispatch(
        setMessages({
          ...submitForm,
          recipientId: isAdmin ? projectDetails?.userId : "",
        }),
      );

      dispatch(setReplyTo(null));

      try {
        const res = await sendAOrderMessage({
          recipientId: isAdmin ? projectDetails?.userId : null,
          ...submitForm,
        }).unwrap();

        // setReplyTo(null);
      } catch (error) {
        toast.error("Something went wrong!");
      }

      const resetStorage = {
        messageText: "",
        attachments: [],
        thumbnailImage: null,
      };
      localStorage.setItem("deliveryDraft", JSON.stringify(resetStorage));
      handleClose(false);
      try {
        const res = await submitDelivry({
          projectNumber: projectDetails?.projectNumber,
        }).unwrap();
      } catch (error) {
        toast.error("Something went wrong!");
      }
    }
  };

  // click outside the box it will be toggled
  useOutsideClick(menuRef, () => setQucikMsgBtnController(null));

  return (
    <>
      <div className="fixed left-0 top-0 z-[99999999] flex h-screen w-full items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
        <form
          className="w-full max-w-[800px] rounded-md border bg-white p-4 shadow-btn-shadow"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between px-2 pb-4">
            <h1 className="text-xl font-semibold text-primary">Deliver work</h1>
            <IoMdClose
              className="cursor-pointer text-2xl text-black/50"
              onClick={() => handleClose(false)}
            />
          </div>
          <div className="border">
            <div
              className={`${quickResponse ? "h-[140px]" : "h-[40px]"} border-b border-slate-300 p-2`}
            >
              <div className="flex items-center justify-between gap-3">
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
                <div className="hidden items-center gap-3 text-xs font-medium sm:flex">
                  {clientTimeAndDate && (
                    <>
                      <p>
                        Local time: {clientTimeAndDate?.time},{" "}
                        {clientTimeAndDate?.date}
                      </p>
                      <Divider className="h-4 w-px !bg-black" />
                    </>
                  )}
                  <p>Last seen 23 hours ago</p>
                </div>
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
                    <button
                      type="button"
                      onClick={() => handleQuickMsgs(msg.id)}
                    >
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
                  <button
                    type="button"
                    onClick={() => setOpenAddMsgModal(true)}
                  >
                    + Add New
                  </button>
                </div>
              </div>
            </div>
            <textarea
              name=""
              className={`block h-[150px] w-full resize-none p-3 outline-none ${textValue?.length > 5000 ? "border border-canceled" : ""}`}
              placeholder="Typing"
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
            ></textarea>
            <p
              className={`select-none p-2 text-end text-xs font-medium ${textValue?.length > 5000 ? "text-canceled" : "text-black/50"}`}
            >
              {textValue?.length || 0}/5,000
            </p>
            {selectedImages?.length > 0 && (
              <div className="preview-scroll-overflow-x flex gap-2 border-t p-2">
                {selectedImages?.map(
                  (image, index) =>
                    image?.name &&
                    image?.size && (
                      <div key={index} className="w-[120px]">
                        <div className="group relative">
                          {image?.url ? (
                            <FilePreview file={image} />
                          ) : (
                            <div className="flex h-[80px] items-center justify-center bg-lightcream">
                              <CircleProgressBar
                                precentage={image?.progress}
                                circleWidth={50}
                              />
                            </div>
                          )}
                          {(isAdmin ||
                            image?.url ||
                            image?.progress === 100) && (
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white"
                              onClick={() => handleImageRemove(index)}
                            >
                              <RiDeleteBin6Line size={20} />
                            </button>
                          )}
                        </div>
                        <h1
                          className="truncate text-xs font-medium"
                          title={image?.name}
                        >
                          <GenerateName name={image?.name} />
                        </h1>
                        <span className="text-xs">
                          ({formatFileSize(image?.size)})
                        </span>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-5 sm:flex-nowrap">
              <div className="w-full text-center sm:w-auto sm:text-start">
                <input
                  type="file"
                  id="uploadThumbnail"
                  hidden
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailChange}
                />
                <label
                  htmlFor="uploadThumbnail"
                  className="inline-block cursor-pointer rounded-md bg-lightskyblue px-10 py-2 font-semibold"
                >
                  <IoMdAttach className="inline-block text-xl" /> Thumbnail
                </label>
              </div>
              <div className="w-full text-center sm:w-auto sm:text-start">
                <input
                  type="file"
                  id="uploadSource"
                  hidden
                  multiple
                  onChange={handleChangeSelectedImage}
                  ref={sourceInputRef}
                />
                <label
                  htmlFor="uploadSource"
                  className="inline-block cursor-pointer rounded-md bg-lightskyblue px-10 py-2 font-semibold"
                >
                  <IoMdAttach className="inline-block text-xl" /> Source Files
                </label>
              </div>
              {selectedImages?.length > 0 && (
                <div className="mx-auto text-xs font-semibold sm:me-0 sm:ms-auto">
                  {uploadingLength > 0 && (
                    <p>
                      Uploading {uploadingTempLength}/{uploadingLength}
                    </p>
                  )}
                  <p className="">
                    {
                      selectedImages?.filter((i) => i.url && i.name && i.size)
                        .length
                    }{" "}
                    Attachments
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-end justify-center gap-5 md:flex-nowrap md:justify-normal">
              {thumbnailImage && (
                <div className="flex w-full items-center gap-3 md:w-auto">
                  <div className="relative">
                    {thumbnailImage.url ? (
                      <div className="w-[100px]">
                        <FilePreview file={thumbnailImage} />
                      </div>
                    ) : (
                      <div className="flex h-[80px] w-[100px] items-center justify-center bg-lightcream">
                        <CircleProgressBar
                          precentage={thumbnailImage.progress}
                          circleWidth={50}
                        />
                      </div>
                    )}
                    {(isAdmin ||
                      thumbnailImage?.url ||
                      thumbnailImage?.progress === 100) && (
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white"
                        onClick={() => handleThumbnailRemove()}
                      >
                        <RiDeleteBin6Line size={20} />
                      </button>
                    )}
                  </div>
                  <div className="text-sm">
                    <h1 className="break-words md:max-w-[200px]">
                      <GenerateName name={thumbnailImage?.name} />
                    </h1>
                    <span className="text-black/50">
                      ({formatFileSize(thumbnailImage?.size)})
                    </span>
                  </div>
                </div>
              )}
              <button
                type="button"
                className="rounded-md bg-revision px-10 py-2 font-semibold text-white md:ms-auto"
                onClick={handleSaveDraft}
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-10 py-2 font-semibold text-white"
              >
                Deliver
              </button>
            </div>
          </div>
        </form>
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
    </>
  );
};

export default React.memo(OrderDeliveryForm);
