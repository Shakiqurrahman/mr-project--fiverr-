import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Cards from "../assets/images/card.png";
import Check from "../assets/svg/Check";
import { ToggleSwitch } from "../libs/ToggleSwitch";

const PaymentPage = () => {
  const { state } = useLocation();
  console.log(state);
  const [fastDelivery, setFastDelivery] = useState(
    state?.isFastDelivery || false,
  );
  const [cards, setCards] = useState([
    {
      id: 1,
      title: "Card 1",
      cardNumber: "4532 1234 5678 9012",
      expirationDate: "12/24",
      cvv: "123",
    },
  ]);
  // for saving card details
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [designs, setDesigns] = useState(state || []);

  const totalAmount = fastDelivery
    ? parseInt(designs.subTotal) + parseInt(designs.fastDeliveryAmount)
    : parseInt(designs.subTotal) || 0;

  return (
    <section className="max-width my-10">
      <h1 className="mb-10 text-center text-lg font-semibold sm:text-[28px]">
        Add your card details carefully
      </h1>
      <div className="mx-auto max-w-[800px] border">
        <div className="bg-sky-200/60 p-4 sm:p-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <img
                className="w-32"
                src={designs?.image?.url}
                alt={designs?.image?.name}
              />
              <h2 className="text-xl font-semibold">{designs?.categoryName}</h2>
            </div>
            <p>Quantity-{designs?.selectedQuantity} </p>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p>Double Sided Design</p>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                isChecked={fastDelivery}
                onToggle={() => setFastDelivery(!fastDelivery)}
              />
              <p>
                Extra-fast {designs?.fastDeliveryDuration}-day delivery
                <span className="text-lg font-semibold text-primary">
                  {" "}
                  ${designs?.fastDeliveryAmount}
                </span>
              </p>
            </div>
            <h3 className="text-3xl font-bold">${totalAmount}</h3>
          </div>
        </div>
        <div className="bg-lightskyblue p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
            <h2 className="text-xl font-semibold">Card Payment</h2>
            <img src={Cards} className="h-[40px]" alt="" />
          </div>
          <p>
            Your credit card information ia secure, and your card is not charged
            until after you've confirmed your order. Adding a new card?
          </p>

          {/* card form  */}
          <form className="mt-10 space-y-8">
            <div>
              <p className="mb-1 ml-2">Card Details</p>
              <select
                className="w-full border p-4 font-medium outline-none"
                name="card-details"
                id="card-details"
              >
                <option value="Add New Card">Add New Card</option>
                {cards.map((card) => (
                  <option key={card?.id} value={card.title}>
                    {card.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1 ml-2">Name on Card</p>
              <input
                type="text"
                className="w-full border p-4 outline-none"
                placeholder="Name on Card"
              />
            </div>
            <div>
              <p className="mb-1 ml-2">Card Number</p>
              <input
                type="number"
                className="w-full border p-4 outline-none"
                placeholder="Card Number"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3/5">
                <p className="mb-1 ml-2">Expiry Date</p>
                <input
                  type="text"
                  className="w-full border p-4 outline-none"
                  placeholder="MM/YY"
                />
              </div>
              <div className="w-2/5">
                <p className="mb-1 ml-2">CVV</p>
                <input
                  type="number"
                  className="w-full border p-4 outline-none"
                  placeholder="CVV"
                />
              </div>
            </div>

            {/* checkbox for saving card details  */}
            <div className="flex items-center gap-x-2 text-sm font-medium sm:text-base">
              <input
                type="checkbox"
                name="extraDelivery"
                id="extraDelivery"
                className={"is-checked peer"}
                onChange={() => setIsSavingCard(!isSavingCard)}
                checked={isSavingCard}
                hidden
              />
              <label
                htmlFor="extraDelivery"
                className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center border border-solid border-primary bg-white *:opacity-0 peer-[.is-checked]:peer-checked:*:opacity-100 sm:h-[20px] sm:w-[20px]"
              >
                <Check className="h-[8px] sm:h-[10px]" />
              </label>
              Save this card information
            </div>

            {/* payment details  */}
            <div className="border bg-white p-4">
              <ul className="w-full space-y-3 [&>li:last-child]:border-t">
                <li className="flex justify-between gap-2">
                  <p>{designs?.categoryName}</p>
                  <span className="font-bold">${designs?.subTotal}</span>
                </li>
                {fastDelivery && (
                  <li className="flex justify-between gap-2">
                    <p>
                      Extra-fast {designs?.fastDeliveryDuration}-day delivery
                    </p>
                    <span className="font-bold">
                      ${designs?.fastDeliveryAmount}
                    </span>
                  </li>
                )}
                <li className="flex justify-between gap-2 pt-4">
                  <p className="font-semibold">Total</p> <span className="font-bold">{totalAmount}</span>
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
