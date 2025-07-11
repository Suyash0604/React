import React from 'react'
import { useNavigate } from 'react-router-dom'

const Products = () => {
  const navigate = useNavigate();
  const NavigateHandler = (name) => {
    navigate(`/Products/ProductDetails/${name}`);
  }
  return (
    <div className='mt-9 flex gap-8'>
      <div className='px-11 text-center py-6 w-fit text-[var(--color-darkest)]  rounded-xl bg-[var(--color-light)]'>
        <h1 className='text-3xl mb-4 font-bold'>Product 1</h1>
        <button onClick={()=> NavigateHandler("Product 1")} className='py-3 px-4 bg-[var(--color-darkest)] text-[var(--color-light)] rounded'>See Details</button>
      </div>  
      <div className='px-11 text-center py-6 w-fit text-[var(--color-darkest)]  rounded-xl bg-[var(--color-light)]'>
        <h1 className='text-3xl mb-4 font-bold'>Product 2</h1>
        <button onClick={()=> NavigateHandler("Product 2")} className='py-3 px-4 bg-[var(--color-darkest)] text-[var(--color-light)] rounded'>See Details</button>
      </div>
      <div className='px-11 text-center py-6 w-fit text-[var(--color-darkest)]  rounded-xl bg-[var(--color-light)]'>
        <h1 className='text-3xl mb-4 font-bold'>Product 3</h1>
        <button onClick={()=> NavigateHandler("Product 3")} className='py-3 px-4 bg-[var(--color-darkest)] text-[var(--color-light)] rounded'>See Details</button>
      </div>
    </div>
  )
}

export default Products