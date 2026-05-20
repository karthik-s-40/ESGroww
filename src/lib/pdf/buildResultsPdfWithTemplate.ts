import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import {
  A4_PORTRAIT_PT,
  PDF_RASTER_SCALE,
  PDF_TEMPLATE_URL,
  pdfPointsToCssPx,
} from "@/lib/pdf/pdfConstants";

function ensureImagesLoaded(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth !== 0) {
            resolve();
            return;
          }
          const finish = () => {
            img.removeEventListener("load", finish);
            img.removeEventListener("error", finish);
            resolve();
          };
          img.addEventListener("load", finish);
          img.addEventListener("error", finish);
        })
    )
  ).then(() => undefined);
}

function normalizeCaptureSubtree(node: HTMLElement) {
  node.style.boxSizing = "border-box";
  node.style.pointerEvents = "none";
  for (const child of Array.from(node.children)) {
    if (child instanceof HTMLElement) normalizeCaptureSubtree(child);
  }
}

async function waitForStableRender() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await new Promise<void>((resolve) => setTimeout(resolve, 80));
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob returned null."));
          return;
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Builds a multi-page PDF by copying the vector template once per page, then drawing a
 * transparent-background raster overlay produced from dedicated print nodes (`[data-pdf-page]`).
 * Does not capture the dashboard DOM or slice a single tall screenshot.
 */
export async function buildResultsPdfWithTemplate(captureRoot: HTMLElement): Promise<Uint8Array> {
  const pageEls = Array.from(captureRoot.querySelectorAll<HTMLElement>("[data-pdf-page]"));
  if (pageEls.length === 0) {
    throw new Error('No printable pages found. Add elements with the attribute data-pdf-page="" inside the export root.');
  }

  const templateRes = await fetch(PDF_TEMPLATE_URL);
  if (!templateRes.ok) {
    throw new Error(`Could not load PDF template (${PDF_TEMPLATE_URL}).`);
  }
  const templateBytes = await templateRes.arrayBuffer();
  const templateDoc = await PDFDocument.load(templateBytes);
  const templatePageIndex = 0;
  let pageWPt = A4_PORTRAIT_PT.width;
  let pageHPt = A4_PORTRAIT_PT.height;
  try {
    const s = templateDoc.getPage(templatePageIndex).getSize();
    pageWPt = s.width;
    pageHPt = s.height;
  } catch {
    /* use defaults */
  }

  const cssW = pdfPointsToCssPx(pageWPt);
  const cssH = pdfPointsToCssPx(pageHPt);

  const outDoc = await PDFDocument.create();

  for (const pageEl of pageEls) {
    pageEl.style.width = `${cssW}px`;
    pageEl.style.height = `${cssH}px`;
    pageEl.style.boxSizing = "border-box";
  }
  await waitForStableRender();

  for (const pageEl of pageEls) {
    const clone = pageEl.cloneNode(true) as HTMLElement;
    normalizeCaptureSubtree(clone);
    clone.style.width = `${cssW}px`;
    clone.style.height = `${cssH}px`;
    clone.style.position = "relative";
    clone.style.overflow = "hidden";
    clone.style.opacity = "1";

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-pdf-export-wrapper", "");
    wrapper.style.cssText = [
      "position:fixed",
      "left:-32768px",
      "top:0",
      `width:${cssW}px`,
      `height:${cssH}px`,
      "overflow:hidden",
      "pointer-events:none",
      "z-index:-1",
      "visibility:visible",
    ].join(";");

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      await waitForStableRender();
      await ensureImagesLoaded(clone);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const canvas = await html2canvas(clone, {
        scale: PDF_RASTER_SCALE,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        width: cssW,
        height: cssH,
        windowWidth: cssW,
        windowHeight: cssH,
        ignoreElements: (element) => element.hasAttribute("data-html2canvas-ignore"),
      });

      if (!canvas || canvas.width < 2 || canvas.height < 2) {
        throw new Error("Print page rasterization failed (empty canvas).");
      }

      const pngBytes = await canvasToPngBytes(canvas);
      const png = await outDoc.embedPng(pngBytes);

      const [embedded] = await outDoc.copyPages(templateDoc, [templatePageIndex]);
      outDoc.addPage(embedded);
      const page = outDoc.getPage(outDoc.getPageCount() - 1);

      page.drawImage(png, {
        x: 0,
        y: 0,
        width: pageWPt,
        height: pageHPt,
      });
    } finally {
      document.body.removeChild(wrapper);
    }
  }

  return outDoc.save({ useObjectStreams: true });
}

export function triggerPdfDownload(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
