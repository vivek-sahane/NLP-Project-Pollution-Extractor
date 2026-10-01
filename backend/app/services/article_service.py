import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, Any
from io import BytesIO

class ArticleService:
    """
    Article & Document fetcher and text extractor for news URLs, .txt, and .pdf files.
    """

    def fetch_article_text(self, url: str) -> Dict[str, Any]:
        """Fetch readable text from news article URL."""
        if not url or not (url.startswith("http://") or url.startswith("https://")):
            return {"success": False, "error": "Invalid URL provided. Must start with http:// or https://"}

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            response = requests.get(url, headers=headers, timeout=8)
            if response.status_code != 200:
                return {"success": False, "error": f"Failed to retrieve URL (HTTP status {response.status_code})."}

            soup = BeautifulSoup(response.text, "html.parser")
            
            # Remove scripts, styles, header, footer
            for s in soup(["script", "style", "nav", "footer", "header", "aside"]):
                s.decompose()

            # Find paragraphs or main article body
            paragraphs = soup.find_all("p")
            text = " ".join([p.get_text() for p in paragraphs if len(p.get_text().strip()) > 30])

            if not text or len(text.strip()) < 50:
                # Fallback to body text
                text = soup.body.get_text() if soup.body else ""
                text = re.sub(r'\s+', ' ', text).strip()

            if not text or len(text) < 30:
                return {"success": False, "error": "Could not extract readable article text from the URL. Please copy and paste the text manually."}

            return {
                "success": True,
                "url": url,
                "title": soup.title.string.strip() if soup.title else "News Article",
                "extracted_text": text[:5000] # Cap text length for sanity
            }
        except Exception as e:
            return {"success": False, "error": f"Error fetching article URL: {str(e)}"}

    def extract_text_from_file(self, filename: str, file_bytes: bytes) -> Dict[str, Any]:
        """Extract plain text from uploaded .txt or .pdf files."""
        if not filename:
            return {"success": False, "error": "Filename is required."}

        ext = filename.split(".")[-1].lower()

        if ext == "txt":
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
                return {"success": True, "filename": filename, "extracted_text": text, "char_count": len(text)}
            except Exception as e:
                return {"success": False, "error": f"Failed to parse text file: {e}"}

        elif ext == "pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(BytesIO(file_bytes))
                text_content = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        text_content.append(t)
                full_text = "\n".join(text_content)
                if not full_text.strip():
                    return {"success": False, "error": "PDF file appears to be empty or image-only."}
                return {"success": True, "filename": filename, "extracted_text": full_text, "char_count": len(full_text)}
            except Exception as e:
                return {"success": False, "error": f"Failed to parse PDF document: {e}"}

        else:
            return {"success": False, "error": f"Unsupported file extension '.{ext}'. Supported formats: .txt, .pdf"}

article_service = ArticleService()
