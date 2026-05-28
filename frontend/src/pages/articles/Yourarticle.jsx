import React, { useEffect, useState } from "react";
import { baseUrl } from "../../constant/url";
import cover from "../../assets/cover.png";
import { FaTrash } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const YourArticle = ({id}) => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${baseUrl}/api/articles/userarticle/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setResults(data);
    };
    fetchData();
  });
//this function is to delete article
  const deleteArticle = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Article Delete successfully");
      const data = await res.json();
      console.log("Delete response:", res.status, data);
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setResults((prevResults) => prevResults.filter((a) => a._id !== id));
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 mt-5 mr-4 mb-4 ml-10 sm:ml-1">
      {results.map((article) => (
        <div key={article._id}>
          <div className="card bg-base-100 mb-4 w-70 sm:w-50 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] ml-5 mt-3 ">
            <figure className="w-70 sm:w-50 h-35 pt-5">
              <img
                src={`${article.img || cover}?v=${
                  article.updatedAt || Date.now()
                }`}
                alt={article.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = cover;
                }}
              />
            </figure>
            <div className="card-body bg-gray-300 pb-3">
              <h2 className="card-title text-1">
                {article.title}
                <div className="badge badge-secondary ">NEW</div>
              </h2>
              <p> {article.category}</p>
              <div className="card-actions justify-end">
                {authUser?._id === article.user._id && (
                  <div className="badge badge-outline bg-red-600">
                    <FaTrash
                      className="cursor-pointer text-black"
                      onClick={() => deleteArticle(article._id)}
                    />
                  </div>
                )}
                <div
                  className="badge badge-outline w-50 bg-green-600 cursor-pointer "
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                >
                  Read Now
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YourArticle;
