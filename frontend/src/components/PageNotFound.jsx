import React from 'react';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-9xl font-black text-gray-300">404</h1>
      
      <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mt-4">
        Uh-oh!
      </p>

      <p className="mt-4 text-gray-500">
        We can't find that page. It might have been moved or deleted.
      </p>

      <a
        href="/"
        className="mt-6 inline-block rounded bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring"
      >
        Go Back Home
      </a>
    </div>
  );
};

export default NotFound;