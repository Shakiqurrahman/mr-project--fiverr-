import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import LeftArrowIcon from "../assets/images/icons/Left Arrow.svg";
import RightArrowIcon from "../assets/images/icons/Right Arrow.svg";
import ProjectCard from "./categories/ProjectCard";

function RelatedDesigns({
  isFolder,
  bgColor,
  color,
  items,
  relatedFolders,
  relatedDesigns,
}) {
  const settings = {
    dots: false,
    infinite:
      items?.length > 4 ||
      relatedFolders?.length > 4 ||
      relatedDesigns?.length > 4
        ? true
        : false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    className: "related-cards",
    arrows:
      items?.length > 4 ||
      relatedFolders?.length > 4 ||
      relatedDesigns?.length > 4
        ? true
        : false,
    autoplay:
      items?.length > 4 ||
      relatedFolders?.length > 4 ||
      relatedDesigns?.length > 4
        ? true
        : false,
    autoplaySpeed: 2000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite:
            items?.length > 3 ||
            relatedFolders?.length > 3 ||
            relatedDesigns?.length > 3
              ? true
              : false,
          autoplay:
            items?.length > 3 ||
            relatedFolders?.length > 3 ||
            relatedDesigns?.length > 3
              ? true
              : false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite:
            items?.length > 2 ||
            relatedFolders?.length > 2 ||
            relatedDesigns?.length > 2
              ? true
              : false,
          autoplay:
            items?.length > 2 ||
            relatedFolders?.length > 2 ||
            relatedDesigns?.length > 2
              ? true
              : false,
        },
      },
      {
        breakpoint: 576,
        settings: {
          arrows: false,
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite:
            items?.length > 2 ||
            relatedFolders?.length > 2 ||
            relatedDesigns?.length > 2
              ? true
              : false,
          autoplay:
            items?.length > 3 ||
            relatedFolders?.length > 2 ||
            relatedDesigns?.length > 2
              ? true
              : false,
        },
      },
    ],
  };

  return (
    <div className={`${bgColor ? bgColor : "bg-lightskyblue"} relative -mb-5`}>
      <div className="max-width mt-10 py-10">
        <h1
          className={`${
            color ? color : "text-primary"
          } text-center text-2xl font-bold`}
        >
          Related Designs
        </h1>
        <div className="mt-8">
          {items &&
            (items?.length > 0 ? (
              <Slider {...settings}>
                {items?.map((design, i) => {
                  const thumbnail = design?.images?.find((d) => d.thumbnail);
                  return (
                    <ProjectCard
                      folder={isFolder}
                      key={i}
                      thumbnail={thumbnail?.url}
                      watermark={thumbnail?.watermark}
                      thumbnailName={thumbnail?.name}
                      title={design.title}
                      slug={`/design/${design?.designId}`}
                    />
                  );
                })}
              </Slider>
            ) : (
              <div className="text-center">No Related Designs Found</div>
            ))}
          {relatedFolders &&
            (relatedFolders?.length > 0 ? (
              <Slider {...settings}>
                {relatedFolders?.map((folder, idx) => {
                  const subFolder = folder?.subFolders[0];
                  const thumbnail = subFolder?.images?.filter(
                    (img) => img?.thumbnail === true,
                  )[0];
                  return (
                    <ProjectCard
                      folder={isFolder}
                      key={idx}
                      thumbnail={thumbnail?.url}
                      watermark={thumbnail?.watermark}
                      title={subFolder?.subFolder}
                      thumbnailName={subFolder?.title}
                      slug={`/categories/${folder.slug}/`}
                    />
                  );
                })}
              </Slider>
            ) : (
              <div className="text-center">No Related Designs Found</div>
            ))}
          {relatedDesigns &&
            (relatedDesigns?.length > 0 ? (
              <Slider {...settings}>
                {relatedDesigns?.map((folder, idx) => {
                  const subFolder = folder?.subFolder;
                  const thumbnail = subFolder?.images?.filter(
                    (img) => img?.thumbnail === true,
                  )[0];
                  return (
                    <ProjectCard
                      folder={isFolder}
                      key={idx}
                      thumbnail={thumbnail?.url}
                      watermark={thumbnail?.watermark}
                      title={subFolder?.subFolder}
                      thumbnailName={subFolder?.title}
                      slug={`/designs/${folder.slug}/${subFolder.subFolderSlug}`}
                    />
                  );
                })}
              </Slider>
            ) : (
              <div className="text-center">No Related Designs Found</div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Custom arrows design components
function NextArrow({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="slick-arrow absolute -right-[15px] top-[35%] z-10 flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full border before:content-none"
    >
      <img src={RightArrowIcon} alt="" />
    </div>
  );
}

function PrevArrow({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="slick-arrow absolute -left-[15px] top-[35%] z-10 flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full border before:content-none"
    >
      <img src={LeftArrowIcon} alt="" />
    </div>
  );
}

export default RelatedDesigns;
