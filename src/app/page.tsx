"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [payload, setPayload] = useState<any>({
    amount: 0,
    type: "",
  });
  const {
    data,
    isLoading,
    refetch: refetchBalance,
  } = useQuery<any>({
    queryKey: ["balance"],
    queryFn: () =>
      fetch("http://localhost:3333/v1/transactions/balance", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.json()),
  });

  const {
    data: listTransaction,
    isLoading: isLoadingListTransaction,
    refetch: refatchTransaction,
  } = useQuery<any>({
    queryKey: ["listTransaction"],
    queryFn: () =>
      fetch("http://localhost:3333/v1/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.json()),
  });
  console.log(data);
  if (!isLoading && data?.message === "Unauthorized") {
    router.push("/login");
  }

  const handleSubmit = async () => {
    try {
      if (payload.type === "" || payload.amount === 0) {
        return toast({
          title: "Error",
          description: "Please fill all fields",
        });
      }
      if (payload.type === "withdraw" && payload.amount > data.balance) {
        return toast({
          title: "Error",
          description: "Balance not enough",
        });
      }
      if (payload.type === "withdraw" && payload.amount < 0) {
        return toast({
          title: "Error",
          description: "Amount must be greater than 0",
        });
      }
      const dataToSend = {
        amount: payload.amount,
        order_id: `order-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
      };
      const url =
        payload.type === "deposit"
          ? "http://localhost:3333/v1/transactions/deposit"
          : "http://localhost:3333/v1/transactions/withdraw";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();
      if (result.status) {
        refatchTransaction();
        refetchBalance();
        setPayload({
          amount: 0,
          type: "",
        });
        return toast({
          title: "Success",
          description: "Transaction success",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return !isLoading && data?.message !== "Unauthorized" ? (
    <div className="p-5 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Balance</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="text-white bg-red-500 px-3 py-1 rounded-md"
        >
          Logout
        </button>
        <div className="text-xl font-semibold">
          {data?.balance ? `IDR ${data.balance}` : "No balance"}
        </div>
      </div>
      <div className="relative pt-10 flex flex-col items-center justify-center h-full">
        <div className="pt-5 w-[60%] flex justify-between">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">Transaction</h1>
            <Button
              onClick={() => {
                refatchTransaction();
                refetchBalance();
                toast({
                  title: "Success",
                  description: "Data has been refreshed",
                });
              }}
            >
              {" "}
              <RefreshCwIcon />
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>Add new transaction</DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="link" className="sr-only">
                    Type Transaction
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setPayload((prev: any) => ({
                        ...prev,
                        type: value,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type Transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="withdraw">withdraw</SelectItem>
                      <SelectItem value="deposit">deposit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="number" className="sr-only">
                    Amount
                  </Label>
                  <Input
                    id="numer"
                    type="number"
                    placeholder="Amount"
                    required
                    onChange={(e) => {
                      setPayload((prev: any) => ({
                        ...prev,
                        amount: parseInt(e.target.value),
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button type="submit" onClick={handleSubmit}>
                    Submit
                  </Button>
                </DialogClose>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="pt-3 mt-3 w-[60%] bg-gray-300 rounded-md p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order Id</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingListTransaction ? (
                <TableRow>
                  <TableCell colSpan={4}>Loading...</TableCell>
                </TableRow>
              ) : (
                listTransaction.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.order_id}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.current_balance}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                    <TableCell>
                      {moment(transaction.createdAt).format(
                        "DD MMMM YYYY HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>
                      {moment(transaction.updatedAt).format(
                        "DD MMMM YYYY HH:mm:ss"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}
