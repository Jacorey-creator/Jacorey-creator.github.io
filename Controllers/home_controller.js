const projects = [
    {
      title: "Project One",
      description: "A short description of the project.",
      link: "https://github.com/Jacorey-creator/Tactical_Armored_Nanite_Kaizen"
    },
    {
      title: "Project Two",
      description: "Another cool project you worked on.",
      link: "https://github.com/Jacorey-creator/AI-420"
    }
  ];
  
  const projectList = document.getElementById('projectList');
  
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <a href="${project.link}" target="_blank">View on GitHub</a>
    `;
    projectList.appendChild(card);
  });
  