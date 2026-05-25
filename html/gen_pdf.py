"""
Generates resume PDFs from html/resume.html.html.

Chromium-on-Windows won't embed web fonts in PDFs (it uses system Arial as
fallback) — and inline SVGs get rasterized into bloated Type3 fonts. So
this script:
  1. Reads source HTML
  2. Strips inline <svg> elements (drops Type3 bloat)
  3. Adds a CSS override forcing Georgia (serif) + Helvetica Neue/Arial (sans)
     since Fraunces/Inter Tight won't embed anyway
  4. Renders via Playwright Chromium
"""
from playwright.sync_api import sync_playwright
import http.server, socketserver, threading, shutil, os, functools, re

base = r"D:\SeriousProjects\me\agampreet-site"
html_dir = os.path.join(base, "html")
src_html = os.path.join(html_dir, "resume.html.html")
tmp_html = os.path.join(html_dir, "_resume_pdf_tmp.html")
pdf1 = os.path.join(base, "AgampreetSingh_Resume_8YOE.pdf")
pdf2 = os.path.join(base, "resume.pdf")

with open(src_html, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Strip inline SVG elements (they bloat the PDF as Type3 fonts)
html = re.sub(r'<svg\b[^>]*>.*?</svg>', '', html, flags=re.DOTALL)

# 2. Adjust the contact list since icons are gone (remove .icon spacing rules indirectly via gap)
# 3. Inject font override so Chromium uses Georgia (editorial serif on Windows)
#    rather than falling back to Arial for serif text
override = """
<style>
  :root {
    --serif: 'Georgia', 'Times New Roman', serif;
    --sans:  'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  }
  /* Drop now-empty icon gap */
  .contact li { gap: 0; }
</style>
</head>"""
html = html.replace("</head>", override, 1)

with open(tmp_html, "w", encoding="utf-8") as f:
    f.write(html)

PORT = 8765
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=html_dir)
httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

url = f"http://127.0.0.1:{PORT}/_resume_pdf_tmp.html"

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.evaluate("async () => { await document.fonts.ready; }")
        page.emulate_media(media="print")
        page.wait_for_timeout(1500)
        page.pdf(
            path=pdf1,
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        )
        browser.close()
finally:
    httpd.shutdown()
    try: os.remove(tmp_html)
    except: pass

shutil.copy2(pdf1, pdf2)
print(f"Created: AgampreetSingh_Resume_8YOE.pdf ({os.path.getsize(pdf1)//1024} KB)")
print(f"Created: resume.pdf ({os.path.getsize(pdf2)//1024} KB)")
