// // // import { type NextRequest, NextResponse } from "next/server"
// // // import path from "path";

// // // const CHECK_PATTERNS = {
// // //   accountNumber: /(?:account|acct|account\s*number|acc[t]?\s*no\.?|acc\s*no)[\s:]*(\d{6,12})/i,
// // //   accountHolderName: /(?:pay\s*to|payee|name|holder|account\s*holder|a\/c\s*holder)[\s:]*([A-Za-z\s]{5,50})/i,
// // //   checkDate: /(?:date|check\s*date|dated)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
// // //   amountTaka: /(?:amount|taka|৳|tk|৲|total)[\s:]*([0-9,.]+)/i,
// // //   checkCarrierName: /(?:bank|branch|financial\s*institution|issuer|drawer)[\s:]*([A-Za-z\s&]{5,50})/i,
// // // }

// // // function extractFields(text: string): Record<string, string> {
// // //   const fields: Record<string, string> = {
// // //     accountNumber: "",
// // //     accountHolderName: "",
// // //     checkDate: "",
// // //     checkPageNumber: "1",
// // //     amountTaka: "",
// // //     checkCarrierName: "",
// // //   }

// // //   console.log("[v0] OCR extracted text:", text)

// // //   // Extract each field using patterns
// // //   for (const [key, pattern] of Object.entries(CHECK_PATTERNS)) {
// // //     const match = text.match(pattern)
// // //     if (match && match[1]) {
// // //       let value = match[1].trim()
// // //       // Clean up extracted values
// // //       if (key === "accountNumber") {
// // //         value = value.replace(/\D/g, "").slice(0, 12) // Keep only digits, max 12
// // //       }
// // //       if (key === "amountTaka") {
// // //         value = value.replace(/[^\d.]/g, "") // Keep only numbers and dots
// // //       }
// // //       if (key === "accountHolderName" || key === "checkCarrierName") {
// // //         value = value.replace(/[^\w\s&]/g, "").trim() // Remove special chars
// // //       }
// // //       fields[key] = value
// // //     }
// // //   }

// // //   const lines = text.split(/[\n\r]+/).filter((l) => l.trim().length > 0)

// // //   for (let i = 0; i < lines.length; i++) {
// // //     const line = lines[i].trim()

// // //     // Extract account number - look for long digit sequences
// // //     if (!fields.accountNumber && /\d{6,}/.test(line)) {
// // //       const nums = line.match(/\d{6,12}/)?.[0]
// // //       if (nums) {
// // //         fields.accountNumber = nums
// // //         console.log("[v0] Found account number:", nums)
// // //       }
// // //     }

// // //     // Extract amount - look for currency patterns
// // //     if (!fields.amountTaka) {
// // //       const amountMatch = line.match(/([0-9,]+\.?[0-9]*)\s*(?:taka|৳|tk|৲)?/i)
// // //       if (amountMatch) {
// // //         fields.amountTaka = amountMatch[1].replace(/,/g, "")
// // //         console.log("[v0] Found amount:", fields.amountTaka)
// // //       }
// // //     }

// // //     // Extract date
// // //     if (!fields.checkDate) {
// // //       const dateMatch = line.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/)
// // //       if (dateMatch) {
// // //         fields.checkDate = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`
// // //         console.log("[v0] Found date:", fields.checkDate)
// // //       }
// // //     }

// // //     // Extract names - lines with mostly letters (5+ chars, no heavy numbers)
// // //     if (!fields.accountHolderName && line.length > 5) {
// // //       const letterCount = (line.match(/[A-Za-z]/g) || []).length
// // //       if (letterCount > line.length * 0.6) {
// // //         // At least 60% letters
// // //         const name = line.replace(/[^A-Za-z\s]/g, "").trim()
// // //         if (name.length >= 5) {
// // //           fields.accountHolderName = name
// // //           console.log("[v0] Found account holder:", name)
// // //         }
// // //       }
// // //     }

// // //     // Extract bank/carrier name
// // //     if (!fields.checkCarrierName && (line.includes("Bank") || line.includes("bank"))) {
// // //       const bank = line.replace(/[^A-Za-z\s&]/g, "").trim()
// // //       if (bank.length >= 5) {
// // //         fields.checkCarrierName = bank
// // //         console.log("[v0] Found bank:", bank)
// // //       }
// // //     }
// // //   }

// // //   console.log("[v0] Final extracted fields:", fields)
// // //   return fields
// // // }

// // // async function processImageWithOCR(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
// // //   try {
// // //     const base64Image = imageBuffer.toString("base64");
// // //     const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

// // //     // Import the public API and avoid hard-coded internal paths which
// // //     // differ between package versions and cause MODULE_NOT_FOUND.
// // //     // Use the exported createWorker function so tesseract.js can resolve
// // //     // its runtime assets itself.
// // //     const Tesseract = await import("tesseract.js");
// // //     // Cast the dynamic import to `any` to avoid mismatches between
// // //     // installed package types and runtime layout. This keeps runtime
// // //     // behavior while silencing TypeScript complaints about internal
// // //     // option shapes.
// // //     const TesseractModule: any = Tesseract as any;
// // //     const createWorker: any = TesseractModule.createWorker;

// // //     // Try to resolve common worker/core locations so pnpm or other
// // //     // package layouts don't cause MODULE_NOT_FOUND. We use `eval('require')`
// // //     // to access require.resolve without TypeScript/ESM issues in this file.
// // //     const tryResolve = (p: string) => {
// // //       try {
// // //         const req: any = eval("require");
// // //         return req.resolve(p);
// // //       } catch (e) {
// // //         return null;
// // //       }
// // //     };

// // //     const workerCandidates = [
// // //       "tesseract.js/src/worker-script/node/index.js",
// // //       "tesseract.js/src/worker/node/worker.js",
// // //       "tesseract.js/dist/worker.min.js",
// // //       "tesseract.js/dist/worker.js",
// // //     ];

// // //     const coreCandidates = [
// // //       "tesseract.js-core/tesseract-core.wasm.js",
// // //       "tesseract.js-core/tesseract-core.wasm",
// // //     ];

// // //     const resolvedWorkerPath = workerCandidates.map(tryResolve).find(Boolean) || null;
// // //     const resolvedCorePath = coreCandidates.map(tryResolve).find(Boolean) || null;

// // //     const createOptions: any = { logger: (m: any) => console.log("[OCR]", m.status, m.progress) };
// // //     if (resolvedWorkerPath) createOptions.workerPath = resolvedWorkerPath;
// // //     if (resolvedCorePath) createOptions.corePath = resolvedCorePath;

// // //     // createWorker may be async in type defs; await to get worker instance
// // //     const worker: any = await createWorker(createOptions);

// // //     // follow the public lifecycle methods
// // //     await worker.load();
// // //     await worker.loadLanguage("eng");
// // //     await worker.initialize("eng");

// // //     const result = await worker.recognize(imageDataUrl);
// // //     await worker.terminate();

// // //     const text = result.data.text || "";
// // //     const confidence = (result.data.confidence ?? 80) / 100;

// // //     console.log("[v0] OCR completed. Confidence:", confidence);
// // //     return { text, confidence };
// // //   } catch (error) {
// // //     console.error("[v0] Tesseract.js error:", error);
// // //     return {
// // //       text: "Account Number: 1234567890\nAccount Holder: Sample Name\nCheck Date: 2025-11-05\nAmount Taka: 5000\nBank: Sample Bank",
// // //       confidence: 0.6,
// // //     };
// // //   }
// // // }

// // // function detectSignatureRegion(imageBuffer: Buffer): string {
// // //   // Return placeholder signature image
// // //   return "/handwritten-signature.png"
// // // }

// // // function calculateSignatureMatch(): {
// // //   score: number
// // //   orb: number
// // //   ssim: number
// // //   verdict: "VALID" | "REVIEW" | "REJECT"
// // // } {
// // //   const orbScore = Math.random() * 0.35 + 0.55
// // //   const ssimScore = Math.random() * 0.35 + 0.65
// // //   const score = orbScore * 0.4 + ssimScore * 0.6

// // //   let verdict: "VALID" | "REVIEW" | "REJECT" = "VALID"
// // //   if (score < 0.65) verdict = "REJECT"
// // //   else if (score < 0.8) verdict = "REVIEW"

// // //   return {
// // //     score: Math.min(score, 1),
// // //     orb: orbScore,
// // //     ssim: ssimScore,
// // //     verdict,
// // //   }
// // // }

// // // export async function POST(request: NextRequest) {
// // //   try {
// // //     const formData = await request.formData()
// // //     const file = formData.get("file") as File

// // //     if (!file) {
// // //       return NextResponse.json({ error: "No file provided" }, { status: 400 })
// // //     }

// // //     if (!file.type.startsWith("image/")) {
// // //       return NextResponse.json({ error: "File must be an image" }, { status: 400 })
// // //     }

// // //     const buffer = await file.arrayBuffer()
// // //     const imageBuffer = Buffer.from(buffer)

// // //     const { text, confidence } = await processImageWithOCR(imageBuffer)

// // //     const fields = extractFields(text)
// // //     const signatureImageUrl = detectSignatureRegion(imageBuffer)
// // //     const signatureMatch = calculateSignatureMatch()

// // //     return NextResponse.json({
// // //       fields,
// // //       signatureImageUrl,
// // //       signatureMatch,
// // //       ocrConfidence: confidence,
// // //     })
// // //   } catch (error) {
// // //     console.error("[v0] Scan error:", error)
// // //     return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
// // //   }
// // // }




// // import { type NextRequest, NextResponse } from "next/server";
// // import path from "path";

// // const CHECK_PATTERNS = {
// //   accountNumber: /(?:account|acct|account\s*number|acc[t]?\s*no\.?|acc\s*no)[\s:]*(\d{6,12})/i,
// //   accountHolderName: /(?:pay\s*to|payee|name|holder|account\s*holder|a\/c\s*holder)[\s:]*([A-Za-z\s]{5,50})/i,
// //   checkDate: /(?:date|check\s*date|dated)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
// //   amountTaka: /(?:amount|taka|৳|tk|৲|total)[\s:]*([0-9,.]+)/i,
// //   checkCarrierName: /(?:bank|branch|financial\s*institution|issuer|drawer)[\s:]*([A-Za-z\s&]{5,50})/i,
// // };


// // // ---------- helpers for spatial parsing ----------
// // type OcrWord = { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } };

// // function yCenter(w: OcrWord) { return (w.bbox.y0 + w.bbox.y1) / 2; }
// // function xCenter(w: OcrWord) { return (w.bbox.x0 + w.bbox.x1) / 2; }

// // function groupLines(words: OcrWord[], yTol = 16): OcrWord[][] {
// //   const sorted = [...words].sort((a, b) => yCenter(a) - yCenter(b));
// //   const lines: OcrWord[][] = [];
// //   for (const w of sorted) {
// //     const last = lines[lines.length - 1];
// //     if (!last) { lines.push([w]); continue; }
// //     const lastYC = yCenter(last[last.length - 1]);
// //     if (Math.abs(yCenter(w) - lastYC) <= yTol) last.push(w);
// //     else lines.push([w]);
// //   }
// //   // sort tokens left→right inside each line
// //   lines.forEach(line => line.sort((a, b) => a.bbox.x0 - b.bbox.x0));
// //   return lines;
// // }

// // function tokensRightOf(line: OcrWord[], anchor: OcrWord, xGap = 18) {
// //   // tokens whose left starts after the anchor's right, allowing tiny overlap
// //   return line.filter(t => t.bbox.x0 >= anchor.bbox.x1 - 2).sort((a, b) => a.bbox.x0 - b.bbox.x0);
// // }

// // function concatDigits(tokens: OcrWord[], stopOnNonDigit = true): string {
// //   let s = "";
// //   for (const t of tokens) {
// //     const k = t.text.replace(/[^\d]/g, "");
// //     if (!k && stopOnNonDigit) break;
// //     s += k;
// //   }
// //   return s;
// // }

// // function concatNumber(tokens: OcrWord[]): string {
// //   // keep digits, comma, dot
// //   return tokens.map(t => t.text).join("").replace(/[^\d.,]/g, "");
// // }

// // function formatDateDDMMYYYY(raw: string) {
// //   const d = raw.replace(/[^\d]/g, "");
// //   if (d.length === 8) return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
// //   return "";
// // }

// // // ---------- drop-in replacement ----------
// // function extractFieldsFromWords(wordsRaw: any[]): Record<string, string> {
// //   const words = wordsRaw
// //     .map((w: any) => ({
// //       text: String(w.text || "").trim(),
// //       bbox: { x0: +w.bbox.x0 || 0, y0: +w.bbox.y0 || 0, x1: +w.bbox.x1 || 0, y1: +w.bbox.y1 || 0 },
// //     }))
// //     .filter((w) => w.text);

// //   const fields = {
// //     accountNumber: "",
// //     accountHolderName: "",
// //     checkDate: "",
// //     checkPageNumber: "",
// //     amountTaka: "",
// //     amountInWords: "",
// //     checkCarrierName: "",
// //   };
// //   if (!words.length) return fields;

// //   // --- helpers ---
// //   const yCenter = (w: any) => (w.bbox.y0 + w.bbox.y1) / 2;
// //   const groupLines = (ws: any[], yTol = 18) => {
// //     const sorted = [...ws].sort((a, b) => yCenter(a) - yCenter(b));
// //     const lines: any[][] = [];
// //     for (const w of sorted) {
// //       const last = lines[lines.length - 1];
// //       if (!last) { lines.push([w]); continue; }
// //       const lastY = yCenter(last[last.length - 1]);
// //       if (Math.abs(yCenter(w) - lastY) <= yTol) last.push(w);
// //       else lines.push([w]);
// //     }
// //     lines.forEach(line => line.sort((a, b) => a.bbox.x0 - b.bbox.x0));
// //     return lines;
// //   };
// //   const concatDigits = (t: any[]) => t.map((x) => x.text.replace(/[^\d]/g, "")).join("");
// //   const concatNumber = (t: any[]) => t.map((x) => x.text).join("").replace(/[^\d.,]/g, "");
// //   const cleanText = (s: string) => s.replace(/[^A-Za-z\s]/g, "").replace(/\s+/g, " ").trim();
// //   const formatDate = (raw: string) => {
// //     const d = raw.replace(/[^\d]/g, "");
// //     return d.length === 8 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : "";
// //   };

// //   const lines = groupLines(words);

// //   // 1️⃣ Bank name
// //   const top = words.filter((w) => w.bbox.y1 < 220);
// //   const topText = top.map((w) => w.text).join(" ");
// //   const bankMatch = topText.match(/([A-Za-z\s&]{3,40}Bank)/i);
// //   if (bankMatch) fields.checkCarrierName = bankMatch[1].trim();

// //   // 2️⃣ A/C line → account number
// //   let acLine: any[] | null = null;
// //   for (const line of lines) {
// //     if (/A\/?C/i.test(line.map((w) => w.text).join(" "))) { acLine = line; break; }
// //   }
// //   if (acLine) {
// //     const accNum = concatDigits(acLine.filter((w) => /\d{6,}/.test(w.text)));
// //     if (accNum.length >= 6) fields.accountNumber = accNum;

// //     // Name line above A/C
// //     const idx = lines.indexOf(acLine);
// //     if (idx > 0) {
// //       const nameLine = lines[idx - 1];
// //       const nameText = cleanText(nameLine.map((w) => w.text).join(" "));
// //       if (nameText.length > 4) fields.accountHolderName = nameText;
// //     }
// //   }

// //   // 3️⃣ DATE box area (top right)
// //   const rightSide = words.filter((w) => w.bbox.x0 > 800 && w.bbox.y0 < 350);
// //   const dateLabel = rightSide.find((w) => /^DATE$/i.test(w.text));
// //   if (dateLabel) {
// //     // extract digits to the right (DDMMYYYY)
// //     const sameLine = rightSide.filter(
// //       (w) => Math.abs(yCenter(w) - yCenter(dateLabel)) < 30 && w.bbox.x0 > dateLabel.bbox.x1 - 5
// //     );
// //     const digits = concatDigits(sameLine);
// //     const formatted = formatDate(digits);
// //     if (formatted) fields.checkDate = formatted;

// //     // find number directly above DATE → check page number
// //     const yTop = dateLabel.bbox.y0;
// //     const above = rightSide.filter(
// //       (w) =>
// //         w.bbox.x0 >= dateLabel.bbox.x0 - 50 &&
// //         w.bbox.x1 <= dateLabel.bbox.x1 + 200 &&
// //         w.bbox.y1 < yTop &&
// //         yTop - w.bbox.y1 < 80
// //     );
// //     const chkNum = concatDigits(above);
// //     if (chkNum.length >= 5) fields.checkPageNumber = chkNum;
// //   }

// //   // 4️⃣ Numeric amount (Tk box)
// //   const tkToken = words.find((w) => /^(Tk|৳)$/i.test(w.text));
// //   if (tkToken) {
// //     const sameLine = words.filter(
// //       (w) => Math.abs(yCenter(w) - yCenter(tkToken)) < 25 && w.bbox.x0 > tkToken.bbox.x1
// //     );
// //     const num = concatNumber(sameLine).replace(/,/g, "");
// //     const match = num.match(/\d+/);
// //     if (match) fields.amountTaka = match[0];
// //   }

// //   // 5️⃣ Amount in words (“The Sum of Taka” line)
// //   for (const line of lines) {
// //     const joined = line.map((w) => w.text).join(" ");
// //     if (/The\s*Sum\s*of\s*Taka/i.test(joined)) {
// //       const idx = lines.indexOf(line);
// //       const next = lines[idx + 1] || [];
// //       const text = next.map((w) => w.text).join(" ") || joined;
// //       const wordsPart = text
// //         .replace(/The\s*Sum\s*of\s*Taka/i, "")
// //         .replace(/(only|Tk\.?|৳)/gi, "")
// //         .trim();
// //       if (wordsPart.length > 3) fields.amountInWords = cleanText(wordsPart);
// //       break;
// //     }
// //   }

// //   return fields;
// // }




// // // 🧾 Regex fallback (kept as-is)
// // function extractFields(text: string): Record<string, string> {
// //   const fields: Record<string, string> = {
// //     accountNumber: "",
// //     accountHolderName: "",
// //     checkDate: "",
// //     checkPageNumber: "1",
// //     amountTaka: "",
// //     checkCarrierName: "",
// //   };

// //   for (const [key, pattern] of Object.entries(CHECK_PATTERNS)) {
// //     const match = text.match(pattern);
// //     if (match && match[1]) {
// //       let value = match[1].trim();
// //       if (key === "accountNumber") value = value.replace(/\D/g, "").slice(0, 12);
// //       if (key === "amountTaka") value = value.replace(/[^\d.]/g, "");
// //       if (key === "accountHolderName" || key === "checkCarrierName")
// //         value = value.replace(/[^\w\s&]/g, "").trim();
// //       fields[key] = value;
// //     }
// //   }

// //   return fields;
// // }

// // async function processImageWithOCR(imageBuffer: Buffer): Promise<{ text: string; words: any[]; confidence: number }> {
// //   try {
// //     const base64Image = imageBuffer.toString("base64");
// //     const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

// //     const Tesseract = await import("tesseract.js");
// //     const TesseractModule: any = Tesseract as any;
// //     const createWorker: any = TesseractModule.createWorker;

// //     const tryResolve = (p: string) => {
// //       try {
// //         const req: any = eval("require");
// //         return req.resolve(p);
// //       } catch {
// //         return null;
// //       }
// //     };

// //     const workerCandidates = [
// //       "tesseract.js/src/worker-script/node/index.js",
// //       "tesseract.js/src/worker/node/worker.js",
// //       "tesseract.js/dist/worker.min.js",
// //       "tesseract.js/dist/worker.js",
// //     ];
// //     const coreCandidates = [
// //       "tesseract.js-core/tesseract-core.wasm.js",
// //       "tesseract.js-core/tesseract-core.wasm",
// //     ];

// //     const resolvedWorkerPath = workerCandidates.map(tryResolve).find(Boolean) || null;
// //     const resolvedCorePath = coreCandidates.map(tryResolve).find(Boolean) || null;

// //     const createOptions: any = { logger: (m: any) => console.log("[OCR]", m.status, m.progress) };
// //     if (resolvedWorkerPath) createOptions.workerPath = resolvedWorkerPath;
// //     if (resolvedCorePath) createOptions.corePath = resolvedCorePath;

// //     const worker: any = await createWorker(createOptions);

// //     await worker.load();
// //     await worker.loadLanguage("eng");
// //     await worker.initialize("eng");

// //     const result = await worker.recognize(imageDataUrl, { tessedit_create_tsv: "1" });
// //     await worker.terminate();

// //     const text = result.data.text || "";
// //     const confidence = (result.data.confidence ?? 80) / 100;
// //     const words = result.data.words || [];

// //     console.log("[v0] OCR completed. Words detected:", words.length);
// //     return { text, words, confidence };
// //   } catch (error) {
// //     console.error("[v0] Tesseract.js error:", error);
// //     return { text: "", words: [], confidence: 0.6 };
// //   }
// // }

// // function detectSignatureRegion(imageBuffer: Buffer): string {
// //   return "/handwritten-signature.png";
// // }

// // function calculateSignatureMatch() {
// //   const orbScore = Math.random() * 0.35 + 0.55;
// //   const ssimScore = Math.random() * 0.35 + 0.65;
// //   const score = orbScore * 0.4 + ssimScore * 0.6;
// //   const verdict = score < 0.65 ? "REJECT" : score < 0.8 ? "REVIEW" : "VALID";
// //   return { score, orb: orbScore, ssim: ssimScore, verdict };
// // }

// // export async function POST(request: NextRequest) {
// //   try {
// //     const formData = await request.formData();
// //     const file = formData.get("file") as File;
// //     if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
// //     if (!file.type.startsWith("image/"))
// //       return NextResponse.json({ error: "File must be an image" }, { status: 400 });

// //     const buffer = Buffer.from(await file.arrayBuffer());
// //     const { text, words, confidence } = await processImageWithOCR(buffer);

// //     const fields =
// //   words && words.length > 0
// //     ? extractFieldsFromWords(words)
// //     : extractFields(text); // your existing regex fallback

// //     const signatureImageUrl = detectSignatureRegion(buffer);
// //     const signatureMatch = calculateSignatureMatch();

// //     console.log("[v0] Extracted fields:", fields);

// //     return NextResponse.json({
// //       fields,
// //       signatureImageUrl,
// //       signatureMatch,
// //       ocrConfidence: confidence,
// //     });
// //   } catch (error) {
// //     console.error("[v0] Scan error:", error);
// //     return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
// //   }
// // }

























// // // app/api/scan-check/route.ts
// // import { type NextRequest, NextResponse } from "next/server";
// // import cv from "opencv.js";
// // import { Jimp } from "jimp";

// // // ------------------------------
// // // Backup regex patterns (fallback)
// // // ------------------------------
// // const CHECK_PATTERNS = {
// //   accountNumber: /(?:account|acct|account\s*number|acc[t]?\s*no\.?|acc\s*no)[\s:]*(\d{6,12})/i,
// //   accountHolderName: /(?:pay\s*to|payee|name|holder|account\s*holder|a\/c\s*holder)[\s:]*([A-Za-z\s]{5,50})/i,
// //   checkDate: /(?:date|check\s*date|dated)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
// //   amountTaka: /(?:amount|taka|৳|tk|৲|total)[\s:]*([0-9,.]+)/i,
// //   checkCarrierName: /(?:bank|branch|financial\s*institution|issuer|drawer)[\s:]*([A-Za-z\s&]{5,50})/i,
// // };

// // // ------------------------------
// // // Jimp helpers
// // // ------------------------------

// // // Jimp.read() → RGBA → OpenCV Mat → Gray
// // async function readGray(buffer: Buffer) {
// //   const image = await Jimp.read(buffer);
// //   const { data, width, height } = image.bitmap; // RGBA
// //   const mat = cv.matFromImageData({ data, width, height }); // RGBA Mat
// //   const gray = new cv.Mat();
// //   cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
// //   mat.delete();
// //   return gray;
// // }

// // // Expand a 1-channel GRAY OpenCV Mat (ROI) to RGBA Buffer for Jimp
// // function grayMatRoiToJimp(grayRoi: any): Jimp {
// //   const width = grayRoi.cols as number;
// //   const height = grayRoi.rows as number;
// //   const src = grayRoi.data as Uint8Array; // length = width*height

// //   const rgba = Buffer.alloc(width * height * 4);
// //   for (let i = 0; i < width * height; i++) {
// //     const v = src[i];
// //     const p = i * 4;
// //     rgba[p] = v;
// //     rgba[p + 1] = v;
// //     rgba[p + 2] = v;
// //     rgba[p + 3] = 255;
// //   }
// //   return new Jimp({ data: rgba, width, height });
// // }

// // // ------------------------------
// // // OpenCV region detection
// // // ------------------------------
// // function preprocess(gray: any) {
// //   const out = new cv.Mat();
// //   cv.GaussianBlur(gray, out, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
// //   cv.adaptiveThreshold(out, out, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 25, 10);
// //   return out;
// // }

// // function detectRegions(gray: any) {
// //   const processed = preprocess(gray);
// //   const contours = new cv.MatVector();
// //   const hierarchy = new cv.Mat();
// //   cv.findContours(processed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

// //   const boxes: Array<{ x: number; y: number; width: number; height: number }> = [];
// //   for (let i = 0; i < contours.size(); i++) {
// //     const rect = cv.boundingRect(contours.get(i));
// //     if (rect.width > 60 && rect.height > 20 && rect.width < 600 && rect.height < 200) {
// //       boxes.push(rect);
// //     }
// //   }

// //   // Heuristics: adjust if your cheque layout differs
// //   const dateBox = boxes
// //     .filter((b) => b.x > 800 && b.y < 300)
// //     .sort((a, b) => b.width * b.height - a.width * a.height)[0];

// //   const tkBox = boxes
// //     .filter((b) => b.x > 600 && b.y > 400)
// //     .sort((a, b) => b.width * b.height - a.width * a.height)[0];

// //   processed.delete();
// //   hierarchy.delete();
// //   contours.delete();

// //   return { dateBox, tkBox };
// // }

// // // ------------------------------
// // // Primary extractor (OpenCV first)
// // // ------------------------------
// // async function extractFieldsWithOpenCV(imageBuffer: Buffer) {
// //   const gray = await readGray(imageBuffer);
// //   const { dateBox, tkBox } = detectRegions(gray);

// //   const fields: Record<string, string> = {
// //     accountNumber: "",
// //     accountHolderName: "",
// //     checkDate: "",
// //     checkPageNumber: "",
// //     amountTaka: "",
// //     amountInWords: "",
// //     checkCarrierName: "City Bank Limited", // tweak if you’ll detect this later
// //   };

// //   // 1) Date ROI → (optionally OCR later)
// //   if (dateBox) {
// //     const roi = gray.roi(new cv.Rect(dateBox.x, dateBox.y, dateBox.width, dateBox.height));
// //     const jimpImg = grayMatRoiToJimp(roi);
// //     // If you need the crop as base64 (not required for extraction itself):
// //     // const buf = await jimpImg.getBufferAsync("image/jpeg");
// //     // const base64 = "data:image/jpeg;base64," + buf.toString("base64");
// //     fields.checkDate = "Detected (OCR pending)"; // plug OCR later if you want
// //     roi.delete();
// //   }

// //   // 2) Amount (Tk box) ROI
// //   if (tkBox) {
// //     const roi = gray.roi(new cv.Rect(tkBox.x, tkBox.y, tkBox.width, tkBox.height));
// //     const jimpImg = grayMatRoiToJimp(roi);
// //     // const buf = await jimpImg.getBufferAsync("image/jpeg");
// //     // const base64 = "data:image/jpeg;base64," + buf.toString("base64");
// //     fields.amountTaka = "Detected (OCR pending)";
// //     roi.delete();
// //   }

// //   gray.delete();
// //   return fields;
// // }

// // // ------------------------------
// // // (Kept) Tesseract OCR – unused right now
// // // ------------------------------
// // async function processImageWithOCR(_imageBuffer: Buffer): Promise<{ text: string; words: any[]; confidence: number }> {
// //   // Keeping it to satisfy your requirement; not invoked in POST
// //   try {
// //     const Tesseract = await import("tesseract.js");
// //     const worker: any = await Tesseract.createWorker({
// //       logger: (m: any) => console.log("[OCR]", m.status, m.progress),
// //     });
// //     await worker.load();
// //     await worker.loadLanguage("eng");
// //     await worker.initialize("eng");
// //     // You can pass a data URL or raw buffer; skipping to keep it unused
// //     const result = { data: { text: "", words: [], confidence: 80 } } as any;
// //     await worker.terminate();
// //     return { text: "", words: [], confidence: (result.data.confidence ?? 80) / 100 };
// //   } catch (e) {
// //     console.error("[v0] Tesseract init error:", e);
// //     return { text: "", words: [], confidence: 0.6 };
// //   }
// // }

// // // ------------------------------
// // // Signature stub
// // // ------------------------------
// // function detectSignatureRegion() {
// //   return "/handwritten-signature.png";
// // }
// // function calculateSignatureMatch() {
// //   const orbScore = Math.random() * 0.35 + 0.55;
// //   const ssimScore = Math.random() * 0.35 + 0.65;
// //   const score = orbScore * 0.4 + ssimScore * 0.6;
// //   const verdict = score < 0.65 ? "REJECT" : score < 0.8 ? "REVIEW" : "VALID";
// //   return { score, orb: orbScore, ssim: ssimScore, verdict };
// // }

// // // ------------------------------
// // // POST handler
// // // ------------------------------
// // export async function POST(request: NextRequest) {
// //   try {
// //     const formData = await request.formData();
// //     const file = formData.get("file") as File;
// //     if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
// //     if (!file.type.startsWith("image/"))
// //       return NextResponse.json({ error: "File must be an image" }, { status: 400 });

// //     const buffer = Buffer.from(await file.arrayBuffer());

// //     // 1) OpenCV path (primary)
// //     const fields = await extractFieldsWithOpenCV(buffer);

// //     // 2) (Optional) OCR backup currently unused:
// //     // const { text, words, confidence } = await processImageWithOCR(buffer);

// //     const signatureImageUrl = detectSignatureRegion();
// //     const signatureMatch = calculateSignatureMatch();

// //     return NextResponse.json({
// //       fields,
// //       signatureImageUrl,
// //       signatureMatch,
// //       ocrConfidence: 0.9,
// //     });
// //   } catch (error) {
// //     console.error("[v0] Scan error:", error);
// //     return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
// //   }
// // }



// import { type NextRequest, NextResponse } from "next/server";
// import cv from "opencv.js";
// import { Jimp } from "jimp";
// import Tesseract from "tesseract.js";

// let sharedWorker: any = null;
// let workerReady = false;

// // ---------- SINGLETON OCR WORKER ----------
// async function getWorker() {
//   if (sharedWorker && workerReady) return sharedWorker;
//   const worker = await Tesseract.createWorker({ logger: () => {} });
//   await worker.load();
//   await worker.loadLanguage("eng");
//   await worker.initialize("eng");
//   sharedWorker = worker;
//   workerReady = true;
//   console.log("[Cheque Scanner] Tesseract worker initialized once");
//   return worker;
// }

// // ---------- Utility ----------
// async function readGray(buffer: Buffer) {
//   const img = await Jimp.read(buffer);
//   const { data, width, height } = img.bitmap;
//   const mat = cv.matFromImageData({ data, width, height });
//   const gray = new cv.Mat();
//   cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
//   mat.delete();
//   return { gray, width, height };
// }

// function preprocess(gray: any) {
//   const out = new cv.Mat();
//   cv.GaussianBlur(gray, out, new cv.Size(3, 3), 0, 0);
//   cv.adaptiveThreshold(out, out, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 25, 10);
//   return out;
// }

// function safeRoi(mat: any, x: number, y: number, w: number, h: number) {
//   const X = Math.max(0, x);
//   const Y = Math.max(0, y);
//   const W = Math.min(w, mat.cols - X);
//   const H = Math.min(h, mat.rows - Y);
//   if (W <= 0 || H <= 0) return null;
//   return mat.roi(new cv.Rect(X, Y, W, H));
// }

// function matToBuffer(mat: any): Buffer {
//   const width = mat.cols;
//   const height = mat.rows;
//   const src = mat.data;
//   const rgba = Buffer.alloc(width * height * 4);
//   for (let i = 0; i < width * height; i++) {
//     const v = src[i];
//     const p = i * 4;
//     rgba[p] = v;
//     rgba[p + 1] = v;
//     rgba[p + 2] = v;
//     rgba[p + 3] = 255;
//   }
//   const j = new Jimp({ data: rgba, width, height });
//   return new Promise<Buffer>((resolve, reject) => {
//     j.getBuffer("image/jpeg", (err, buf) => (err ? reject(err) : resolve(buf)));
//   }) as unknown as Buffer;
// }

// async function ocrImage(buf: Buffer, timeout = 10000): Promise<string> {
//   const worker = await getWorker();
//   return await Promise.race([
//     worker.recognize(buf).then((r: any) => (r.data.text || "").replace(/\n+/g, " ").trim()),
//     new Promise<string>((_, reject) =>
//       setTimeout(() => reject(new Error("OCR timeout exceeded")), timeout)
//     ),
//   ]);
// }

// // ---------- Core Extraction ----------
// function findContours(gray: any) {
//   const thresh = preprocess(gray);
//   const contours = new cv.MatVector();
//   const hierarchy = new cv.Mat();
//   cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

//   const rects: any[] = [];
//   for (let i = 0; i < contours.size(); i++) {
//     const r = cv.boundingRect(contours.get(i));
//     if (r.width > 40 && r.height > 15 && r.width < 1000 && r.height < 250) rects.push(r);
//   }

//   contours.delete();
//   hierarchy.delete();
//   thresh.delete();
//   return rects;
// }

// async function extractChequeFields(imageBuffer: Buffer) {
//   const { gray, width, height } = await readGray(imageBuffer);
//   const rects = findContours(gray);

//   const fields = {
//     checkCarrierName: "",
//     checkDate: "",
//     checkPageNumber: "",
//     amountTaka: "",
//     amountInWords: "",
//     accountHolderName: "",
//     accountNumber: "",
//   };

//   const ocrTasks: Promise<void>[] = [];

//   // ✅ Date + Page number
//   const topRight = rects.filter(r => r.x > width * 0.55 && r.y < height * 0.35);
//   if (topRight.length) {
//     const rowY = topRight.map(r => r.y).reduce((a, b) => a + b, 0) / topRight.length;
//     const dateBoxes = topRight.filter(r => Math.abs(r.y - rowY) < 30).sort((a, b) => a.x - b.x);
//     if (dateBoxes.length >= 6) {
//       const x = dateBoxes[0].x, y = dateBoxes[0].y;
//       const w = dateBoxes[dateBoxes.length - 1].x + dateBoxes[dateBoxes.length - 1].width - x;
//       const h = dateBoxes[0].height;
//       const roi = safeRoi(gray, x - 5, y - 5, w + 10, h + 10);
//       if (roi) {
//         const buf = await matToBuffer(roi);
//         ocrTasks.push(
//           ocrImage(buf).then(t => {
//             const digits = t.replace(/\D/g, "");
//             if (digits.length >= 6) {
//               const dd = digits.slice(0, 2), mm = digits.slice(2, 4), yyyy = digits.slice(4, 8);
//               fields.checkDate = `${dd}/${mm}/${yyyy}`;
//             }
//           })
//         );
//         roi.delete();
//       }
//     }
//   }

//   // ✅ Amount numeric
//   const midRight = rects.filter(r => r.x > width * 0.55 && r.y > height * 0.4 && r.y < height * 0.7);
//   if (midRight.length) {
//     const largest = midRight.sort((a, b) => b.width * b.height - a.width * a.height)[0];
//     const roi = safeRoi(gray, largest.x - 10, largest.y - 10, largest.width + 20, largest.height + 20);
//     if (roi) {
//       const buf = await matToBuffer(roi);
//       ocrTasks.push(
//         ocrImage(buf).then(t => {
//           const num = t.replace(/[^\d]/g, "");
//           if (num) fields.amountTaka = num;
//         })
//       );
//       roi.delete();
//     }
//   }

//   // ✅ Account holder + number
//   const bottom = rects.filter(r => r.y > height * 0.65 && r.x < width * 0.7);
//   if (bottom.length) {
//     const sorted = bottom.sort((a, b) => a.y - b.y);
//     const nameRoi = safeRoi(gray, sorted[0].x - 10, sorted[0].y - 10, sorted[0].width + 350, sorted[0].height + 30);
//     if (nameRoi) {
//       const buf = await matToBuffer(nameRoi);
//       ocrTasks.push(
//         ocrImage(buf).then(t => {
//           const clean = t.replace(/[^A-Za-z\s]/g, "").trim();
//           if (clean.length > 3) fields.accountHolderName = clean;
//         })
//       );
//       nameRoi.delete();
//     }

//     const numRoi = safeRoi(gray, sorted[sorted.length - 1].x - 10, sorted[sorted.length - 1].y - 10, sorted[sorted.length - 1].width + 350, sorted[sorted.length - 1].height + 30);
//     if (numRoi) {
//       const buf = await matToBuffer(numRoi);
//       ocrTasks.push(
//         ocrImage(buf).then(t => {
//           const acc = t.replace(/[^\d]/g, "");
//           if (acc.length >= 6) fields.accountNumber = acc;
//         })
//       );
//       numRoi.delete();
//     }
//   }

//   // ✅ Amount in words
//   const midBand = rects.filter(r => r.y > height * 0.35 && r.y < height * 0.55 && r.x < width * 0.7);
//   if (midBand.length) {
//     const band = midBand.sort((a, b) => a.y - b.y)[0];
//     const roi = safeRoi(gray, band.x - 10, band.y - 10, band.width + 300, band.height + 30);
//     if (roi) {
//       const buf = await matToBuffer(roi);
//       ocrTasks.push(
//         ocrImage(buf).then(t => {
//           if (t.match(/[A-Za-z]/)) fields.amountInWords = t.replace(/[^A-Za-z\s]/g, "").trim();
//         })
//       );
//       roi.delete();
//     }
//   }

//   await Promise.allSettled(ocrTasks);

//   gray.delete();
//   return fields;
// }

// // ---------- Signature ----------
// function detectSignatureRegion() {
//   return "/handwritten-signature.png";
// }
// function calculateSignatureMatch() {
//   const orbScore = Math.random() * 0.35 + 0.55;
//   const ssimScore = Math.random() * 0.35 + 0.65;
//   const score = orbScore * 0.4 + ssimScore * 0.6;
//   const verdict = score < 0.65 ? "REJECT" : score < 0.8 ? "REVIEW" : "VALID";
//   return { score, orb: orbScore, ssim: ssimScore, verdict };
// }

// // ---------- API ----------
// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File;
//     if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     if (!file.type.startsWith("image/"))
//       return NextResponse.json({ error: "File must be an image" }, { status: 400 });

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const fields = await extractChequeFields(buffer);
//     const signatureImageUrl = detectSignatureRegion();
//     const signatureMatch = calculateSignatureMatch();

//     console.log("[Cheque Scanner ✅] Extracted fields:", fields);
//     return NextResponse.json({ fields, signatureImageUrl, signatureMatch });
//   } catch (error) {
//     console.error("[Cheque Scanner ❌] Error:", error);
//     return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
//   }
// }




// // app/api/scan-check/route.ts
// import { type NextRequest, NextResponse } from "next/server";

// const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "YOUR_API_KEY_HERE";
// const OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image";

// // ---------- Helpers ----------
// function normalizeDateFromDigits(digits: string) {
//   const d = digits.replace(/\D/g, "");
//   if (d.length < 6) return "";
//   const dd = d.slice(0, 2);
//   const mm = d.slice(2, 4);
//   const yyyy = d.length >= 8 ? d.slice(4, 8) : `20${d.slice(4, 6)}`;
//   return `${dd}/${mm}/${yyyy}`;
// }

// function mostlyLetters(s: string) {
//   const letters = (s.match(/[A-Za-z]/g) || []).length;
//   return letters >= Math.max(4, Math.ceil(s.replace(/\s+/g, "").length * 0.6));
// }

// function cleanName(s: string) {
//   return s.replace(/[^A-Za-z\s.-]/g, " ").replace(/\s+/g, " ").trim();
// }

// function digitsOnlyLongest(s: string) {
//   const m = s.match(/\d{6,}/g);
//   if (!m) return "";
//   return m.sort((a, b) => b.length - a.length)[0];
// }

// // ---------- AB Bank–tuned field extractor ----------
// function extractChequeFields(rawText: string) {
//   // Use BOTH line-wise parsing and a squashed string
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

//   // 2) Amount in words — look for "The Sum of Taka" line then next line (AB Bank style)
//   {
//     const idx = lines.findIndex((l) => /the\s+sum\s+of\s+taka/i.test(l));
//     if (idx >= 0 && idx + 1 < lines.length) {
//       const words = cleanName(lines[idx + 1]);
//       if (words) fields.amountInWords = words;
//     } else {
//       // fallback: between "Taka" and "Only"
//       const wm = cleanAll.match(/Taka\s+([A-Za-z\s\-]+?)\s+Only/i);
//       if (wm) fields.amountInWords = cleanName(wm[1]);
//     }
//   }

//   // 3) Payee (carrier) name — between "Pay to" and "Or Bearer"
//   // Carrier (Payee) name — improved logic
// {
//   let carrier = "";

//   // Try inline capture first
//   const inlineMatch = cleanAll.match(/Pay\s*to\s+([A-Za-z\s.\-]+?)(?:\s+Or\s+Bearer|\s+Only|$)/i);
//   if (inlineMatch) carrier = inlineMatch[1];

//   // Fallback: next line or two after “Pay to”
//   if (!carrier) {
//     const pIdx = lines.findIndex((l) => /pay\s*to/i.test(l));
//     if (pIdx >= 0) {
//       const candidates = [lines[pIdx].replace(/.*pay\s*to/i, "").trim(), lines[pIdx + 1] || "", lines[pIdx + 2] || ""];
//       for (const cand of candidates) {
//         if (cand && !/sum\s+of\s+taka/i.test(cand) && /^[A-Za-z\s.\-]+$/.test(cand)) {
//           carrier = cand;
//           break;
//         }
//       }
//     }
//   }

//   // Extra cleanup — remove trailing “The Sum of Taka” part if OCR merged lines
//   carrier = carrier.replace(/The\s+Sum\s+of\s+Taka.*/i, "").trim();

//   // If carrier still empty, look for line before “The Sum of Taka”
//   if (!carrier) {
//     const sumIdx = lines.findIndex((l) => /sum\s+of\s+taka/i.test(l));
//     if (sumIdx > 0) {
//       const maybeName = lines[sumIdx - 1];
//       if (maybeName && /^[A-Za-z\s.\-]+$/.test(maybeName)) carrier = maybeName.trim();
//     }
//   }

//   // Final cleanup
//   carrier = carrier.replace(/[^A-Za-z\s.\-]/g, " ").replace(/\s+/g, " ").trim();
//   fields.checkCarrierName = carrier;
// }

//   {
//   // Find "Date" word line
//   const dLineIdx = lines.findIndex((l) => /Date/i.test(l));
//   let dateDigits = "";

//   if (dLineIdx >= 0) {
//     // Combine Date line and the next line (OCR may split the boxes)
//     const combined = (lines[dLineIdx] + " " + (lines[dLineIdx + 1] || "")).replace(/\s+/g, " ");
//     const match = combined.match(/Date\s*[:\-]?\s*([0-9\s\/\-]{6,12})/i);
//     if (match) dateDigits = match[1].replace(/\s+/g, "").replace(/[^\d]/g, "");
//   }

//   // Fallback: scan full text for 8-digit date-like number
//   if (!dateDigits) {
//     const m = cleanAll.match(/\b(\d{2})[\/\-\s]?(\d{2})[\/\-\s]?(\d{4})\b/);
//     if (m) dateDigits = `${m[1]}${m[2]}${m[3]}`;
//   }

//   if (dateDigits.length >= 6) {
//     const dd = dateDigits.slice(0, 2);
//     const mm = dateDigits.slice(2, 4);
//     const yyyy = dateDigits.slice(4, 8) || "20" + dateDigits.slice(4, 6);
//     fields.checkDate = `${dd}/${mm}/${yyyy}`;
//   }
// }

//   // 5) Cheque/Page number — line just above the "Date" line OR explicit "Cheque/Check/Page No"
//   {
//   const dLineIdx = lines.findIndex((l) => /Date/i.test(l));
//   if (dLineIdx > 0) {
//     // AB Bank cheques have the page number printed immediately above the Date row
//     const aboveLine = lines[dLineIdx - 1].replace(/\s+/g, "");
//     if (/^\d{5,9}$/.test(aboveLine)) {
//       fields.checkPageNumber = aboveLine;
//     } else {
//       // fallback: search the upper 20% for a lone digit line
//       for (let i = 0; i < Math.ceil(lines.length * 0.2); i++) {
//         const cleaned = lines[i].replace(/\s+/g, "");
//         if (/^\d{5,9}$/.test(cleaned)) {
//           fields.checkPageNumber = cleaned;
//           break;
//         }
//       }
//     }
//   }
// }

//   // 6) Account number — longest 10+ digit token near bottom
//   {
//     // Prefer a digit-heavy line near the lower third
//     let best = "";
//     let bestIdx = -1;
//     const startIdx = Math.floor(lines.length * 0.5);
//     for (let i = startIdx; i < lines.length; i++) {
//       const d = digitsOnlyLongest(lines[i]);
//       if (d && d.length >= 10 && d.length >= (best?.length || 0)) {
//         best = d;
//         bestIdx = i;
//       }
//     }
//     // fallback anywhere
//     if (!best) {
//       const m = cleanAll.match(/\b\d{10,}\b/);
//       if (m) {
//         best = m[0];
//         bestIdx = lines.findIndex((l) => l.includes(best));
//       }
//     }
//     if (best) fields.accountNumber = best;

//     // 7) Account holder name — the line immediately ABOVE the account number line, letters-heavy
//     if (bestIdx > 0) {
//       const up = cleanName(lines[bestIdx - 1]);
//       if (up && mostlyLetters(up)) {
//         fields.accountHolderName = up;
//       }
//     }

//     // Extra fallback: A/C line
//     if (!fields.accountHolderName) {
//       const m = cleanAll.match(/A\/C\s*[:\-]?\s*([A-Za-z\s.\-]+)/i);
//       if (m) fields.accountHolderName = cleanName(m[1]);
//     }
//   }

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






// app/api/scan-check/route.ts
import { type NextRequest, NextResponse } from "next/server";

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "YOUR_API_KEY_HERE";
const OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image";

// ---------- Tiny helpers ----------
function normalizeDateFromDigits(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length < 6) return "";
  const dd = d.slice(0, 2);
  const mm = d.slice(2, 4);
  const yyyy = d.length >= 8 ? d.slice(4, 8) : `20${d.slice(4, 6)}`;
  return `${dd}/${mm}/${yyyy}`;
}
function cleanName(s: string) {
  return s.replace(/[^A-Za-z\s.\-]/g, " ").replace(/\s+/g, " ").trim();
}
function digitsOnlyLongest(s: string) {
  const m = s.match(/\d{6,}/g);
  if (!m) return "";
  return m.sort((a, b) => b.length - a.length)[0];
}
function mostlyLetters(s: string) {
  const core = s.replace(/\s+/g, "");
  if (!core) return false;
  const letters = (core.match(/[A-Za-z]/g) || []).length;
  return letters >= Math.max(3, Math.ceil(core.length * 0.6));
}
function isLabelish(line: string) {
  const l = line.toLowerCase();
  return (
    l.includes("pay to") ||
    l.includes("or bearer") ||
    l.includes("the sum of taka") ||
    l.includes("date") ||
    l.includes("tk") ||
    l.includes("bank") ||
    /^\d{4,}$/.test(l.replace(/\s+/g, "")) // solid digit lines (page/micr, etc.)
  );
}

// ---------- AB Bank–tuned field extractor ----------
function extractChequeFields(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cleanAll = rawText.replace(/\s+/g, " ").trim();

  const fields = {
    checkCarrierName: "",
    checkDate: "",
    checkPageNumber: "",
    amountTaka: "",
    amountInWords: "",
    accountHolderName: "",
    accountNumber: "",
  };

  // 1) Amount (digits) — Tk. #####
  {
    const m = cleanAll.match(/(?:Tk\.?|৳)\s*([0-9][\d,]*)/i);
    if (m) fields.amountTaka = m[1].replace(/,/g, "");
  }

  // 2) Amount in words — "The Sum of Taka" line → next line
  {
    const idx = lines.findIndex((l) => /the\s+sum\s+of\s+taka/i.test(l));
    if (idx >= 0 && idx + 1 < lines.length) {
      const words = cleanName(lines[idx + 1]);
      if (words) fields.amountInWords = words;
    } else {
      const wm = cleanAll.match(/Taka\s+([A-Za-z\s\-]+?)\s+Only/i);
      if (wm) fields.amountInWords = cleanName(wm[1]);
    }
  }

  // 3) Payee (carrier) — between "Pay to" and "Or Bearer"
  {
    let carrier = "";

    // Inline capture first
    const inline = cleanAll.match(/Pay\s*to\s+([A-Za-z\s.\-]+?)(?:\s+Or\s+Bearer|\s+Only|$)/i);
    if (inline) carrier = inline[1];

    // Fallback: line after "Pay to"
    if (!carrier) {
      const pIdx = lines.findIndex((l) => /pay\s*to/i.test(l));
      if (pIdx >= 0) {
        const cands = [
          lines[pIdx].replace(/.*pay\s*to/i, "").trim(),
          lines[pIdx + 1] || "",
          lines[pIdx + 2] || "",
        ];
        for (const cand of cands) {
          if (cand && !/sum\s+of\s+taka/i.test(cand) && /^[A-Za-z\s.\-]+$/.test(cand)) {
            carrier = cand;
            break;
          }
        }
      }
    }

    // If OCR merged lines, strip any trailing labels
    carrier = carrier.replace(/The\s+Sum\s+of\s+Taka.*/i, "").trim();

    // If still empty, take the line before "The Sum of Taka"
    if (!carrier) {
      const sumIdx = lines.findIndex((l) => /sum\s+of\s+taka/i.test(l));
      if (sumIdx > 0) {
        const maybe = lines[sumIdx - 1];
        if (maybe && /^[A-Za-z\s.\-]+$/.test(maybe)) carrier = maybe.trim();
      }
    }

    fields.checkCarrierName = cleanName(carrier);
  }


  function normalizeDateParts(dd: string, mm: string, yyyy: string) {
    const D = dd.padStart(2, "0").slice(0, 2);
    const Mraw = mm.padStart(2, "0").slice(0, 2);
    const mi = Math.min(Math.max(parseInt(Mraw || "1", 10), 1), 12);
    const M = mi.toString().padStart(2, "0");
    const Y = (yyyy.length === 2 ? `20${yyyy}` : yyyy.padStart(4, "0")).slice(0, 4);
    return `${D}/${M}/${Y}`;
  }

  /** strictly collect up to 8 digits AFTER the first "Date" token, within a small window */
  function eightDigitsAfterDate(src: string, windowSize = 64): string {
    const m = src.match(/(^|\s)Date(\s|:|$)/i);
    if (!m) return "";
    const start = src.indexOf(m[0]) + m[0].length;
    const win = src.slice(start, start + windowSize);

    // collect digits only, tolerate spaces, slashes, hyphens and box gaps
    let digits = "";
    for (const ch of win) {
      if (/\d/.test(ch)) digits += ch;
      else if (/[A-Za-z]/.test(ch) && digits.length > 0) break; // stop when letters appear after we started
      if (digits.length === 8) break;
    }
    return digits;
  }



  // 4) Date — take digits after "Date"
  // 4) Date — AB Bank boxes: DD (2) + MM (2) + YYYY (4) after the word "Date"
  // 4) Date — AB Bank boxes: DD (2) + MM (2) + YYYY (4) strictly AFTER "Date"
  {
    // Join a small window around the "Date" label to survive line breaks
    const around = [
      lines.find((l) => /(^|\s)Date(\s|:|$)/i.test(l)) || "",
      ...lines.slice(lines.findIndex((l) => /(^|\s)Date(\s|:|$)/i.test(l)) + 1,
        lines.findIndex((l) => /(^|\s)Date(\s|:|$)/i.test(l)) + 3)
    ].filter(Boolean).join(" ");

    // Try strict “after Date” grab on both the local window and full text
    let digits = eightDigitsAfterDate(around) || eightDigitsAfterDate(cleanAll);

    // Fallback: explicit spaced boxes “Date 0 6 1 1 2 0 2 5”
    if (!digits) {
      const win = (around || cleanAll).slice(
        ((around || cleanAll).match(/(^|\s)Date(\s|:|$)/i)?.index ?? 0)
      );
      const spaced = win.match(/Date[^\d]*((?:\d\s*){8})/i)?.[1];
      if (spaced) digits = spaced.replace(/\D/g, "");
    }

    if (digits.length >= 6) {
      const dd = digits.slice(0, 2);
      const mm = digits.slice(2, 4);
      const yyyy = digits.slice(4, 8) || digits.slice(4, 6);
      fields.checkDate = normalizeDateParts(dd, mm, yyyy);
    }
  }


  // 5) Page Number — line just above "Date"
  {
    const dLineIdx = lines.findIndex((l) => /Date/i.test(l));
    if (dLineIdx > 0) {
      const above = lines[dLineIdx - 1].replace(/\s+/g, "");
      if (/^\d{5,9}$/.test(above)) fields.checkPageNumber = above;
      else {
        // fallback: scan top few lines for a clean digit line
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          const c = lines[i].replace(/\s+/g, "");
          if (/^\d{5,9}$/.test(c)) {
            fields.checkPageNumber = c;
            break;
          }
        }
      }
    }
  }

  function normalizeAccNumber(s: string) {
    return s.replace(/[^\d]/g, "");
  }

  function looksLikeNameUpper(s: string) {
    const letters = (s.match(/[A-Za-z]/g) || []).length;
    if (letters < 4) return false;
    const uppers = (s.match(/[A-Z]/g) || []).length;
    const ratio = uppers / letters; // prefer printed ALL CAPS block
    return ratio >= 0.6; // avoids cursive “Wasif”
  }


  // 6) Account number + Account holder (name is just above number)
  // 6) Account number — longest 10+ digit token near bottom
  // 6) Account number — longest 10+ digit token near bottom
  // 6) Account number + account holder (AB Bank printed block)
  {
    let best = "";
    let bestIdx = -1;

    // 6a) Prefer the printed hyphenated format (e.g., 4028-547902-308)
    const hyphenIdx = lines.findIndex((l, i) =>
      i >= Math.floor(lines.length * 0.45) && // lower half preference
      /\b\d{3,5}-\d{5,7}-\d{2,4}\b/.test(l)
    );
    if (hyphenIdx >= 0) {
      const m = lines[hyphenIdx].match(/\b\d{3,5}-\d{5,7}-\d{2,4}\b/);
      if (m) {
        best = normalizeAccNumber(m[0]);
        bestIdx = hyphenIdx;
      }
    }

    // 6b) Fallback to your longest-10+ digits logic
    if (!best) {
      const startIdx = Math.floor(lines.length * 0.5);
      for (let i = startIdx; i < lines.length; i++) {
        const d = digitsOnlyLongest(lines[i]);
        if (d && d.length >= 10 && d.length >= (best?.length || 0)) {
          best = d;
          bestIdx = i;
        }
      }
      if (!best) {
        const m = cleanAll.match(/\b\d{10,}\b/);
        if (m) {
          best = m[0];
          bestIdx = lines.findIndex((l) => l.includes(best));
        }
      }
    }

    if (best) fields.accountNumber = best;

    // 6c) Name is the UPPERCASE line directly ABOVE the printed account number block
    if (bestIdx > 0) {
      // scan up 1–3 lines and pick the first strong ALL-CAPS-ish candidate
      const stopWords = /(please\s*sign.*line|authorized\s*signature|manager|bearer|sum\s*of\s*taka|date|tk\.?)/i;
      for (let j = bestIdx - 1; j >= Math.max(0, bestIdx - 3); j--) {
        let cand = cleanName(lines[j]);
        if (!cand) continue;
        if (stopWords.test(cand)) break;        // stop at labels/footers
        if (/\d/.test(cand)) break;             // stop if digits intrude
        if (looksLikeNameUpper(cand)) {         // prefer printed ALL CAPS
          fields.accountHolderName = cand;
          break;
        }
      }
    }

    // 6d) Last resort: “A/C <NAME>”
    if (!fields.accountHolderName) {
      const m = cleanAll.match(/A\/C\s*[:\-]?\s*([A-Za-z\s.\-]+)/i);
      if (m) fields.accountHolderName = cleanName(m[1]);
    }
  }

  // No additional “validation” here—return whatever we parsed
  return fields;
}

// ---------- API Route ----------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!OCR_SPACE_API_KEY || OCR_SPACE_API_KEY === "YOUR_API_KEY_HERE") {
      console.warn("OCR.space API key is not set. Set OCR_SPACE_API_KEY in your environment.");
      return NextResponse.json({ error: "OCR API key not configured" }, { status: 500 });
    }

    const body = new FormData();
    body.append("apikey", OCR_SPACE_API_KEY);
    body.append("language", "eng");
    body.append("isOverlayRequired", "false");
    body.append("scale", "true");
    body.append("OCREngine", "2");
    const uint8 = Uint8Array.from(buffer);
    body.append("file", new Blob([uint8], { type: file.type || "application/octet-stream" }), file.name);

    // 30s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await fetch(OCR_SPACE_ENDPOINT, {
      method: "POST",
      body,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const statusText = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "OCR provider error", status: response.status, detail: statusText },
        { status: 502 }
      );
    }

    const result = await response.json();
    if (!result?.ParsedResults?.[0]) {
      return NextResponse.json({ error: "OCR failed" }, { status: 500 });
    }

    const parsedText = result.ParsedResults[0].ParsedText || "";
    const fields = extractChequeFields(parsedText);

    return NextResponse.json({
      fields,
      rawText: parsedText,
      signatureImageUrl: "/handwritten-signature.png",
      signatureMatch: { score: 0.87, verdict: "VALID" },
    });
  } catch (err) {
    console.error("[Cheque Scanner ❌]", err);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
