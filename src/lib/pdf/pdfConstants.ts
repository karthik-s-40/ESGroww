/** Public URL to the branded PDF base (vector background per page). */
export const PDF_TEMPLATE_URL = "/pdf_template/template.pdf";

/** Default A4 portrait (pt); replaced at export time by the loaded template’s media box when different. */
export const A4_PORTRAIT_PT = { width: 595.28, height: 841.89 };

export function pdfPointsToCssPx(pt: number): number {
  return Math.round((pt * 96) / 72);
}

export const A4_PORTRAIT_CSS_PX = {
  width: pdfPointsToCssPx(A4_PORTRAIT_PT.width),
  height: pdfPointsToCssPx(A4_PORTRAIT_PT.height),
};

/** html2canvas scale — balance sharpness vs memory. */
export const PDF_RASTER_SCALE = 2;

/** Centered logo watermark (printed-on-paper feel). */
export const PDF_WATERMARK_OPACITY = 0.028;

/** Print-safe inner padding (px) inside each logical page. */
export const PDF_CONTENT_INSET_PX = { top: 44, right: 40, bottom: 52, left: 40 };
