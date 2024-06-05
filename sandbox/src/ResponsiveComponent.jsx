import React from "react";
import DataTable from "react-data-table-component";

const data = [
  { id: 1, title: "Conan the Barbarian", year: "1982" },
  { id: 2, title: "The Terminator", year: "1984" },
  { id: 3, title: "Predator", year: "1987" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
  { id: 4, title: "Total Recall", year: "1990" },
];

const columns = [
  { name: "Title", selector: (row) => row.title, sortable: true },
  { name: "Year", selector: (row) => row.year, sortable: true },
];

const ResponsiveComponent = () => (
  <div className="responsive">
    <h3>Responsive Component with Data Table</h3>
    <DataTable columns={columns} data={data} pagination />
  </div>
);

export default ResponsiveComponent;
