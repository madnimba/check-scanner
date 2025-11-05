"""
Mock backend setup script for local testing.
This demonstrates the OCR and signature matching logic.
Run: python scripts/mock-backend-setup.py
"""

import json
from pathlib import Path

# Mock implementation of the check scanning logic
def generate_mock_scan_result():
    """Generate a mock scan result for testing purposes"""
    result = {
        "fields": {
            "accountNumber": "1234567890",
            "accountHolderName": "John Doe",
            "checkDate": "2025-11-05",
            "checkPageNumber": "1",
            "amountTaka": "5000",
            "checkCarrierName": "First National Bank"
        },
        "signatureImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "signatureMatch": {
            "score": 0.83,
            "orb": 0.82,
            "ssim": 0.78,
            "verdict": "REVIEW"
        },
        "ocrConfidence": 0.74
    }
    return result

if __name__ == "__main__":
    result = generate_mock_scan_result()
    print("Mock scan result generated:")
    print(json.dumps(result, indent=2))
    
    # Save to a test file
    with open("mock-result.json", "w") as f:
        json.dump(result, f, indent=2)
    print("\nMock result saved to mock-result.json")
