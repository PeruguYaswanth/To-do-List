import { useEffect, useState } from "react";

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newdesc,setnewdesc] =useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editdesc,seteditdesc]=useState("");


  const API_URL = "http://127.0.0.1:8000/todos";

  useEffect(() => {
    getTasks();
  }, []);

  function getTasks(){
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }

  function addTask() {
    if (newTask.trim() === ""||newdesc.trim()==="") return;

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Date.now(),
        title: newTask,
        description:newdesc,
      }),
    }).then(() => {
      setNewTask("");
      setnewdesc("");
      getTasks();
    });
  }
  const updateTask = async (id) => {
    if (editTitle.trim() === "") return;
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id:id,
          title: editTitle,
          description:editdesc,
        }),
      });
      setEditId(null);
      setEditTitle("");
      seteditdesc("");
      getTasks();
  };


  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    getTasks();
  };

  return (
    <div className="container"> 


    
      <h1>Farmstack Todo</h1>

      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="enter the title"
      /><br/>
      <input 
        value={newdesc}
        onChange={(e)=> setnewdesc(e.target.value)}
        placeholder="enter the description "
      /><br/>
      <button className="add-btn" onClick={addTask}>Add Task</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {editId === task.id ? (
        <>
        <input 
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        />
        <input 
        value={editdesc}
        onChange={(e) => seteditdesc(e.target.value)}
        />
        <button className="save-btn" onClick={() => updateTask(task.id)}>Save</button>
        <button className="cancel-btn" onClick={() => setEditId(null)}>Cancel</button>
        </>
        ) : (
        <>
        {task.title}--
        {task.description}
        <button className="edit-btn"
        onClick={() => {
          setEditId(task.id);
          setEditTitle(task.title);
          seteditdesc(task.description);
          }}
          >
          Edit
          </button>
          <button  className="delete-btn"onClick={() => deleteTask(task.id)}>Delete</button>
        </>
      )}
    </li>
  ))}
</ul>
  </div>
  );
}
export default Todo;
