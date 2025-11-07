"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function LoanApplicationForm({ onClose }: { onClose: () => void }) {
  const [applicantName, setApplicantName] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [tenure, setTenure] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Loan Application submitted", { applicantName, loanAmount, tenure })
    alert("Loan Application saved (demo). Check console for values.")
    onClose()
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Loan Application Form</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground">Applicant Name</label>
          <input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Loan Amount</label>
          <input value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tenure (months)</label>
          <input value={tenure} onChange={(e) => setTenure(e.target.value)} className="mt-1 w-full border border-gray-200 rounded px-3 py-2" />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Apply</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </form>
    </Card>
  )
}
