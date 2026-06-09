import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    # Open PDF from bytes
    pdf = fitz.open(stream=file_bytes, filetype="pdf")
    
    text = ""
    
    # Loop through every page
    for page in pdf:
        text += page.get_text()
    
    pdf.close()
    
    return text