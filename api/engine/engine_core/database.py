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
    
    # Force isolation: Park Conscious logic always uses its own dedicated DB
    db_name = "park_conscious"
    return _client[db_name]
