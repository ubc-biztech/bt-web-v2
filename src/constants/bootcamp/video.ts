export interface Video {
    id: string;
    title: string;
    duration: string;
    description: string;
    youtubeId: string;
  }
  
  // TODO: input real videos here 
  export const courseVideos: Video[] = [
    {
      id: "1",
      title: "HTML Crash Course For Absolute Beginners",
      duration: "69 minutes",
      description: "Learn HTML in this complete course for beginners. No prior knowledge needed - start building websites from scratch with HTML5.",
      youtubeId: "UB1O30fR-EE",
    },
    {
      id: "2",
      title: "CSS Crash Course For Absolute Beginners",
      duration: "85 minutes",
      description: "Master CSS fundamentals including selectors, the box model, flexbox, grid, and responsive design principles.",
      youtubeId: "yfoY53QXEnI",
    },
    {
      id: "3",
      title: "JavaScript Crash Course For Beginners",
      duration: "100 minutes",
      description: "Learn JavaScript from scratch - variables, functions, DOM manipulation, events, and modern ES6+ features.",
      youtubeId: "hdI2bqOjy3c",
    },
    {
      id: "4",
      title: "React JS Crash Course",
      duration: "105 minutes",
      description: "Build modern web applications with React. Learn components, hooks, state management, and build a real project.",
      youtubeId: "w7ejDZ8SWv8",
    },
    {
      id: "5",
      title: "Node.js & Express Crash Course",
      duration: "90 minutes",
      description: "Learn backend development with Node.js and Express. Build REST APIs and understand server-side JavaScript.",
      youtubeId: "SccSCuHhOw0",
    }
  ];