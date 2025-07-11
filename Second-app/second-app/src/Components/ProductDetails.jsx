import React from "react";
import { useNavigate, useParams } from 'react-router-dom'

const ProductDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const NavigateHandler = () => {
    navigate(-1);
  };
  return (
    <div className="px-11 text-center py-6 w-fit text-[var(--color-darkest)]  rounded-xl bg-[var(--color-light)]">
      <h1 className="text-3xl mb-4 font-bold">{params.name}</h1>
      <p className=" mb-3 font-medium">Product Details</p>
      <button
        onClick={NavigateHandler}
        className="py-3 px-4 bg-[var(--color-darkest)] text-[var(--color-light)] rounded"
      >
        Go Back
      </button>
    </div>
  );
};

export default ProductDetails;
