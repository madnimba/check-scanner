"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DepositSlipForm({ onClose }: { onClose: () => void }) {
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Minimal working handler - replace with real submit when backend available
    console.log("Deposit Slip submitted", { bankName, accountNumber, amount })
    alert("Deposit Slip saved (demo). Check console for values.")
    onClose()
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Deposit Slip</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground">Bank Name</label>
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Account Number</label>
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </form>
    </Card>
  )
}
