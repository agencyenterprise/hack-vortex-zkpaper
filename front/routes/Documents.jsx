import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { redirect } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { createDocument, getUserDocuments } from "../services";
import { useConnectionStatus, useSDK, useWallet } from "@thirdweb-dev/react";

const base = [
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
    accessorKey: "documentTitle",
    header: "Title",
    cell: ({ row }) => <Link to={`/document/editing/${row.getValue("_id")}`}>{row.getValue("documentTitle")}</Link>,
  },
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => <Link to={`/document/editing/${row.getValue("_id")}`}>{row.getValue("_id")}</Link>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <div>Creation Date</div>;
    },
    cell: ({ row }) => <Link to={`/document/editing/${row.getValue("_id")}`}>{row.getValue("createdAt")}</Link>,
  }, {
    accessorKey: "edit",
    header: "Edit",
    cell: ({ row }) => <Link to={`/document/editing/${row.getValue("_id")}`}>Edit</Link>,
  },

];


const Documents = () => {
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState([]);
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
  const navigate = useNavigate();
  const connectionStatus = useConnectionStatus();
  const error = (msg) => toast(msg, { type: "error" });
  const success = (msg) => toast(msg, { type: "success" });
  const info = (msg) => toast(msg, { type: "info" });
  const sdk = useSDK()
  const wallet = useWallet()
  const retrieveDocuments = async () => {
    if (wallet?.walletId !== "metamask") {
      error("This application only works with Metamask wallets!")
      navigate("/")
      return
    }
    const plainMessage = new Date().getTime().toString()
    const { signature, address } = await signMessage(plainMessage)
    const documents = await getUserDocuments(address, signature, plainMessage)
    const retrievedDocuments = (documents.message?.documents || [])
    setData(retrievedDocuments)
  }


  useEffect(() => {

    if ((window["ethereum"]?.providers || []).length > 1) {
      const metamaskProvider = window["ethereum"].providers.find((provider) => provider.isMetaMask);
      window["ethereum"] = metamaskProvider;
    }
  }, []);
  async function signMessage(message) {
    if (connectionStatus !== "connected") {
      error("Please connect your wallet")
      return
    }
    const signature = await sdk.wallet.sign(message)
    const address = sdk.wallet.recoverAddress(message, signature)
    return { signature, address }
  }
  async function retrieveEncryptionKey() {
    const accounts = await window["ethereum"].request({ method: 'eth_requestAccounts' })
    const encryptionKey = await window["ethereum"]
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [accounts[0]], // you must have access to the specified account
      })

    return { key: Buffer.from(encryptionKey).toString(), account: accounts[0] }

  }
  async function retrieveKeyAndSign() {
    const message = "text_random"
    const { key: encryptionKey, account } = await retrieveEncryptionKey()
    const signature = await signMessage(message)
    console.log({ encryptionKey, signature, account })
    return { encryptionKey, signature, account }

  }
  return (
    <div className="max-w-7xl m-auto">
      <div className="flex items-center justify-between  px-8 mt-4 mb-8">
        <h3 className="text-white text-3xl">Documents</h3>
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
                      <Button onClick={retrieveDocuments} variant={"secondary"}
                        className="bg-transparent">
                        Refresh/Load
                      </Button>
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
