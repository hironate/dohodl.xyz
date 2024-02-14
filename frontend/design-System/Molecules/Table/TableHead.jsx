const TableHead = ({ columns }) => {
  return (
    <thead className="bg-indigo-100 ">
      <tr>
        {columns.map(({ heading }) => (
          <th
            key={heading}
            scope="col"
            className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase "
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHead;
