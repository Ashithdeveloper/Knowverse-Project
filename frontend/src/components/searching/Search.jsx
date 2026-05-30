import React, { useState } from "react";
import { baseUrl } from "../../constant/url";
import { Link } from "react-router-dom";
import { LuSearch } from "react-icons/lu";
const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handlesearch = async (e) => {
    const q = e.target.value;
    setQuery(q);

    if (q.trim() === "") {
      setResults([]);
      return;
    }
   
    try {
      const res = await fetch(`${baseUrl}/api/users/search?q=${q}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setResults(data);
      console.log(data);
    } catch (error) {
      console.log(error);
      console.error("Error fetching  users");
    }
  };
  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
       <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold"> Search</p>
      <form class="flex items-center max-w-sm mx-auto">
        <label for="simple-search" class="sr-only">
          Search
        </label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
              />
            </svg>
          </div>
          <input
           className="input border border-gray-700 rounded-3xl  input-md w-[320px] sm:w-[530px]  sm:mr-90 shadow-[0_3px_10px_rgb(0,0,0,0.2)] border-none focus:shadow-[0px_10px_1px_rgba(221,_221,_221,_1),_0_10px_20px_rgba(204,_204,_204,_1)]"
            type="text"
            placeholder="search username....."
            onChange={handlesearch}
            value={query}
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 "
            required
          />
        </div>
        <button
          type="submit"
          class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span class="sr-only">Search</span>
        </button>
      </form>
     </div>
      <div>
        {results.map((user) => (
          <li key={user._id} className="list-none ">
            <Link to={`/profile/${user.username}`}>
              <div className="flex gap-2 items-center ml-15 md:ml-19 mt-5 shadow-[0_3px_10px_rgb(0,0,0,0.2)] max-w-75 sm:max-w-140 pl-4 p-3 rounded-2xl  ">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={user.profileImg || "/boy2.png"} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold tracking-tight truncate w-28">
                    {user.fullName}
                  </span>
                  <span className="text-sm text-slate-500">
                    @{user.username}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </div>
    </div>
  );
};

export default Search;
