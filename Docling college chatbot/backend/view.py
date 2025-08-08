import lancedb
from sentence_transformers import SentenceTransformer
from lancedb.pydantic import LanceModel,Vector
from lancedb.embeddings import get_registry



HUGGING_FACE_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
func = get_registry().get("sentence-transformers").create(name=HUGGING_FACE_EMBEDDING_MODEL)

class Chunks(LanceModel):
    text: str = func.SourceField()
    vector: Vector(func.ndims()) = func.VectorField()

class Chunks2(LanceModel):
    text: str = func.SourceField()
    vector: Vector(func.ndims()) = func.VectorField()
    cid : int


# Load the sentence transformer model (or use the one your table was built with)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to the LanceDB
DB_PATH = "data/lancedb"
db = lancedb.connect(DB_PATH)

# Open the table
table_name1 = "docling_huggingface_embeddings"
table_name="testing_table_fitz"
TABLE_NAME="pdfdetails"
table="testing_table"

def see(table_name):
    table = db.open_table(table_name)

    # Print total rows
    row_count = table.count_rows()
    print(f"Total rows in table '{table_name}': {row_count}")

    # Convert full table to pandas and show
    df = table.to_pandas()
    print(df)

def search(query,table):
    table=db.open_table(table)
    query_embedding = model.encode(query).tolist()
    results = table.search(query_embedding).limit(1).to_pandas()
    tdf=table.to_pandas()
    val=results["cid"]
    pcid=[(i-5,i+5) for i in val]
    print(pcid)
    st=""
    for i in pcid:
        st+=tdf["text"].iloc[i[0]:i[1]+1]
    print(st)
    relevant_texts = [result for result in st]
    print(relevant_texts)
    if not relevant_texts:
        return "No relevant context found."
    print(relevant_texts)
    return "\n---\n".join(relevant_texts)

def search_pdf(query: str, k: int = 1):
    db = lancedb.connect(DB_PATH)
    table = db.open_table(TABLE_NAME)

    vector = model.encode(query).tolist()
    results = table.search(vector).limit(k).to_pandas()

    if results.empty:
        return None
    return {
        "name": results.iloc[0]["name"],
        "path": results.iloc[0]["path"],
        "summary": results.iloc[0]["summary"]
    }


'''t31=db.open_table(table_name1)
df=t31.to_pandas()
df["cid"]=[i for i in range(len(df))]
f=db.create_table("testing_table",data=df,schema=Chunks2,mode="overwrite")
see("testing_table")'''

'''p=db.open_table("testing_table")
df=p.to_pandas()
df=df.drop_duplicates(subset="vector",keep="first")
f=db.create_table("testing_table2",data=df,schema=Chunks2,mode="overwrite")'''


'''see("testing_table_fitz")
search("list of labs in Computer Science and Engineering","testing_table")
'''
'''see("pdfdetails")


print(search_pdf("campus map"))'''

see(table)
