 "use client"
 import React from 'react' 
 import { useState } from 'react' 

 export default function page() {
   const [isOpen , setIsOpen] = useState(false) ;
   const openModal = function() {
     setIsOpen(true) ;
   }

  return (

    <div className="container mx-auto p-20">

       <div className="flex justify-between items-center">
        <div><p className="text-lg font-bold text-black">العملاء</p></div>
        <div>
           <button onClick={openModal} className="text-lg font-bold text-black bg-blue-300 hover:bg-blue-400 px-3 py-1 rounded-lg">اضافة عميل</button>
        </div>
       </div>

       <div className="grid grid-cols-4 gap-4 mt-10">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-bold text-black">اجمالي العملاء</p>
          <p className='text-black'>11</p>
        </div>
        {/* ------------------------------------------------------------------------------------ */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-bold text-black">اشتراكات فعالة</p>
          <p className='text-black'>11</p>
        </div>
          {/* ------------------------------------------------------------------------------------ */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-bold text-black">اشتراكات منتهية</p>
          <p className='text-black'>11</p>
        </div>
        {/* ------------------------------------------------------------------------------------ */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-bold text-black">قيد الاجراء</p>
          <p className='text-black'>11</p>
        </div>
       </div> 

       <div></div>
       <div></div>

 {/* ------------------------ Modal ---------------------------  */}
     {isOpen && (
       <div>
         <div>
           fffffafaf
         </div>
       </div>
     )}
    </div>


  )
}   
