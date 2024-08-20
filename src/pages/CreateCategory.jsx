import React, { useState } from 'react';
import { ImPlus } from "react-icons/im";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBin6Line } from "react-icons/ri";

// CreateCategory Component
function CreateCategory() {
  // Form State
  const [form, setForm] = useState({
    categoryName: "",
    categoryImage: "", 
  });

  const [subCategory, setSubcategory] = useState([{
    title: "",
    amount: "",
    regularDeliveryDays: "",
    fastDeliveryDays: "",
    fdAmount: "",
  }]);

  const addSubcategory = () => {
    setSubcategory([...subCategory, {
      title: "",
      amount: "",
      regularDeliveryDays: "",
      fastDeliveryDays: "",
      fdAmount: "",
    }]);
  };

  const [bullets, setBullets] = useState([
    "Unlimited Revision", 
    "PSD Source file", 
  ]);

  const [newBullet, setNewBullet] = useState("");

  const [requirements, setRequirements] = useState([
    "Which industry do you work in?", 
    "Do you have your own company logo?",
    ""
  ]);

  const handleChange = (e, index) => {
    if (index !== undefined) {
      const updatedSubCategories = [...subCategory];
      updatedSubCategories[index] = { ...updatedSubCategories[index], [e.target.name]: e.target.value };
      setSubcategory(updatedSubCategories);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, categoryImage: file });
  };

  const addBullet = () => {
    if (newBullet.trim() === "") return; 
    setBullets([...bullets, newBullet]);
    setNewBullet("");
  };

  const removeBullet = (index) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  const createBulletEventHandler = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBullet();
    }
  };

  const addRequirements = () => {
    setRequirements([...requirements, ""]);
  };

  const deleteRequirements = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      form,
      subCategory,
      bullets,
      requirements: requirements.filter(req => req.trim() !== "")
    };
    console.log(data);
  };

  return (
    <div className="max-width mt-10 sm:mt-20">
      <form className="w-full max-w-[800px] mx-auto">

        {/* Category */}
        <div className="bg-lightskyblue mt-10">
          <h1 className="bg-primary text-white p-3">Category</h1>
          <div className='p-3'>
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              placeholder='Category Name'
              className="bg-white block w-full p-2 border border-solid border-[#e7e7e7] mt-3 outline-none"
              required
            />
            <p className="text-red-600 text-xs mt-2 px-2 hidden">
              There was an error!
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="bg-lightskyblue mt-10">
          <h1 className="bg-primary text-white p-3">Image</h1>
          <input type="file" name="image" id="image" className='file-input' onChange={handleFileChange} />
          <p className="text-red-600 text-xs mt-2 px-2 hidden">
            There was an error!
          </p>
        </div>

        {/* Subcategory */}
        <div className="bg-lightskyblue mt-5">
          <div className='bg-primary text-white p-3 flex items-center justify-between'>
            <h1 className="">Subcategory</h1>
            <ImPlus onClick={addSubcategory} />
          </div>
          <div className="p-3">
            {subCategory.map((input, index) => (
              <SubCategory
                key={index}
                input={input}
                index={index}
                handleChange={handleChange}
                subCategoryLength={subCategory.length}
              />
            ))}
          </div>
        </div>

        {/* Bullets */}
        <div className="bg-lightskyblue mt-5">
          <h1 className="bg-primary text-white p-3">Bullet Point</h1>
          <div className="p-3">
            <div className='flex flex-wrap mt-2 gap-2'>
              {bullets.map((bullet, index) => (
                <small key={index} className='flex items-center gap-2 bg-white p-2 rounded-sm'>
                  {bullet} 
                  <RxCross2 className='text-red-600' onClick={() => removeBullet(index)} />
                </small>
              ))}
              <input 
                type="text" 
                placeholder='Add new bullet'
                value={newBullet}
                onChange={(e) => setNewBullet(e.target.value)}
                onKeyDown={createBulletEventHandler}
                className='bg-transparent focus:outline-none'
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-lightskyblue mt-5">
          <div className='bg-primary text-white p-3 flex justify-between'>
            <h1 className="">Requirements</h1>
            <ImPlus onClick={addRequirements} />
          </div>
          <div className="p-3">
            {requirements.map((requirement, index) => (
              <div key={index} className='flex items-center gap-2 mb-2'>
                <input
                  type="text"
                  placeholder='Type'
                  value={requirement}
                  onChange={(e) => {
                    const newRequirements = [...requirements];
                    newRequirements[index] = e.target.value;
                    setRequirements(newRequirements);
                  }}
                  className='bg-white block w-full p-2 border border-solid border-[#e7e7e7] outline-none'
                />
                <RiDeleteBin6Line
                  className='text-gray-500 cursor-pointer'
                  onClick={() => deleteRequirements(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="p-3 text-center text-white bg-primary rounded-3xl w-1/2 mx-auto block mt-5"
          onClick={handleSubmit}>
          Update
        </button>
      </form>
    </div>
  );
}

// SubCategory Component
function SubCategory({ input, index, handleChange, subCategoryLength }) {
  return (
    <div key={index}>
      <input
        type="text"
        name="title"
        value={input.title}
        onChange={(e) => handleChange(e, index)}
        placeholder='Subcategory Title'
        className="bg-white block w-full p-2 border border-solid border-[#e7e7e7] mt-3 outline-none"
        required
      />
      <p className="text-red-600 text-xs mt-2 px-2 hidden">
        There was an error!
      </p>
      <input
        type="text"
        name="amount"
        value={input.amount}
        onChange={(e) => handleChange(e, index)}
        placeholder='Subcategory Amount'
        className="bg-white block w-full p-2 border border-solid border-[#e7e7e7] mt-3 outline-none"
        required
      />
      <p className="text-red-600 text-xs mt-2 px-2 hidden">
        There was an error!
      </p>
      <input
        type="text"
        name="regularDeliveryDays"
        value={input.regularDeliveryDays}
        onChange={(e) => handleChange(e, index)}
        placeholder='Regular Delivery Days'
        className="bg-white block w-full p-2 border border-solid border-[#e7e7e7] mt-3 outline-none"
        required
      />
      <p className="text-red-600 text-xs mt-2 px-2 hidden">
        There was an error!
      </p>
      <div className='flex'>
        <input
          type="text"
          name="fastDeliveryDays"
          value={input.fastDeliveryDays}
          onChange={(e) => handleChange(e, index)}
          placeholder='Fast Delivery Days'
          className="bg-white block w-full flex-grow p-2 border border-solid border-[#e7e7e7] mt-3 outline-none"
          required
        />
        <input
          type="text"
          name="fdAmount"
          value={input.fdAmount}
          onChange={(e) => handleChange(e, index)}
          placeholder='F.D. Amount'
          className="bg-white block w-56 p-2 border border-solid border-[#e7e7e7] mt-3 outline-none"
          required
        />
      </div>
      <p className="text-red-600 text-xs mt-2 px-2 hidden">
        There was an error!
      </p>

      {/* Conditionally render the divider */}
      {index !== subCategoryLength - 1 && (
        <div className="border-b border-gray-300 my-4" />
      )}
    </div>
  );
}

export default CreateCategory;