import React, { useEffect } from "react"
const COMMENTS_ID = "comments-container"
const Comments = () => {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://utteranc.es/client.js"
    // Replace with the repo on which you configured Utterances
    script.setAttribute("repo", "jajugoguma/jajugoguma.github.io")
    script.setAttribute("issue-term", "pathname")
    script.setAttribute("theme", "github-light")
    script.setAttribute("crossorigin", "anonymous")
    script.async = true
    const comments = document.getElementById(COMMENTS_ID)
    if (comments) comments.appendChild(script)
    return () => {
      const comments = document.getElementById(COMMENTS_ID)
      if (comments) comments.innerHTML = ""
    }
  }, [])
  return <div id={COMMENTS_ID} />
}
export default Comments
