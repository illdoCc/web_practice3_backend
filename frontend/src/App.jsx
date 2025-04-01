import React, {useState} from "react";
import Sidebar from "./Sidebar.jsx";
import MainContentArea from "./ContentArea.jsx";

function App() {
    const [projects, setProjects] = useState([]);
    const [isActive, setIsActive] = useState("Inbox");
    
    // load from local
    const isFirstRender = React.useRef(true);
    React.useEffect(() => {
        if (isFirstRender.current) {
          isFirstRender.current = false;
          return;
        }
        const storedProjects = localStorage.getItem("projectList");
        if(!storedProjects) return;

        const projectList = JSON.parse(storedProjects);
        projectList.forEach(project => {
            const projectName = project.id;
            if(projectName !== "Inbox"){
              setProjects(prevProjects => [...prevProjects, projectName]);
            }
        });
    }, []);

    return (
      <>
        <Sidebar projects={projects} setProjects={setProjects} isActive={isActive} setIsActive={setIsActive}/>
        <MainContentArea projects={projects} isActive={isActive}/>
      </>
    );
}
  
export default App;