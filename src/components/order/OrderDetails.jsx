import { Fragment, useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const OrderDetails = () => {
  const { projectDetails, clientDetails } = useSelector((state) => state.order);

  // all states here
  const [items, setItems] = useState([]);
  const [startTime, setStartTime] = useState("Not determined");
  const [deliveryTime, setDeliveryTime] = useState("Not determined");

  // all side effects here
  useEffect(() => {
    if (projectDetails) {
      if (projectDetails?.isRequirementsFullFilled) {
        const start = new Date(projectDetails?.startDate).toLocaleDateString(
          [],
          {
            month: "short",
            day: "numeric",
          },
        );
        const starttime = new Date(
          projectDetails?.startDate,
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const end = new Date(projectDetails?.deliveryDate).toLocaleDateString(
          [],
          {
            month: "short",
            day: "numeric",
          },
        );
        const endtime = new Date(
          projectDetails?.deliveryDate,
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setStartTime(start + ", " + starttime);
        setDeliveryTime(end + ", " + endtime);
      }
    }
  }, [projectDetails]);

  useEffect(() => {
    if (projectDetails) {
      setItems(projectDetails?.items);
    }
  }, [projectDetails]);

  const totalQuantity = items?.reduce(
    (accumulator, item) =>
      accumulator + parseInt(item?.selectedQuantity || item?.quantity),
    0,
  );
  const totalDuration = items?.reduce((accumulator, item) => {
    let duration = item?.isFastDelivery
      ? parseInt(item?.fastDeliveryDuration || item?.fastDeliveryDays)
      : parseInt(item?.deliveryDuration || item?.regularDeliveryDays);
    return accumulator + duration;
  }, 0);
  const totalAmount = items?.reduce((accumulator, item) => {
    let price = parseInt(item?.subCategory?.subAmount || item?.subTotal);
    if (item.isFastDelivery) {
      price += parseInt(item?.fastDeliveryAmount || item?.fastDeliveryPrice);
    }
    return accumulator + price;
  }, 0);

  return (
    <>
      <h1 className="mb-5 text-xl font-bold text-primary">PROJECT DETAILS</h1>
      <p className="mb-2">
        Project started by{" "}
        <span className="font-semibold">{clientDetails?.userName}</span>
      </p>
      <p className="mb-2">
        The project has started {startTime} - The project will be completed{" "}
        {deliveryTime}
      </p>
      <p className="mb-2">
        Project number{" "}
        <span className="font-semibold">{projectDetails?.projectNumber}</span>
      </p>
      <div className="overflow-x-auto">
        <div className="flex min-w-[600px] flex-col border border-gray-300">
          <div className="flex items-center font-semibold">
            <div className="w-3/6 shrink-0 border-b p-3">Item</div>
            <div className="w-1/6 shrink-0 border-b border-l border-gray-300 p-3 text-center">
              QTY
            </div>
            <div className="w-1/6 shrink-0 border-b border-l border-gray-300 p-3 text-center">
              DUR
            </div>
            <div className="w-1/6 shrink-0 border-b border-l border-gray-300 p-3 text-center">
              Price
            </div>
          </div>
          {items?.map((item, index) => (
            <Fragment key={index}>
              <div className="flex">
                <div className="w-3/6 shrink-0 border-b p-3">
                  {item?.title && item?.designId && (
                    <Link
                      to={`/design/${item?.designId}`}
                      className="font-semibold text-primary underline"
                    >
                      {item?.title}
                    </Link>
                  )}
                  <h1 className="text-lg font-medium">
                    {item?.category?.categoryName || item?.categoryName}
                  </h1>
                  <p className="text-black/80">
                    {item?.subCategory.subTitle || item?.subCategory}
                  </p>
                </div>
                <div className="w-1/6 shrink-0 border-b border-l border-gray-300 p-3 text-center font-medium">
                  {item?.selectedQuantity || item?.quantity}
                </div>
                <div className="w-1/6 shrink-0 border-b border-l border-gray-300 p-3 text-center font-medium">
                  {item?.deliveryDuration || item?.regularDeliveryDays}
                </div>
                <div className="w-1/6 shrink-0 border-b border-l border-gray-300 p-3 text-center font-medium">
                  {item?.subCategory?.subAmount || item?.subTotal}
                </div>
              </div>
              {item?.isFastDelivery && (
                <div className="flex items-center border-b border-gray-300">
                  <div className="w-5/6 shrink-0 p-3">
                    Extra-fast{" "}
                    {item?.fastDeliveryDuration || item?.fastDeliveryDays}-day
                    delivery
                  </div>
                  <div className="w-1/6 shrink-0 p-3 text-center font-medium">
                    ${item?.fastDeliveryAmount || item?.fastDeliveryPrice}
                  </div>
                </div>
              )}
              {item?.bulletPoints?.length > 0 && (
                <ul className="border-b border-gray-300 px-3 py-4">
                  {item?.bulletPoints?.map((bullet, index) => (
                    <li key={index} className="my-1 flex items-center gap-2">
                      <FaCircleCheck className="text-primary" /> {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </Fragment>
          ))}
          <div className="flex items-center font-semibold">
            <div className="w-3/6 shrink-0 p-3">Total</div>
            <div className="w-1/6 shrink-0 border-l border-gray-300 p-3 text-center">
              {totalQuantity}
            </div>
            <div className="w-1/6 shrink-0 border-l border-gray-300 p-3 text-center">
              {totalDuration} days
            </div>
            <div className="w-1/6 shrink-0 border-l border-gray-300 p-3 text-center">
              ${totalAmount}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
