import React, { useEffect, useState } from 'react';
import Header from './Header';
import supabase from '../lib/supabase';

const Notifications = () => {


  return (
    <div className="p-4 sm:p-6 bg-[#0F1117] text-white min-h-screen">
      <Header />
      <div className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-[#0F1117] p-4 sm:p-8 space-y-6 sm:space-y-8">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>

       

      


       

      </div>
    </div>
  );
};

export default Notifications;
