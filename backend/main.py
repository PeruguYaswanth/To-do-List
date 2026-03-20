from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from modules.module import Todo
from modules.database import todo_collection
from bson import ObjectId
from bson.errors import InvalidId

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def todo_serializer(todo) -> dict:
    return {
        "id": str(todo["_id"]),
        "title": todo.get("title", ""),
        "description": todo.get("description", ""),
    }


@app.get("/")
def root():
    return {"message": "Todo API is running"}


@app.get("/todos")
def get_todos():
    todos = todo_collection.find()
    return [todo_serializer(todo) for todo in todos]


@app.post("/todos")
def create_todo(todo: Todo):
    try:
        todo_dict = todo.model_dump(exclude_none=True)  # Pydantic v2 safe
        new_todo = todo_collection.insert_one(todo_dict)
        created = todo_collection.find_one({"_id": new_todo.inserted_id})
        return todo_serializer(created)
    except Exception as e:
        print("BACKEND ERROR 👉", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/todos/{todo_id}")
def get_todo(todo_id: str):
    try:
        todo = todo_collection.find_one({"_id": ObjectId(todo_id)})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid todo ID")
    
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo_serializer(todo)


@app.put("/todos/{todo_id}")
def update_todo(todo_id: str, todo: Todo):
    try:
        update_data = todo.model_dump(exclude_none=True)
        updated = todo_collection.update_one(
            {"_id": ObjectId(todo_id)},
            {"$set": update_data}
        )
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid todo ID")

    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo updated successfully"}


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: str):
    try:
        deleted = todo_collection.delete_one({"_id": ObjectId(todo_id)})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid todo ID")

    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}
