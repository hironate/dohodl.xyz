import { useEffect, useState } from "react";

function usePagination(data: any[], itemsPerPage = 4) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentPageData = data.slice(startIdx, startIdx + itemsPerPage);

  // Function to set page
  const setPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  return {
    currentPageData,
    setPage,
    currentPage,
    totalPages,
  };
}

export default usePagination;
