"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import {
  validateAccountNumber,
  validateAccountHolderName,
  validateCheckDate,
  validateAmount,
  validateCheckCarrierName,
  validatePageNumber,
  type ValidationResult,
} from "@/lib/field-validator"

interface EditFieldsDialogProps {
  isOpen: boolean
  onClose: () => void
  fields: {
    accountNumber: string
    accountHolderName: string
    checkDate: string
    checkPageNumber: string
    amountTaka: string
    checkCarrierName: string
  }
  onSave: (fields: EditFieldsDialogProps["fields"]) => void
}

export function EditFieldsDialog({ isOpen, onClose, fields, onSave }: EditFieldsDialogProps) {
  const [editedFields, setEditedFields] = useState(fields)
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationResult>>({})

  if (!isOpen) return null

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields({
      ...editedFields,
      [key]: value,
    })

    // Validate based on field type
    let validation: ValidationResult = { isValid: true, errors: [], warnings: [] }

    switch (key) {
      case "accountNumber":
        validation = validateAccountNumber(value)
        break
      case "accountHolderName":
        validation = validateAccountHolderName(value)
        break
      case "checkDate":
        validation = validateCheckDate(value)
        break
      case "amountTaka":
        validation = validateAmount(value)
        break
      case "checkCarrierName":
        validation = validateCheckCarrierName(value)
        break
      case "checkPageNumber":
        validation = validatePageNumber(value)
        break
    }

    setValidationErrors({
      ...validationErrors,
      [key]: validation,
    })
  }

  const handleSave = () => {
    onSave(editedFields)
    onClose()
  }

  const hasErrors = Object.values(validationErrors).some((v) => !v.isValid)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-background rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-foreground">Edit Check Fields</h2>

        <div className="space-y-4">
          {Object.entries(editedFields).map(([key, value]) => {
            const validation = validationErrors[key]
            const fieldLabel = key.replace(/([A-Z])/g, " $1").trim()
            const isInvalid = validation && !validation.isValid

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground capitalize">{fieldLabel}</label>
                  {validation && (
                    <div className="flex gap-1">
                      {!validation.isValid ? (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 transition-colors ${
                    isInvalid ? "border-destructive focus:ring-destructive" : "border-input focus:ring-blue-500"
                  }`}
                  placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                />

                {validation && validation.errors.length > 0 && (
                  <div className="text-xs text-destructive space-y-1">
                    {validation.errors.map((error, idx) => (
                      <p key={idx}>• {error}</p>
                    ))}
                  </div>
                )}

                {validation && validation.warnings.length > 0 && (
                  <div className="text-xs text-amber-600 space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <p key={idx}>⚠ {warning}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {hasErrors && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-sm text-destructive font-medium">Please fix the errors above before saving</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={hasErrors}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
