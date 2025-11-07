"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function AccountOpeningForm({ onClose }: { onClose: () => void }) {
  const [fullName, setFullName] = useState("")
  const [nid, setNid] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Account Opening submitted", { fullName, nid, phone })
    alert("Account Opening form saved (demo). Check console for values.")
    onClose()
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Account Opening Form</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground">Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">NID / Passport</label>
          <input value={nid} onChange={(e) => setNid(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Submit</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </form>
    </Card>
  )
}
