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
import { createDocument, createSharedDocument, getDocumentById, getSharedDocuments, getUserDocuments, retrieveSharedDocumentById, uploadSharedDocument } from "../services";
import { useConnectionStatus, useSDK, useWallet } from "@thirdweb-dev/react";
import { aesDecryptMessage, aesEncryptMessage, decryptWithWallet, encryptWithWallet, generateSecret } from "../utils/encryption";

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




const SharedDocuments = () => {
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState([]);
  const [encryptionKey, setEncryptionKey] = React.useState("");
  const [sharedDocumentId, setSharedDocumentId] = React.useState("");
  const [senderEncryptionKey, setSenderEncryptionKey] = React.useState("");
  const [senderPublicKey, setSenderPublicKey] = React.useState("");
  const navigate = useNavigate()
  const sdk = useSDK()
  const columns = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        try {
          const currentAddress = (sdk.getSigner()?._address || "").toLowerCase()
          if (row.getValue("senderPublicKey") == currentAddress) {
            if (!row.getValue("content")) {
              return <Button onClick={() => approveSharedDocument(row.getValue("_id"), row.getValue("documentId"))}>Approve</Button>
            } else {
              return <p>Approved</p>
            }
          } else {
            let content = ""
            try {
              content = row.getValue("content")
            } catch (e) { }
            if (content) {
              return <Link to={`/document/${row.getValue("_id")}/${row.getValue("documentId")}`}>View</Link>
            } else {
              return <p>Waiting Approval</p>
            }
          }
        } catch (e) {
          return <p></p>
        }

      },
    },
    {
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => <p>{row.getValue("_id")}</p>,
    },
    {
      accessorKey: "documentId",
      header: "Document ID",
      cell: ({ row }) => <p>{row.getValue("documentId")}</p>,
    },
    {
      accessorKey: "senderPublicKey",
      header: "Sender",
      cell: ({ row }) => <p>{row.getValue("senderPublicKey")}</p>,
    },
    {
      accessorKey: "senderEncryptionKey",
      header: "Sender Encryption Key",
      cell: ({ row }) => <p>{row.getValue("senderEncryptionKey")}</p>,
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        return <p>{row.getValue("content") ? row.getValue("content").slice(0, 5) + "..." : ""}</p>
      },
    },

  ];
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

  const connectionStatus = useConnectionStatus();
  const error = (msg) => toast(msg, { type: "error" });
  const success = (msg) => toast(msg, { type: "success" });
  const info = (msg) => toast(msg, { type: "info" });
  const wallet = useWallet()
  const retrieveDocuments = async () => {
    if (wallet?.walletId !== "metamask") {
      error("This application only works with Metamask wallets!")
      navigate("/")
      return
    }
    const plainMessage = new Date().getTime().toString()
    const { signature, address } = await signMessage(plainMessage)
    const documents = await getSharedDocuments(address, signature, plainMessage)
    const sharedDocuments = (documents.message?.sharedDocuments || [])
    setData(sharedDocuments)
  }


  useEffect(() => {

    if ((window["ethereum"]?.providers || []).length > 1) {
      const metamaskProvider = window["ethereum"].providers.find((provider) => provider.isMetaMask);
      window["ethereum"] = metamaskProvider;
    }

  }, []);
  const approveSharedDocument = async (id, documentId) => {
    try {
      const message = new Date().getTime().toString()
      const { signature, address } = await signMessage(message)
      const document = await retrieveSharedDocumentById(id, documentId, address, signature, message, senderPublicKey)
      if (!document.message) {
        error("Document not found")
        return
      }
      const { receiverPublicKey, senderSecretKey } = (document.message?.sharedDocument || {})

      console.log(senderSecretKey, receiverPublicKey)
      let senderBaseEncryptionKey = (document.message?.baseSecretKey || "")
      const plainSharedSecret = await decryptWithWallet(senderSecretKey, address);
      const plainBaseSecret = await decryptWithWallet(senderBaseEncryptionKey, address);
      console.log(plainSharedSecret, "plainSecret")
      const retrievedDocument = (document.message?.document || {})
      let content = retrievedDocument.content
      if (content) {
        content = aesDecryptMessage(content, plainBaseSecret)
        content = await aesEncryptMessage(content, plainSharedSecret)
        await uploadSharedDocument(content, id, documentId, address, signature, message)

      }
    } catch (e) {
      console.log(e)
    }


  }
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
  const importSharedDocument = async () => {
    try {
      if (wallet?.walletId !== "metamask") {
        error("This application only works with Metamask wallets!")
        navigate("/")
        return
      }
      const { encryptionKey: receiverEncryptionKey, signature, account } = await retrieveKeyAndSign()
      const message = "text_random"
      const { secret } = generateSecret()
      const receiverEncryptionAesKey = encryptWithWallet(secret, receiverEncryptionKey)
      const senderEncryptionAesKey = encryptWithWallet(secret, senderEncryptionKey)
      console.log({ receiverEncryptionAesKey, senderEncryptionAesKey })
      //senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage
      const sharedDocument = await createSharedDocument(sharedDocumentId, account, signature.signature, message, senderEncryptionAesKey, receiverEncryptionAesKey, senderPublicKey, senderEncryptionKey)
      if (!sharedDocument) {
        throw new Error("Failed to import shared document")
      }
      success("Shared document imported successfully")
    } catch (e) {
      error("Failed to import shared document")
      console.log(e)
    }
  }
  const getEncryptionPublicKey = async () => {
    try {
      const { key: encryptionKey } = await retrieveEncryptionKey()
      setEncryptionKey(encryptionKey)

    } catch (e) {
      console.log(e)
    }
  }
  const ImportDocumentForm = () => {
    return <div className="flex justify-center">
      <div className="w-1/2">
        <div className="flex flex-col space-y-3">
          <input type="text" className="p-3 w-[300px] border-white border" placeholder="Document id" value={sharedDocumentId} onChange={(e) => setSharedDocumentId(e.target.value)} />
          <input type="text" className="p-3 w-[300px] border-white border" placeholder="Sender's encryption key" value={senderEncryptionKey} onChange={e => setSenderEncryptionKey(e.target.value)} />
          <input type="text" className="p-3 w-[300px] border-white border" placeholder="Sender's public key" value={senderPublicKey} onChange={e => setSenderPublicKey(e.target.value)} />
          <div className="pt-1">
            <button className="p-3 bg-slate-800 text-white w-[300px] hover:bg-slate-700" onClick={importSharedDocument}>Import Private Document</button>
          </div>
        </div>
      </div>
    </div>
  }
  return (
    <div className="max-w-7xl m-auto">
      <div className="flex items-center justify-between  px-8 mt-4 mb-8">
        <h3 className="text-white text-3xl">Documents</h3>
        <button className="p-3 bg-slate-800 text-white w-[300px] hover:bg-slate-700" onClick={getEncryptionPublicKey} id="wallet-encryption-key">
          Get Wallet Encryption key
        </button >

      </div>
      <div className="flex justify-center py-7">
        <>
          {encryptionKey && <p className="text-white"><span>Encryption Key: </span>{encryptionKey}</p>}
          <ImportDocumentForm />
        </>
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

export default SharedDocuments;
