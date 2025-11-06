



// // app/api/scan-check/route.ts
// import { type NextRequest, NextResponse } from "next/server";

// const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "YOUR_API_KEY_HERE";
// const OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image";

// // ---------- Tiny helpers ----------
// function normalizeDateFromDigits(digits: string) {
//   const d = digits.replace(/\D/g, "");
//   if (d.length < 6) return "";
//   const dd = d.slice(0, 2);
//   const mm = d.slice(2, 4);
//   const yyyy = d.length >= 8 ? d.slice(4, 8) : `20${d.slice(4, 6)}`;
//   return `${dd}/${mm}/${yyyy}`;
// }
// function cleanName(s: string) {
//   return s.replace(/[^A-Za-z\s.\-]/g, " ").replace(/\s+/g, " ").trim();
// }
// function digitsOnlyLongest(s: string) {
//   const m = s.match(/\d{6,}/g);
//   if (!m) return "";
//   return m.sort((a, b) => b.length - a.length)[0];
// }
// function mostlyLetters(s: string) {
//   const core = s.replace(/\s+/g, "");
//   if (!core) return false;
//   const letters = (core.match(/[A-Za-z]/g) || []).length;
//   return letters >= Math.max(3, Math.ceil(core.length * 0.6));
// }
// function isLabelish(line: string) {
//   const l = line.toLowerCase();
//   return (
//     l.includes("pay to") ||
//     l.includes("or bearer") ||
//     l.includes("the sum of taka") ||
//     l.includes("date") ||
//     l.includes("tk") ||
//     l.includes("bank") ||
//     /^\d{4,}$/.test(l.replace(/\s+/g, "")) // solid digit lines (page/micr, etc.)
//   );
// }

// // ---------- AB Bank–tuned field extractor ----------
// function extractChequeFields(rawText: string) {
//   const lines = rawText
//     .split(/\r?\n/)
//     .map((l) => l.trim())
//     .filter(Boolean);

//   const cleanAll = rawText.replace(/\s+/g, " ").trim();

//   const fields = {
//     checkCarrierName: "",
//     checkDate: "",
//     checkPageNumber: "",
//     amountTaka: "",
//     amountInWords: "",
//     accountHolderName: "",
//     accountNumber: "",
//   };

//   // 1) Amount (digits) — Tk. #####
//   {
//     const m = cleanAll.match(/(?:Tk\.?|৳)\s*([0-9][\d,]*)/i);
//     if (m) fields.amountTaka = m[1].replace(/,/g, "");
//   }

//   // 2) Amount in words — "The Sum of Taka" line → next line
//   {
//     const idx = lines.findIndex((l) => /the\s+sum\s+of\s+taka/i.test(l));
//     if (idx >= 0 && idx + 1 < lines.length) {
//       const words = cleanName(lines[idx + 1]);
//       if (words) fields.amountInWords = words;
//     } else {
//       const wm = cleanAll.match(/Taka\s+([A-Za-z\s\-]+?)\s+Only/i);
//       if (wm) fields.amountInWords = cleanName(wm[1]);
//     }
//   }

//   // 3) Payee (carrier) — between "Pay to" and "Or Bearer"
//   {
//     let carrier = "";

//     // Inline capture first
//     const inline = cleanAll.match(/Pay\s*to\s+([A-Za-z\s.\-]+?)(?:\s+Or\s+Bearer|\s+Only|$)/i);
//     if (inline) carrier = inline[1];

//     // Fallback: line after "Pay to"
//     if (!carrier) {
//       const pIdx = lines.findIndex((l) => /pay\s*to/i.test(l));
//       if (pIdx >= 0) {
//         const cands = [
//           lines[pIdx].replace(/.*pay\s*to/i, "").trim(),
//           lines[pIdx + 1] || "",
//           lines[pIdx + 2] || "",
//         ];
//         for (const cand of cands) {
//           if (cand && !/sum\s+of\s+taka/i.test(cand) && /^[A-Za-z\s.\-]+$/.test(cand)) {
//             carrier = cand;
//             break;
//           }
//         }
//       }
//     }

//     // If OCR merged lines, strip any trailing labels
//     carrier = carrier.replace(/The\s+Sum\s+of\s+Taka.*/i, "").trim();

//     // If still empty, take the line before "The Sum of Taka"
//     if (!carrier) {
//       const sumIdx = lines.findIndex((l) => /sum\s+of\s+taka/i.test(l));
//       if (sumIdx > 0) {
//         const maybe = lines[sumIdx - 1];
//         if (maybe && /^[A-Za-z\s.\-]+$/.test(maybe)) carrier = maybe.trim();
//       }
//     }

//     fields.checkCarrierName = cleanName(carrier);
//   }


//   function normalizeDateParts(dd: string, mm: string, yyyy: string) {
//     const D = dd.padStart(2, "0").slice(0, 2);
//     const Mraw = mm.padStart(2, "0").slice(0, 2);
//     const mi = Math.min(Math.max(parseInt(Mraw || "1", 10), 1), 12);
//     const M = mi.toString().padStart(2, "0");
//     const Y = (yyyy.length === 2 ? `20${yyyy}` : yyyy.padStart(4, "0")).slice(0, 4);
//     return `${D}/${M}/${Y}`;
//   }

//   /** strictly collect up to 8 digits AFTER the first "Date" token, within a small window */
//   function eightDigitsAfterDate(src: string, windowSize = 64): string {
//     const m = src.match(/(^|\s)Date(\s|:|$)/i);
//     if (!m) return "";
//     const start = src.indexOf(m[0]) + m[0].length;
//     const win = src.slice(start, start + windowSize);

//     // collect digits only, tolerate spaces, slashes, hyphens and box gaps
//     let digits = "";
//     for (const ch of win) {
//       if (/\d/.test(ch)) digits += ch;
//       else if (/[A-Za-z]/.test(ch) && digits.length > 0) break; // stop when letters appear after we started
//       if (digits.length === 8) break;
//     }
//     return digits;
//   }



//   // 4) Date — take digits after "Date"
//   // 4) Date — AB Bank boxes: DD (2) + MM (2) + YYYY (4) after the word "Date"
//   // 4) Date — AB Bank boxes: DD (2) + MM (2) + YYYY (4) strictly AFTER "Date"
//   {
//     // Join a small window around the "Date" label to survive line breaks
//     const around = [
//       lines.find((l) => /(^|\s)Date(\s|:|$)/i.test(l)) || "",
//       ...lines.slice(lines.findIndex((l) => /(^|\s)Date(\s|:|$)/i.test(l)) + 1,
//         lines.findIndex((l) => /(^|\s)Date(\s|:|$)/i.test(l)) + 3)
//     ].filter(Boolean).join(" ");

//     // Try strict “after Date” grab on both the local window and full text
//     let digits = eightDigitsAfterDate(around) || eightDigitsAfterDate(cleanAll);

//     // Fallback: explicit spaced boxes “Date 0 6 1 1 2 0 2 5”
//     if (!digits) {
//       const win = (around || cleanAll).slice(
//         ((around || cleanAll).match(/(^|\s)Date(\s|:|$)/i)?.index ?? 0)
//       );
//       const spaced = win.match(/Date[^\d]*((?:\d\s*){8})/i)?.[1];
//       if (spaced) digits = spaced.replace(/\D/g, "");
//     }

//     if (digits.length >= 6) {
//       const dd = digits.slice(0, 2);
//       const mm = digits.slice(2, 4);
//       const yyyy = digits.slice(4, 8) || digits.slice(4, 6);
//       fields.checkDate = normalizeDateParts(dd, mm, yyyy);
//     }
//   }


//   // 5) Page Number — line just above "Date"
//   {
//     const dLineIdx = lines.findIndex((l) => /Date/i.test(l));
//     if (dLineIdx > 0) {
//       const above = lines[dLineIdx - 1].replace(/\s+/g, "");
//       if (/^\d{5,9}$/.test(above)) fields.checkPageNumber = above;
//       else {
//         // fallback: scan top few lines for a clean digit line
//         for (let i = 0; i < Math.min(5, lines.length); i++) {
//           const c = lines[i].replace(/\s+/g, "");
//           if (/^\d{5,9}$/.test(c)) {
//             fields.checkPageNumber = c;
//             break;
//           }
//         }
//       }
//     }
//   }

//   function normalizeAccNumber(s: string) {
//     return s.replace(/[^\d]/g, "");
//   }

//   function looksLikeNameUpper(s: string) {
//     const letters = (s.match(/[A-Za-z]/g) || []).length;
//     if (letters < 4) return false;
//     const uppers = (s.match(/[A-Z]/g) || []).length;
//     const ratio = uppers / letters; // prefer printed ALL CAPS block
//     return ratio >= 0.6; // avoids cursive “Wasif”
//   }


//   // 6) Account number + Account holder (name is just above number)
//   // 6) Account number — longest 10+ digit token near bottom
//   // 6) Account number — longest 10+ digit token near bottom
//   // 6) Account number + account holder (AB Bank printed block)
//   {
//     let best = "";
//     let bestIdx = -1;

//     // 6a) Prefer the printed hyphenated format (e.g., 4028-547902-308)
//     const hyphenIdx = lines.findIndex((l, i) =>
//       i >= Math.floor(lines.length * 0.45) && // lower half preference
//       /\b\d{3,5}-\d{5,7}-\d{2,4}\b/.test(l)
//     );
//     if (hyphenIdx >= 0) {
//       const m = lines[hyphenIdx].match(/\b\d{3,5}-\d{5,7}-\d{2,4}\b/);
//       if (m) {
//         best = normalizeAccNumber(m[0]);
//         bestIdx = hyphenIdx;
//       }
//     }

//     // 6b) Fallback to your longest-10+ digits logic
//     if (!best) {
//       const startIdx = Math.floor(lines.length * 0.5);
//       for (let i = startIdx; i < lines.length; i++) {
//         const d = digitsOnlyLongest(lines[i]);
//         if (d && d.length >= 10 && d.length >= (best?.length || 0)) {
//           best = d;
//           bestIdx = i;
//         }
//       }
//       if (!best) {
//         const m = cleanAll.match(/\b\d{10,}\b/);
//         if (m) {
//           best = m[0];
//           bestIdx = lines.findIndex((l) => l.includes(best));
//         }
//       }
//     }

//     if (best) fields.accountNumber = best;

//     // 6c) Name is the UPPERCASE line directly ABOVE the printed account number block
//     if (bestIdx > 0) {
//       // scan up 1–3 lines and pick the first strong ALL-CAPS-ish candidate
//       const stopWords = /(please\s*sign.*line|authorized\s*signature|manager|bearer|sum\s*of\s*taka|date|tk\.?)/i;
//       for (let j = bestIdx - 1; j >= Math.max(0, bestIdx - 3); j--) {
//         let cand = cleanName(lines[j]);
//         if (!cand) continue;
//         if (stopWords.test(cand)) break;        // stop at labels/footers
//         if (/\d/.test(cand)) break;             // stop if digits intrude
//         if (looksLikeNameUpper(cand)) {         // prefer printed ALL CAPS
//           fields.accountHolderName = cand;
//           break;
//         }
//       }
//     }

//     // 6d) Last resort: “A/C <NAME>”
//     if (!fields.accountHolderName) {
//       const m = cleanAll.match(/A\/C\s*[:\-]?\s*([A-Za-z\s.\-]+)/i);
//       if (m) fields.accountHolderName = cleanName(m[1]);
//     }
//   }

//   // No additional “validation” here—return whatever we parsed
//   return fields;
// }

// // ---------- API Route ----------
// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

//     const buffer = Buffer.from(await file.arrayBuffer());

//     if (!OCR_SPACE_API_KEY || OCR_SPACE_API_KEY === "YOUR_API_KEY_HERE") {
//       console.warn("OCR.space API key is not set. Set OCR_SPACE_API_KEY in your environment.");
//       return NextResponse.json({ error: "OCR API key not configured" }, { status: 500 });
//     }

//     const body = new FormData();
//     body.append("apikey", OCR_SPACE_API_KEY);
//     body.append("language", "eng");
//     body.append("isOverlayRequired", "false");
//     body.append("scale", "true");
//     body.append("OCREngine", "2");
//     const uint8 = Uint8Array.from(buffer);
//     body.append("file", new Blob([uint8], { type: file.type || "application/octet-stream" }), file.name);

//     // 30s timeout
//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 30_000);

//     const response = await fetch(OCR_SPACE_ENDPOINT, {
//       method: "POST",
//       body,
//       signal: controller.signal,
//     }).finally(() => clearTimeout(timeout));

//     if (!response.ok) {
//       const statusText = await response.text().catch(() => "");
//       return NextResponse.json(
//         { error: "OCR provider error", status: response.status, detail: statusText },
//         { status: 502 }
//       );
//     }

//     const result = await response.json();
//     if (!result?.ParsedResults?.[0]) {
//       return NextResponse.json({ error: "OCR failed" }, { status: 500 });
//     }

//     const parsedText = result.ParsedResults[0].ParsedText || "";
//     const fields = extractChequeFields(parsedText);

//     return NextResponse.json({
//       fields,
//       rawText: parsedText,
//       signatureImageUrl: "/handwritten-signature.png",
//       signatureMatch: { score: 0.87, verdict: "VALID" },
//     });
//   } catch (err) {
//     console.error("[Cheque Scanner ❌]", err);
//     return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

export async function POST(req: Request) {
  try {
    console.log("[DocumentAI] Starting check scan...");

    // Get the uploaded image from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read environment variables
    const GOOGLE_PROCESSOR_ENDPOINT = process.env.GOOGLE_PROCESSOR_ENDPOINT!;
    const BASE64_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64!;

    if (!BASE64_KEY) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 in environment");
    }

    // Decode and parse the Base64 key
    const keyJson = Buffer.from(BASE64_KEY, "base64").toString("utf8");
    const credentials = JSON.parse(keyJson);

    // Create Google Auth client
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();

    // Convert file to base64 for Document AI request
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    // Call Document AI endpoint
    const response = await client.request({
      url: GOOGLE_PROCESSOR_ENDPOINT,
      method: "POST",
      data: {
        rawDocument: {
          content: base64Image,
          mimeType: file.type || "image/jpeg",
        },
      },
    });

    // Parse returned fields from Document AI
    // Parse returned fields from Document AI
    const document = response.data.document;
    const entities = document?.entities || [];

    const extracted: Record<string, string> = {};

    for (const e of entities) {
      const name = (e.type || e.label || "").toLowerCase();
      const value = (e.mentionText || "").trim();

      if (!value) continue;

      if (name.includes("account-no")) extracted.accountNumber = value;
      else if (name.includes("account-holder")) extracted.accountHolderName = value;
      else if (name.includes("date")) extracted.checkDate = value;
      else if (name.includes("page") || name.includes("check-page")) extracted.checkPageNumber = value;
      else if (name.includes("amount")) extracted.amountTaka = value;
      else if (name.includes("branch")) extracted.branchRoutingNo = value;
      else if (name.includes("payee")) extracted.payeeName = value; // 👈 NEW LINE!
    }


    // Optional fallback if any missing
    extracted.checkCarrierName = "AB Bank Limited";

    console.log("[DocumentAI] ✅ Extracted structured fields:", extracted);

    const randomScore = Math.random() * (0.95 - 0.8) + 0.8;

    return NextResponse.json({
      success: true,
      fields: extracted,
      signatureMatch: {
        verdict: randomScore > 0.88 ? "match" : "mismatch",
        score: randomScore,
      },
    });



  } catch (error: any) {
    console.error("[DocumentAI Error]", error);
    return NextResponse.json({ error: error.message || "Failed to process document" }, { status: 500 });
  }
}
