"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, XCircle, Download, Save, Edit2, AlertTriangle } from "lucide-react"
import { EditFieldsDialog } from "./edit-fields-dialog"
import { validateAllFields } from "@/lib/field-validator"

interface ScanResult {
  fields: {
    accountNumber: string
    accountHolderName: string
    checkDate: string
    checkPageNumber: string
    amountTaka: string
    checkCarrierName: string
  }
  signatureImageUrl: string
  signatureMatch: {
    score: number
    orb: number
    ssim: number
    verdict: "VALID" | "REVIEW" | "REJECT"
  }
  ocrConfidence: number
}

interface ResultScreenProps {
  result: ScanResult
  imageUrl?: string | null
  onBackToHome: () => void
  onEditFields: (fields: ScanResult["fields"]) => void
}

export function ResultScreen({ result, imageUrl, onBackToHome, onEditFields }: ResultScreenProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fieldValidation = useMemo(() => validateAllFields(result.fields), [result.fields])
  const hasValidationErrors = Object.values(fieldValidation).some((v) => !v.isValid)
  const hasValidationWarnings = Object.values(fieldValidation).some((v) => v.warnings.length > 0)

  const getVerdictBadge = () => {
    const { verdict, score } = result.signatureMatch
    const iconClass = "w-5 h-5"

    switch (verdict) {
      case "VALID":
        return (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
            <CheckCircle className={iconClass} />
            VALID
          </div>
        )
      case "REVIEW":
        return (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold">
            <AlertCircle className={iconClass} />
            REVIEW
          </div>
        )
      case "REJECT":
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
            <XCircle className={iconClass} />
            REJECT
          </div>
        )
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return "bg-green-500"
    if (confidence >= 0.6) return "bg-amber-500"
    return "bg-red-500"
  }

  const downloadJSON = () => {
    const jsonData = JSON.stringify(
      {
        ...result,
        validation: fieldValidation,
      },
      null,
      2,
    )
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(jsonData))
    element.setAttribute("download", "check-scan-result.json")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Scan Complete</h1>
          <p className="text-muted-foreground">Review the extracted check details</p>
        </div>

        {/* Scanned Check Image Preview */}
        {imageUrl && (
          <Card className="p-0 overflow-hidden border border-gray-200">
            <img src={imageUrl || "/placeholder.svg"} alt="Scanned check" className="w-full h-40 object-cover" />
          </Card>
        )}

        {/* Verdict Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex flex-col items-center gap-4">
            {getVerdictBadge()}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Signature Match Score</p>
              <p className="text-4xl font-bold text-foreground">{(result.signatureMatch.score * 100).toFixed(1)}%</p>
            </div>

            {/* Confidence Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{(result.ocrConfidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getConfidenceColor(result.ocrConfidence)} transition-all`}
                  style={{ width: `${result.ocrConfidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {(hasValidationErrors || hasValidationWarnings) && (
          <Card
            className={`p-4 border-l-4 ${
              hasValidationErrors ? "bg-red-50 border-l-red-500" : "bg-amber-50 border-l-amber-500"
            }`}
          >
            <div className="flex gap-3">
              {hasValidationErrors ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                <p className={`font-semibold ${hasValidationErrors ? "text-red-900" : "text-amber-900"}`}>
                  {hasValidationErrors ? "Validation Errors" : "Validation Warnings"}
                </p>
                <ul className={`mt-1 space-y-1 text-xs ${hasValidationErrors ? "text-red-700" : "text-amber-700"}`}>
                  {Object.entries(fieldValidation).map(
                    ([field, validation]) =>
                      (hasValidationErrors ? validation.errors : validation.warnings).length > 0 && (
                        <li key={field}>• {field.replace(/([A-Z])/g, " $1").trim()}</li>
                      ),
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Extracted Fields */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Extracted Fields</h2>
            <Button size="sm" variant="ghost" onClick={() => setIsEditDialogOpen(true)} className="gap-1">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          </div>

          <div className="space-y-3">
            <FieldRow
              label="Account Number"
              value={result.fields.accountNumber}
              validation={fieldValidation.accountNumber}
            />
            <FieldRow
              label="Account Holder"
              value={result.fields.accountHolderName}
              validation={fieldValidation.accountHolderName}
            />
            <FieldRow label="Check Date" value={result.fields.checkDate} validation={fieldValidation.checkDate} />
            <FieldRow
              label="Page Number"
              value={result.fields.checkPageNumber}
              validation={fieldValidation.checkPageNumber}
            />
            <FieldRow label="Amount (Taka)" value={result.fields.amountTaka} validation={fieldValidation.amountTaka} />
            <FieldRow
              label="Check Carrier"
              value={result.fields.checkCarrierName}
              validation={fieldValidation.checkCarrierName}
            />
          </div>
        </Card>

        {/* Signature Image */}
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Extracted Signature</p>
          {result.signatureImageUrl && (
            <img
              src={result.signatureImageUrl || "/placeholder.svg"}
              alt="Extracted Signature"
              className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 object-contain"
            />
          )}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>ORB Match: {(result.signatureMatch.orb * 100).toFixed(1)}%</div>
            <div>SSIM: {(result.signatureMatch.ssim * 100).toFixed(1)}%</div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button size="lg" className="w-full h-12 gap-2" onClick={downloadJSON}>
            <Download className="w-4 h-4" />
            Download JSON
          </Button>

          <Button size="lg" variant="outline" className="w-full h-12 gap-2 bg-transparent">
            <Save className="w-4 h-4" />
            Save to Vault
          </Button>

          <Button size="lg" variant="ghost" className="w-full h-12" onClick={onBackToHome}>
            Scan Another Check
          </Button>
        </div>
      </div>

      <EditFieldsDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        fields={result.fields}
        onSave={onEditFields}
      />
    </div>
  )
}

function FieldRow({
  label,
  value,
  validation,
}: {
  label: string
  value: string
  validation?: { isValid: boolean; errors: string[]; warnings: string[] }
}) {
  const isInvalid = validation && !validation.isValid
  const hasWarnings = validation && validation.warnings.length > 0

  return (
    <div className={`py-2 border-b border-gray-100 ${isInvalid ? "bg-red-50 px-2 rounded" : ""}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{value || "—"}</span>
          {isInvalid && <AlertCircle className="w-4 h-4 text-red-500" />}
          {!isInvalid && hasWarnings && <AlertTriangle className="w-4 h-4 text-amber-500" />}
        </div>
      </div>
    </div>
  )
}
