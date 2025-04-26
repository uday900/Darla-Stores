import React from 'react';

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  // Function to go to a specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Function to handle "Next" button
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle "Previous" button
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers with ellipsis if needed
  const pageNumbers = () => {
    const range = [];
    const leftEllipsis = currentPage > 3;
    const rightEllipsis = currentPage < totalPages - 2;

    if (leftEllipsis) range.push(1);
    if (leftEllipsis) range.push("...");
    if (currentPage > 1) range.push(currentPage - 1);
    range.push(currentPage);
    if (currentPage < totalPages) range.push(currentPage + 1);
    if (rightEllipsis) range.push("...");
    if (rightEllipsis) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex justify-center mt-4 left-0">
      <ul className="flex flex-wrap items-center space-x-2 max-w-max md:w-full">
        {/* Previous Button */}
        <li>
          <button
            onClick={prevPage}
            className="px-4 py-2 bg-gray-200 rounded-md border border-gray-400 text-sm cursor-pointer hover:bg-gray-300"
            disabled={currentPage === 1}
          >
            &lt; Prev
          </button>
        </li>

        {/* Page Numbers */}
        {pageNumbers().map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="px-4 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => goToPage(page)}
                className={`px-4 py-2 border rounded-md ${
                  page === currentPage
                    ? "bg-blue-500 text-white text-sm cursor-pointer hover:bg-blue-600"
                    : "bg-gray-200 text-gray-700 text-sm cursor-pointer hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={nextPage}
            className="px-4 py-2 bg-gray-200 rounded-md border border-gray-400 text-sm cursor-pointer hover:bg-gray-300"
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Pagination;
