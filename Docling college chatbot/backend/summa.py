from docling.document_converter import DocumentConverter
import pprint  # For pretty printing complex structures
import os  # To ensure the path is correct

# Ensure the file path is correct relative to your script
pdf_file_path = "pdf_jpg_test//pdf//CSE-Labs.pdf"

# --- Docling Conversion ---
conv = DocumentConverter()

print(f"Attempting to convert: {pdf_file_path}")

res=conv.convert(pdf_file_path)

doc=res.document

dic=doc.export_to_markdown()

print(dic)

print(type(dic))
