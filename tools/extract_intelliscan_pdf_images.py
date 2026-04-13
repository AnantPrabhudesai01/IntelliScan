from __future__ import annotations

from pathlib import Path

import fitz  # PyMuPDF


def extract_images_and_renders(
    pdf_path: Path,
    out_dir: Path,
    *,
    render_page_ranges: list[range],
    zoom: float = 2.0,
) -> dict[str, int]:
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)

    embedded_count = 0
    for page_index in range(len(doc)):
        page = doc[page_index]
        images = page.get_images(full=True)
        if not images:
            continue
        for img_i, img in enumerate(images):
            xref = img[0]
            base = doc.extract_image(xref)
            ext = base.get("ext", "png")
            img_bytes = base["image"]
            name = f"p{page_index+1:03d}_img{img_i+1:02d}.{ext}"
            (out_dir / name).write_bytes(img_bytes)
            embedded_count += 1

    render_count = 0
    mat = fitz.Matrix(zoom, zoom)
    pages_to_render: set[int] = set()
    for r in render_page_ranges:
        pages_to_render.update(r)

    for page_index in sorted(pages_to_render):
        if page_index < 0 or page_index >= len(doc):
            continue
        page = doc[page_index]
        pix = page.get_pixmap(matrix=mat, alpha=False)
        pix.save(out_dir / f"p{page_index+1:03d}_render.png")
        render_count += 1

    return {"pages": len(doc), "embedded_images": embedded_count, "rendered_pages": render_count}


if __name__ == "__main__":
    pdf_path = Path(
        r"c:\Users\anant\AppData\Roaming\Cursor\User\workspaceStorage\d62e7c717059fa0dd774034063b00137\pdfs\8a8acbe8-fa43-498e-a129-10ee090e244f\IntelliScan-Documentation-FInal-College.pdf"
    )
    out_dir = Path(__file__).resolve().parent / "extracted" / "intelliscan-pdf"

    # Based on the document structure:
    # - UML/Design section appears around pages 15–37 (1-indexed), i.e. 14–36 (0-indexed).
    # - UI screenshots appear around pages 41–66 (1-indexed), i.e. 40–65 (0-indexed).
    stats = extract_images_and_renders(
        pdf_path,
        out_dir,
        render_page_ranges=[
            range(14, 37),  # UML/design content pages (0-indexed)
            range(40, 66),  # UI screenshots content pages (0-indexed)
        ],
        zoom=2.0,
    )

    print(f"PDF pages: {stats['pages']}")
    print(f"Embedded images extracted: {stats['embedded_images']}")
    print(f"Rendered pages saved: {stats['rendered_pages']}")
    print(f"Output directory: {out_dir}")
