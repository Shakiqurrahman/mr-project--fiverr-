import { useState } from "react";
import { useSelector } from "react-redux";
import CommentImagePreview from "../components/comment/CommentImagePreview";
import CommentSideDrawer from "../components/comment/CommentSideDrawer";

const CommentPage = ({ close }) => {
  const { projectDetails } = useSelector((state) => state.order);
  const [sideDrawer, setSideDrawer] = useState(true);
  return (
    <div className="fixed left-0 top-0 z-[999] flex h-screen w-full flex-wrap overflow-y-auto bg-black/70 md:flex-nowrap">
      <div
        className={`h-auto ${
          projectDetails?.projectStatus !== "Completed" &&
          projectDetails?.projectStatus !== "Canceled"
            ? "w-full md:h-full md:w-[calc(100%_-_320px)]"
            : "w-full"
        }`}
      >
        <CommentImagePreview
          close={close}
          drawer={sideDrawer}
          openDrawer={setSideDrawer}
        />
      </div>
      {projectDetails?.projectStatus !== "Completed" &&
        projectDetails?.projectStatus !== "Canceled" && (
          <div
            className={`w-full ${sideDrawer ? "block" : "hidden"} shrink-0 md:w-[320px]`}
          >
            <CommentSideDrawer close={close} drawerClose={setSideDrawer} />
          </div>
        )}
    </div>
  );
};

export default CommentPage;
