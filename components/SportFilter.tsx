import React from 'react';

const sports = ['Basketball', 'Football', 'Baseball', 'Swimming', 'Boxing', 'UFC'];

export default function SportFilter() {
  return (
    <div className="sticky bg-gray-50 dark:bg-gray-800 shadow-md rounded-lg p-4 w-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Filter by Sport</h3>
      <ul className="space-y-2.5">
        {sports.map((sport) => (
          <li key={sport}>
            <button className="w-full text-left px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-800 dark:text-gray-200 font-medium">
              {sport}
            </button>
          </li>
        ))}
        <li>
          <button className="w-full text-left px-4 py-2.5 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-md transition-colors text-blue-800 dark:text-blue-200 font-medium mt-4">
            All Sports
          </button>
        </li>
      </ul>
    </div>
  );
}