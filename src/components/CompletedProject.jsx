import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useGetAllProjectsQuery } from "../Redux/api/dashboardApiSlice";
import LeftArrowIcon from "../assets/images/icons/Left Arrow.svg";
import RightArrowIcon from "../assets/images/icons/Right Arrow.svg";
import CategoryLayout from "./categories/CategoryLayout";
import ProjectCard from "./categories/ProjectCard";

function CompletedProject() {
  const { data } = useGetAllProjectsQuery({ status: "Completed" });
  const settings = {
    dots: false,
    infinite: data?.length > 4 ? true : false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: data?.length > 4 ? true : false,
    autoplay: data?.length > 4 ? true : false,
    autoplaySpeed: 2000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          arrows: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="max-width">
      <CategoryLayout
        title={"Completed Projects"}
        path={"/all-completed-projects"}
      >
        {data?.length > 0 ? (
          <div>
            <Slider {...settings}>
              {data?.map((project, index) => (
                <ProjectCard
                  key={index}
                  thumbnail={project?.projectImage}
                  watermark={project?.projectImage}
                  clientLogo={project?.user?.image}
                  title={project?.projectName}
                  clientName={project?.user?.userName}
                  timeStamp={"5 days ago"}
                />
              ))}
            </Slider>
          </div>
        ) : (
          <div>No Completed Projects yet!</div>
        )}
      </CategoryLayout>
    </div>
  );
}

// Custom arrows design components
function NextArrow({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="slick-arrow absolute -right-[15px] top-[30%] z-10 flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full border before:content-none"
    >
      <img src={RightArrowIcon} alt="" />
    </div>
  );
}

function PrevArrow({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="slick-arrow absolute -left-[15px] top-[30%] z-10 flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full border before:content-none"
    >
      <img src={LeftArrowIcon} alt="" />
    </div>
  );
}

export default CompletedProject;
