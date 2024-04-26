import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const data = [
  {
    id: "m5gr84i9",
    name: "My little poem",
    creationDate: "Apr 25, 2024",
    shared: "Zk23raf...",
  },
  {
    id: "3u1reuv4",
    name: "How to cook",
    creationDate: "Apr 25, 2024",
    shared: "Zk23raf...",
  },
  {
    id: "derv1ws0",
    name: "when the sun goes down",
    creationDate: "Apr 25, 2024",
    shared: "Zk23raf...",
  },
];

export const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "creationDate",
    header: ({ column }) => {
      return <div>Creation Date</div>;
    },
    cell: ({ row }) => <div>{row.getValue("creationDate")}</div>,
  },
  {
    accessorKey: "shared",
    header: () => <div className="text-right">Shared</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">{row.getValue("shared")}</div>
      );
    },
  },
];

const Documents = () => {
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });
  return (
    <div className="max-w-7xl m-auto">
      <div className="flex items-center justify-between  px-8 mt-4 mb-8">
        <h3 className="text-white">Documents</h3>
        <Link to={"/new-document"}>
          <Button
            variant="secondary"
            className="flex items-center gap-2 w-fit"
          >
            New{" "}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 1.33337V10.6667M1.33333 6.00004H10.6667"
                stroke="#67E8F9"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Button>
        </Link>
      </div>
      <div className="text-white">
        <div className="w-full">
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="mb-4">No results.</div>
                      <Link to="/new-document ">
                        <Button variant={"secondary"}>Create a Document</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
