import React, { useState } from "react";
import { saveAs } from "file-saver";

const CombinationGenerator = () => {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(20);
  const [combinationSize, setCombinationSize] = useState(3);

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
      // Exclude combinations that are all even
      const isAllEven = combination.every((num) => num % 2 === 0);

      // Exclude combinations that are all odd
      const isAllOdd = combination.every((num) => num % 2 !== 0);

      // Exclude combinations with 3 or more consecutive numbers
      const hasThreeConsecutive = combination.some(
        (_, i) =>
          i <= combination.length - 3 &&
          combination[i + 1] === combination[i] + 1 &&
          combination[i + 2] === combination[i] + 2
      );

      // Exclude combinations with 3 or more numbers in specific ranges
      const hasThreeInRange = (min, max) =>
        combination.filter((num) => num >= min && num <= max).length >= 3;

      // Exclude combinations with 3 or more numbers with the same ones digit
      const hasThreeInOnesPlace = Object.values(
        combination.reduce((acc, num) => {
          const ones = num % 10;
          acc[ones] = (acc[ones] || 0) + 1;
          return acc;
        }, {})
      ).some((count) => count >= 3);

      // Apply filtering rules
      return (
        !isAllEven &&
        !isAllOdd &&
        !hasThreeConsecutive &&
        !hasThreeInRange(1, 9) &&
        !hasThreeInRange(10, 19) &&
        !hasThreeInRange(20, 29) &&
        !hasThreeInRange(30, 39) &&
        !hasThreeInOnesPlace
      );
    });
  };

  const handleGenerate = () => {
    const numbers = Array.from(
      { length: end - start + 1 },
      (_, i) => i + start
    );
    const combinations = generateCombinations(numbers, combinationSize);
    const filteredCombinations = filterCombinations(combinations);

    // Convert to CSV
    const csvContent = filteredCombinations
      .map((combo) => combo.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "filtered_combinations.csv");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Combination Generator</h1>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Start Value:
          <input
            type="number"
            value={start}
            onChange={(e) => setStart(parseInt(e.target.value, 10))}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          End Value:
          <input
            type="number"
            value={end}
            onChange={(e) => setEnd(parseInt(e.target.value, 10))}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Combination Size:
          <input
            type="number"
            value={combinationSize}
            onChange={(e) => setCombinationSize(parseInt(e.target.value, 10))}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>
      <button onClick={handleGenerate}>Generate and Download CSV</button>
    </div>
  );
};

export default CombinationGenerator;
