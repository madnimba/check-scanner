// Field validation utilities for check scanning

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Validate account number format
export function validateAccountNumber(value: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!value || value.trim() === "") {
    errors.push("Account number is required")
  } else if (!/^\d{6,12}$/.test(value.replace(/\s/g, ""))) {
    errors.push("Account number must be 6-12 digits")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate account holder name
export function validateAccountHolderName(value: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!value || value.trim() === "") {
    errors.push("Account holder name is required")
  } else if (value.length < 3) {
    errors.push("Name must be at least 3 characters")
  } else if (value.length > 50) {
    errors.push("Name cannot exceed 50 characters")
  } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
    warnings.push("Name contains special characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate check date format
export function validateCheckDate(value: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!value || value.trim() === "") {
    errors.push("Check date is required")
  } else {
    // Accept various date formats: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY
    const dateRegex = /^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})$/
    const match = value.match(dateRegex)

    if (!match) {
      errors.push("Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY")
    } else {
      try {
        const date = parseCheckDate(value)
        const today = new Date()
        const futureLimit = new Date()
        futureLimit.setDate(futureLimit.getDate() + 180) // 6 months ahead

        if (date > futureLimit) {
          warnings.push("Check date is more than 6 months in the future")
        } else if (date < new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())) {
          warnings.push("Check date is more than 2 years old")
        }
      } catch {
        errors.push("Invalid date")
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Parse check date from various formats
function parseCheckDate(dateStr: string): Date {
  const dateRegex = /^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})$/
  const match = dateStr.match(dateRegex)

  if (!match) throw new Error("Invalid date format")

  let year = Number.parseInt(match[1])
  let month = Number.parseInt(match[2])
  let day = Number.parseInt(match[3])

  // Determine format based on values
  if (year < 100) {
    // YY format
    year = year < 50 ? 2000 + year : 1900 + year
  }

  if (month > 12 && day <= 12) {
    // Swap if month > 12
    ;[month, day] = [day, month]
  }

  if (day > 31) {
    throw new Error("Invalid day")
  }

  if (month > 12 || month < 1) {
    throw new Error("Invalid month")
  }

  return new Date(year, month - 1, day)
}

// Validate amount
export function validateAmount(value: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!value || value.trim() === "") {
    errors.push("Amount is required")
  } else {
    const cleanAmount = value.replace(/[,.](?=\d{0,2}$)/g, "").replace(/,/g, "")

    if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount)) {
      errors.push("Invalid amount format")
    } else {
      const amount = Number.parseFloat(cleanAmount)

      if (amount <= 0) {
        errors.push("Amount must be greater than 0")
      } else if (amount > 10000000) {
        warnings.push("Large amount - verify accuracy")
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate check carrier (bank) name
export function validateCheckCarrierName(value: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!value || value.trim() === "") {
    errors.push("Bank/carrier name is required")
  } else if (value.length < 3) {
    errors.push("Bank name must be at least 3 characters")
  } else if (value.length > 50) {
    errors.push("Bank name cannot exceed 50 characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate page number
export function validatePageNumber(value: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!value || value.trim() === "") {
    errors.push("Page number is required")
  } else if (!/^\d{1,3}$/.test(value)) {
    errors.push("Page number must be a number between 1 and 999")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate all fields
export function validateAllFields(fields: {
  accountNumber: string
  accountHolderName: string
  checkDate: string
  checkPageNumber: string
  amountTaka: string
  checkCarrierName: string
}): Record<string, ValidationResult> {
  return {
    accountNumber: validateAccountNumber(fields.accountNumber),
    accountHolderName: validateAccountHolderName(fields.accountHolderName),
    checkDate: validateCheckDate(fields.checkDate),
    checkPageNumber: validatePageNumber(fields.checkPageNumber),
    amountTaka: validateAmount(fields.amountTaka),
    checkCarrierName: validateCheckCarrierName(fields.checkCarrierName),
  }
}
