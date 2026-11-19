document.querySelectorAll("pre.code").forEach((pre) => {
  const code = pre.textContent.trim();
  const button = document.createElement("button");

  button.type = "button";
  button.className = "copy-code";
  button.textContent = "Copy";
  button.setAttribute("aria-label", "Copy code");

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied!";
    } catch {
      button.textContent = "Failed";
    }

    setTimeout(() => (button.textContent = "Copy"), 2000);
  });

  pre.appendChild(button);
});

