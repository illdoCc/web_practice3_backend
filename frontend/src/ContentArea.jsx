import React, {useState, useRef} from "react";
import { format } from "date-fns";
import _ from "lodash";

function ContentArea({projects = [], isActive}){
    const [isOpen, setIsOpen] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [displayDate, setDisplayDate] = useState(""); // show week day
    const [taskPriority, setTaskPriority] = useState("1");
    const [tasks, setTasks] = useState({}); // 儲存 {projectName: [[task1_name, descrip, date, pri], [task2_name, descrip, date, pri]]}
    const [bored, setBored] = useState(false);
    const dialogRef = useRef(null);
    const priorityIcon = {"1": "🔴 ", "2": "🟠 ", "3": "🟡 ", "4": "🟢 "};

    // open dialog
    const openModal = () => {
        setIsOpen(true);
    }

    // close dialog
    const closeModal = () => {
        setTaskName("");
        setTaskDescription("");
        setTaskDate("");
        setTaskPriority("1");
        setIsOpen(false);
    };

    const handleDateChange = (e) => {
        let date = e.target.value;  // YYYY-MM-DD
        let parsedDate = new Date(date);
        
        if (!isNaN(parsedDate)) {
          let weekDay = format(parsedDate, "EEEE");
          setTaskDate(date);
          setDisplayDate(`${date} (${weekDay})`);
        }
    }

    // dialog submit tasks
    const handleSubmit = () => {
        // 在active的project中插入tasks
        const projectName = isActive;
        setTasks(prevTasks => ({
            ...prevTasks,
            [projectName] : [...(prevTasks[projectName] || []), [taskName, taskDescription, displayDate, taskPriority, false]] 
        }));
        closeModal();
    }

    // is checked
    const check = (projectName, taskName) => {
        setTasks(prevTasks => ({
            ...prevTasks,
            [projectName] : prevTasks[projectName].map(task => 
                task[0] === taskName 
                    ? [task[0], task[1], task[2], task[3], !task[4]] // 切換checked
                    : task
            )
        }))
    }
    
    const deleteTask = (projectName, taskName) => {
        setTasks(prevTasks => ({
            ...prevTasks,
            [projectName] : prevTasks[projectName]?.filter(task => task[0] !== taskName) || []
        }))
    }

    const boredApi = async () => {
        const res = await fetch("https://bored.api.lewagon.com/api/activity");
        const resJson = await res.json();
        setBored(true);
        setTaskName(resJson.activity);
        setTaskPriority("4");
    }

    // open dialog
    React.useEffect(() => {
        if(isOpen){
            dialogRef.current.showModal();
        }else{
            dialogRef.current.close();
        }
    }, [isOpen]);

    // add bored task
    React.useEffect(() => {
        if(bored && taskName !== "" && taskPriority !== "1"){
            handleSubmit();
            setBored(false);
        }
    }, [bored, taskName, taskPriority])

    // save to local
    React.useEffect(() => {
        if(_.isEmpty(tasks)) return; // if tasks is empty(first render), return
        const projectList = []

        // iterate by projects, so that projectList's project order is same to user's project order
        const newArr = ["Inbox", ...projects];
        newArr.map(projectName => {
            let project = {
                id: projectName, // id equal to project name
                taskElements: []
            };

            tasks[projectName]?.forEach(element => {
                const name = element[0];
                const description = element[1];
                const date = element[2];
                const priority = element[3];
                const completed = element[4];
                project.taskElements.push({name, description, date, priority, completed});
            });
            projectList.push(project);
        });
        localStorage.setItem("projectList", JSON.stringify(projectList));
    }, [tasks, projects]);
    
    // load from local
    const isFirstRender = React.useRef(true); 
    React.useEffect(() => {
        // only render once
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const storedProjects = localStorage.getItem("projectList");
        const projectList = JSON.parse(storedProjects);
        if(projectList === null) return;

        projectList.forEach(project => {
            const projectName = project.id;
            project.taskElements?.forEach(taskElement => {
                const tName = taskElement.name;
                const tDescription = taskElement.description;
                const tDate = taskElement.date;
                const tPriority = taskElement.priority;
                const tCompleted = taskElement.completed;                
                setTasks(prevTasks => ({
                    ...prevTasks,
                    [projectName] : [...(prevTasks[projectName] || []), [tName, tDescription, tDate, tPriority, tCompleted]] 
                }));            
            });
        })
    }, [])

    // React.useEffect(() => {
    //     localStorage.clear();
    // }, []);

    return(
        <div id="contentArea" className="contentArea">
            {tasks[isActive]?.map(([name, description, date, priority, checked], index) => (
                <div key={index} className="task">
                    <div className="task-header">
                        <input
                            type="checkbox"
                            className="check_box"
                            checked={checked}
                            onChange={() => check(isActive, name)}
                        />
                        <label className="task_label">
                            {priorityIcon[priority] + name}
                        </label>
                        <button className="delete_task_btn" onClick={() => deleteTask(isActive, name)}>
                            🗑️
                        </button>
                        <p className="description">
                            {description + ' ' + date}
                        </p>
                    </div>
                    
                </div>
            ))}
            <button onClick={openModal} id="new_task" className="newTaskbtn">
            {/* <button id="new_task" className="newTaskbtn"> */}
                New Task
            </button>
            <button onClick={boredApi} id="bored" className="bored">
                Bored
            </button>
            <dialog ref={dialogRef} id="new_task_dialog">
                Task Name<br />
                <input 
                    type="text" 
                    id="task_name_box" 
                    className="new_task_input"
                    name="task_name_box" 
                    placeholder="Task" 
                    size="10" 
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                />
                Description<br />
                <input 
                    type="text" 
                    id="description_box" 
                    className="new_task_input" 
                    name="description_box" 
                    placeholder="Description" 
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                />
                Due Date<br />
                <input 
                    type="date" 
                    id="date_box" 
                    className="new_task_input" 
                    name="date_box"
                    value={taskDate}
                    onChange={handleDateChange}
                />
                Priority(1 is most important)<br />
                <input 
                    type="number" 
                    id="priority" 
                    className="new_task_input"  
                    name="priority" 
                    min="1" 
                    max="4"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                />
                <button onClick={closeModal}>Cancel</button>
                <button onClick={handleSubmit} id="task_submit_btn">Submit</button>
            </dialog>
        </div>
    );
}

export default function MainContentArea({projects, setProjects, isActive, setIsActive}){
    return(
        <ContentArea projects={projects} setProjects={setProjects} isActive={isActive} setIsActive={setIsActive}/>
    )
}