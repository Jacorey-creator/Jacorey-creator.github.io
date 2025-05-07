const projects = [
    {
      title: "Project One",
      description: "A short description of the project.",
      link: "https://github.com/yourname/project-one"
    },
    {
      title: "Project Two",
      description: "Another cool project you worked on.",
      link: "https://github.com/yourname/project-two"
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
  