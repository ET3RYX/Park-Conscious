import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    # Fail gracefully if URI is missing
    print("[Error] MONGODB_URI is not set in environment.")

_client = None

def get_db():
    global _client
    if _client is None:
        if not MONGODB_URI:
            return None
        _client = MongoClient(MONGODB_URI)
    
    # We want to connect to the default DB from the URI or "test" if not specified
    # Mongoose by default connects to the DB name in the path
    db_name = MONGODB_URI.split("/")[-1].split("?")[0] or "test"
    return _client[db_name]
