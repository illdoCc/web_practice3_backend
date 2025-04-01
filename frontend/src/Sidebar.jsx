import React, {useState, useRef} from "react";

function NewProject({projects = [], setProjects, isActive, setIsActive}){
    // useState就是讓當中的變數變為一個state
    const [isOpen, setIsOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [error, setError] = useState(false); // 檢查project有無重複值
    const dialogRef = useRef(null); 

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setError(false);
        setIsOpen(false);
        setProjectName("");
    };

    const handleSubmit = () => {
        setError(false);
        if(projects.includes(projectName) || projectName == "Inbox"){
            setError(true);
            return;
        }
        if(projectName.trim() !== ""){
            // 保留舊陣列，加上新陣列
            setProjects([...projects, projectName]);
            chooseProject(projectName);
            closeModal();
        }
    };

    const deleteProject = (name, index) => {
        if(name === isActive){
            setIsActive("Inbox");
        }
        setProjects(projects.filter((_, i) => i !== index));
    }

    const chooseProject = (project) => {
        setIsActive(project);
    }

    // 當state改變時(也就是re-render)，useEffect就會執行
    React.useEffect(() => {
        if(isOpen){
            dialogRef.current.showModal();
        }else{
            dialogRef.current.close();
        }
    }, [isOpen]);

    return(
        <div>
            <div id="project_inbox" className={`project ${isActive === "Inbox" ? "active" : ""}`}>
                <span id="inbox" className="project_name" onClick={() => chooseProject("Inbox")}>
                    Inbox
                </span>
            </div>
            {projects.map((project, index) => (
                <div key={index} id={project} className={`project ${isActive === project ? "active" : ""}`}>
                    <span id={project + "name"} className="project_name" onClick={() => chooseProject(project)}>
                        {project}
                    </span>
                    <button className="delete_btn" onClick={() => deleteProject(project, index)}>
                        🗑️
                    </button>
                </div>
            ))}
            <button onClick={openModal} id="new_project">
                New Project
            </button>
            <dialog ref={dialogRef} id="new_project_dialog">
                Project Name:
                <input 
                    type="text" 
                    id="project_name_box" 
                    name="project_name_box" 
                    placeholder="Project Name" 
                    size="10" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
                <button onClick={closeModal}>Cancel</button>
                <button onClick={handleSubmit} id="project_submit_btn">Submit</button>
                {error ? <p className="repeatName">❗❗ 重複名稱 ❗❗</p> : null}
            </dialog>
        </div>
    )
}

function Sidebar({projects, setProjects, isActive, setIsActive}){
    return(
        <aside className="sidebar">
            <NewProject projects={projects} setProjects={setProjects} isActive={isActive} setIsActive={setIsActive}/>
        </aside>
    );
}

export default Sidebar;