import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx"; // Import the xlsx library

const CombinationGenerator = () => {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(20);
  const [combinationSize, setCombinationSize] = useState(3);
  const [excludedNumber, setExcludedNumber] = useState(""); // State for excluded number

  const [filters, setFilters] = useState({
    excludeAllEvenNumbers: false,
    excludeAllOddNumbers: false,
    excludeThreeConsecutiveNumbers: false,
    excludeThreeNumbersInRangeBetween1to9: false,
    excludeThreenumbersInRangeBetween10to19: false,
    excludeThreeNumbersInRangeBetween20to29: false,
    excludeThreeNumbersInRangeBetween30to39: false,
    excludeSameOnesDigit: false,
    excludeThreeNumbersInRangeOfFive: false,
  });

  const generateCombinations = (arr, size) => {
    const results = [];
    const combine = (path, index) => {
      if (path.length === size) {
        results.push([...path]);
        return;
      }
      for (let i = index; i < arr.length; i++) {
        combine([...path, arr[i]], i + 1);
      }
    };
    combine([], 0);
    return results;
  };

  const filterCombinations = (combinations) => {
    return combinations.filter((combination) => {
      const isAllEven = combination.every((num) => num % 2 === 0);
      const isAllOdd = combination.every((num) => num % 2 !== 0);

      // Check if there's any odd number
      const hasAnyOdd = combination.some((num) => num % 2 !== 0);

      const hasThreeConsecutive = combination.some(
        (_, i) =>
          i <= combination.length - 3 &&
          combination[i + 1] === combination[i] + 1 &&
          combination[i + 2] === combination[i] + 2
      );

      const hasThreeInRange = (min, max) =>
        combination.filter((num) => num >= min && num <= max).length >= 3;

      const hasThreeInOnesPlace = Object.values(
        combination.reduce((acc, num) => {
          const ones = num % 10;
          acc[ones] = (acc[ones] || 0) + 1;
          return acc;
        }, {})
      ).some((count) => count >= 3);

      const hasThreeInFiveRange = combination.some((num, index) => {
        const range = combination.filter(
          (otherNum) => otherNum >= num && otherNum < num + 5
        );
        return range.length >= 3;
      });

      const containsExcludedNumber = combination.includes(
        Number(excludedNumber)
      );

      return (
        !containsExcludedNumber &&
        (!filters.excludeAllEvenNumbers || !isAllEven) &&
        (!filters.excludeAllOddNumbers || !hasAnyOdd) &&
        (!filters.excludeThreeConsecutiveNumbers || !hasThreeConsecutive) &&
        (!filters.excludeThreeNumbersInRangeBetween1to9 ||
          !hasThreeInRange(1, 9)) &&
        (!filters.excludeThreenumbersInRangeBetween10to19 ||
          !hasThreeInRange(10, 19)) &&
        (!filters.excludeThreeNumbersInRangeBetween20to29 ||
          !hasThreeInRange(20, 29)) &&
        (!filters.excludeThreeNumbersInRangeBetween30to39 ||
          !hasThreeInRange(30, 39)) &&
        (!filters.excludeSameOnesDigit || !hasThreeInOnesPlace) &&
        (!filters.excludeThreeNumbersInRangeOfFive || !hasThreeInFiveRange)
      );
    });
  };

  const handleGenerateCSV = () => {
    const numbers = Array.from(
      { length: end - start + 1 },
      (_, i) => i + start
    );
    const combinations = generateCombinations(numbers, combinationSize);
    const filteredCombinations = filterCombinations(combinations);

    const csvContent = filteredCombinations
      .map((combo) => combo.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "filtered_combinations.csv");
  };

  const handleGenerateExcel = () => {
    // Generate an array of numbers between start and end
    const numbers = Array.from(
      { length: end - start + 1 },
      (_, i) => i + start
    );

    // Generate all combinations
    const combinations = generateCombinations(numbers, combinationSize);

    // Filter combinations based on the selected filters
    const filteredCombinations = filterCombinations(combinations);

    // Ensure the filtered combinations are in a 2D array format
    // `filteredCombinations` should be an array of arrays
    const excelData = filteredCombinations.map((combo) => {
      return combo; // Each combination is an array, so no need to modify
    });

    // Create a worksheet from the filtered combinations
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Combinations");

    // Write the Excel file and trigger the download
    XLSX.writeFile(wb, "filtered_combinations.xlsx");
  };

  const handleCheckboxChange = (filter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-10 bg-gray-50">
      <div className="w-full lg:w-[45%] bg-white p-10 rounded-2xl">
        <h1 className="font-semibold text-xl mb-7">Combination Generator</h1>

        {/* Start and End Value Inputs */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="startValue" className="text-sm font-medium">
            Start Value:
          </label>
          <input
            type="number"
            id="startValue"
            value={start}
            min={0}
            onChange={(e) => setStart(parseInt(e.target.value, 10))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
        </div>

        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="endValue" className="text-sm font-medium">
            End Value:
          </label>
          <input
            type="number"
            id="endValue"
            value={end}
            min={1}
            onChange={(e) => setEnd(parseInt(e.target.value, 10))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
        </div>

        {/* Combination Size Input */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="combSize" className="text-sm font-medium">
            Combination Size:
          </label>
          <input
            type="number"
            id="combSize"
            min={1}
            value={combinationSize}
            onChange={(e) => setCombinationSize(parseInt(e.target.value, 10))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
        </div>

        {/* Excluded Number Input */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="excludedNumber" className="text-sm font-medium">
            Exclude Number:
          </label>
          <input
            type="number"
            id="excludedNumber"
            value={excludedNumber}
            onChange={(e) => setExcludedNumber(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
        </div>

        {/* Filters Section */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Apply Filters</h3>
        <div className="w-full">
          {Object.keys(filters).map((filterKey) => {
            const labels = {
              excludeAllEvenNumbers:
                "Exclude combinations that are all even numbers",
              excludeAllOddNumbers:
                "Exclude combinations that are all odd numbers",
              excludeThreeConsecutiveNumbers:
                "Exclude all combinations that contain 3 or more consecutive numbers",
              excludeThreeNumbersInRangeBetween1to9:
                "Exclude all combinations that contain 3 or more numbers between 1 and 9",
              excludeThreenumbersInRangeBetween10to19:
                "Exclude all combinations that contain 3 or more numbers between 10-19",
              excludeThreeNumbersInRangeBetween20to29:
                "Exclude all combinations that contain 3 or more numbers between 20-29",
              excludeThreeNumbersInRangeBetween30to39:
                "Exclude all combinations that contain 3 or more numbers between 30-39",
              excludeSameOnesDigit:
                "Exclude all combinations that contain 3 or more numbers with the same digit in the ones place (e.g., 7, 17, 27, etc.)",
              excludeThreeNumbersInRangeOfFive:
                "Exclude all combinations that contain 3 numbers within any range of 5 consecutive numbers",
            };

            const filterLabel = labels[filterKey] || filterKey;

            return (
              <div key={filterKey} className="my-2">
                <label className="flex items-start justify-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters[filterKey]}
                    onChange={() => handleCheckboxChange(filterKey)}
                    className="w-3.5 h-3.5 border mt-0.5 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  />
                  {filterLabel}
                </label>
              </div>
            );
          })}
        </div>

        {/* Generate Buttons */}
        <div className="w-full mt-4 flex gap-4">
          <button
            onClick={handleGenerateCSV}
            className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Generate and Download CSV
          </button>
          <button
            onClick={handleGenerateExcel}
            className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Generate and Download Excel File
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombinationGenerator;
