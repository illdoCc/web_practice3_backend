from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import psycopg2

def connectDB():
    try:
        conn = psycopg2.connect("dbname='mydb' user='postgres' host='localhost' password='123' port='8080'")
        return conn
    except Exception as e:
        return None

app = FastAPI()

class Project(BaseModel):
    name: str

# create new project
@app.post("/project", status_code=status.HTTP_200_OK)
async def createProject(project: Project):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        insert_query = "INSERT INTO projects (name) VALUES (%s);"
        cursor.execute(insert_query, (project.name,))
        conn.commit()
        cursor.close()
        conn.close()
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

# get all projects from db
@app.get("/project", status_code=status.HTTP_200_OK)
async def getProjects():
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        query = "SELECT name FROM projects;"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close() 
        return [name[0] for name in rows]
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

@app.delete("/project/{projectId}", status_code=status.HTTP_200_OK)
async def deleteProject(projectId: str):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        project_check_query = f"SELECT * FROM projects WHERE name = \'{projectId}\';"
        cursor.execute(project_check_query)
        if cursor.fetchone() != None:
            delete_project_query = f"DELETE FROM projects WHERE name = \'{projectId}\';"
            cursor.execute(delete_project_query)
            conn.commit()
            task_check_query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\';"
            cursor.execute(task_check_query)
            if cursor.fetchone() != None:
                delete_task_query = f"DELETE FROM tasks WHERE project_name = \'{projectId}\';"
                cursor.execute(delete_task_query)
                conn.commit()                
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        cursor.close()
        conn.close()
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

@app.put("/project/{projectId}", status_code=status.HTTP_200_OK)
async def updateProject(projectId: str, project: Project):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        project_check_query = f"SELECT * FROM projects WHERE name = \'{projectId}\';"
        cursor.execute(project_check_query)
        if cursor.fetchone() != None:
            update_project_query = f"UPDATE projects SET name = \'{project.name}\' WHERE name = \'{projectId}\';"
            cursor.execute(update_project_query)
            conn.commit()
            task_check_query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\';"
            cursor.execute(task_check_query)
            if cursor.fetchone() != None:
                update_task_query = f"UPDATE tasks SET project_name = \'{project.name}\' WHERE project_name = \'{projectId}\';"
                cursor.execute(update_task_query)
                conn.commit()
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        cursor.close()
        conn.close()
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

class Task(BaseModel):
    project_name: str
    task_name: str
    description: str
    date: str
    priority: str

# create new task
@app.post("/task", status_code=status.HTTP_200_OK)
async def createProject(task: Task):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        # check if there is already a task which name is same to the one that user want to create
        project_check_query = f"SELECT * FROM projects WHERE name = \'{task.project_name}\';"
        cursor.execute(project_check_query)
        if cursor.fetchone() != None:
            task_check_query = f"SELECT * FROM tasks WHERE project_name = \'{task.project_name}\' AND task_name = \'{task.task_name}\';"
            cursor.execute(task_check_query)
            if cursor.fetchone() == None:
                insert_query = "INSERT INTO tasks (project_name, task_name, description, date, priority) VALUES (%s, %s, %s, %s, %s);"
                cursor.execute(insert_query, (task.project_name, task.task_name, task.description, task.date, task.priority))
                conn.commit()
            else:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Task already exists")
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        cursor.close()
        conn.close()
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

# get all tasks in project
@app.get("/project/{projectId}/task", status_code=status.HTTP_200_OK)
async def getTasks(projectId: str):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\';"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close() 
        tasks = []
        for row in rows:
            task = {
                'Task Name': row[1],
                'Description': row[2],
                'Date': row[3],
                'Priority': row[4]
            }
            tasks.append(task)
        return tasks
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

@app.delete("/project/{projectId}/task/{taskId}", status_code=status.HTTP_200_OK)
async def deleteProject(projectId: str, taskId: str):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        project_check_query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\';"
        cursor.execute(project_check_query)
        if cursor.fetchone() != None:
            task_check_query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\' AND task_name = \'{taskId}\';"
            cursor.execute(task_check_query)
            if cursor.fetchone() != None:
                delete_query = f"DELETE FROM tasks WHERE project_name = \'{projectId}\' AND task_name = \'{taskId}\';"
                cursor.execute(delete_query)
                conn.commit()
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        cursor.close()
        conn.close()
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

@app.put("/project/{projectId}/task/{taskId}", status_code=status.HTTP_200_OK)
async def updateProject(projectId: str, taskId: str, task: Task):
    conn = connectDB()
    if conn:
        cursor = conn.cursor()
        project_check_query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\';"
        cursor.execute(project_check_query)
        if cursor.fetchone() != None:
            task_check_query = f"SELECT * FROM tasks WHERE project_name = \'{projectId}\' AND task_name = \'{taskId}\';"
            cursor.execute(task_check_query)
            if cursor.fetchone() != None:
                # check request body's project name is correct or not
                if task.project_name == projectId:
                    update_query = f"UPDATE tasks SET task_name = \'{task.task_name}\', description = \'{task.description}\', date = \'{task.date}\', priority = \'{task.priority}\' WHERE project_name = \'{projectId}\' AND task_name = \'{taskId}\';"
                    cursor.execute(update_query)
                    conn.commit()
                else:
                    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Project does not exist. Please check the project name")
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        cursor.close()
        conn.close()
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")