"""
Mock MongoDB implementation for development.
Stores data in JSON files when MongoDB is not available.
"""
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
from bson import ObjectId

# Data directory
DATA_DIR = Path(__file__).parent / ".data"
DATA_DIR.mkdir(exist_ok=True)


class InsertOneResult:
    """Result object mimicking pymongo's InsertOneResult."""
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class MockCollection:
    """Mock MongoDB collection using JSON files."""
    
    def __init__(self, name: str):
        self.name = name
        self.file_path = DATA_DIR / f"{name}.json"
        self._ensure_file()
    
    def _ensure_file(self):
        """Ensure collection file exists."""
        if not self.file_path.exists():
            self.file_path.write_text(json.dumps([]))
    
    def _load(self) -> List[Dict]:
        """Load data from file."""
        try:
            content = self.file_path.read_text()
            return json.loads(content) if content else []
        except:
            return []
    
    def _save(self, data: List[Dict]):
        """Save data to file."""
        self.file_path.write_text(json.dumps(data, indent=2, default=str))
    
    def insert_one(self, document: Dict) -> InsertOneResult:
        """Insert a single document."""
        if "_id" not in document:
            document["_id"] = str(ObjectId())
        data = self._load()
        data.append(document)
        self._save(data)
        return InsertOneResult(document["_id"])
    
    def find_one(self, filter: Dict) -> Optional[Dict]:
        """Find a single document."""
        data = self._load()
        for doc in data:
            if self._matches(doc, filter):
                return doc
        return None
    
    def find(self, filter: Dict = None, projection: Dict = None) -> List[Dict]:
        """Find multiple documents. Projection parameter is accepted but ignored (returns all fields)."""
        data = self._load()
        if not filter:
            return data
        return [doc for doc in data if self._matches(doc, filter)]
    
    def update_one(self, filter: Dict, update: Dict) -> Dict:
        """Update a single document."""
        data = self._load()
        for i, doc in enumerate(data):
            if self._matches(doc, filter):
                if "$set" in update:
                    doc.update(update["$set"])
                data[i] = doc
                self._save(data)
                return doc
        return None
    
    def delete_one(self, filter: Dict) -> bool:
        """Delete a single document."""
        data = self._load()
        for i, doc in enumerate(data):
            if self._matches(doc, filter):
                del data[i]
                self._save(data)
                return True
        return False
    
    def count_documents(self, filter: Dict = None) -> int:
        """Count documents."""
        data = self._load()
        if not filter:
            return len(data)
        return len([doc for doc in data if self._matches(doc, filter)])
    
    @staticmethod
    def _matches(doc: Dict, filter: Dict) -> bool:
        """Check if document matches filter."""
        for key, value in filter.items():
            if key not in doc:
                return False
            if isinstance(value, dict):
                # Handle comparison operators
                for op, val in value.items():
                    if op == "$eq" and doc[key] != val:
                        return False
                    elif op == "$ne" and doc[key] == val:
                        return False
                    elif op == "$gt" and doc[key] <= val:
                        return False
                    elif op == "$lt" and doc[key] >= val:
                        return False
            elif doc[key] != value:
                return False
        return True


class MockDatabase:
    """Mock MongoDB database."""
    
    def __init__(self, name: str):
        self.name = name
        self._collections = {}
    
    def __getitem__(self, name: str) -> MockCollection:
        """Get or create a collection."""
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]
    
    def __getattr__(self, name: str) -> MockCollection:
        """Get or create a collection by attribute."""
        return self[name]


class MockMongoClient:
    """Mock MongoDB client."""
    
    def __init__(self, uri: str, **kwargs):
        self.uri = uri
        self._databases = {}
    
    def __getitem__(self, name: str) -> MockDatabase:
        """Get or create a database."""
        if name not in self._databases:
            self._databases[name] = MockDatabase(name)
        return self._databases[name]
    
    def __getattr__(self, name: str) -> MockDatabase:
        """Get or create a database by attribute."""
        return self[name]
