const groups = window.ICON_GROUPS;
let active = 0;
let query = "";

const tabs = document.getElementById("tabs");
const list = document.getElementById("icons");
const count = document.getElementById("count");
const importCode = document.getElementById("import");
const npmImport = document.getElementById("npm-import");
const iconExamples = [
  document.getElementById("cdn-example"),
  document.getElementById("npm-example"),
];
const status = document.getElementById("status");
const jsDelivr = "https://cdn.jsdelivr.net/gh/cjlaserna/retro-icon-archive/";
const collectionFolder = window.location.pathname
  .replace(/\/index\.html$/i, "")
  .replace(/\/+$/, "")
  .split("/")
  .filter(Boolean)
  .pop();

function drawTabs() {
  tabs.replaceChildren();
  groups.forEach((group, index) => {
    const button = document.createElement("button");
    button.className = "tab" + (index === active ? " active" : "");

    const icon = document.createElement("span");
    icon.className = "icon mini-folder";
    icon.setAttribute("aria-hidden", "true");
    button.append(
      icon,
      document.createTextNode(
        group.title + " (" + group.icons.length.toLocaleString() + ")",
      ),
    );

    button.onclick = () => {
      active = index;
      drawTabs();
      draw();
    };
    tabs.append(button);
  });
}

function draw() {
  const group = groups[active];
  importCode.textContent =
    '<link rel="stylesheet" href="' +
    jsDelivr +
    collectionFolder +
    "/" +
    group.file +
    '">';
  npmImport.textContent =
    'import "@claserna/retro-icons-archive/' +
    collectionFolder +
    "/" +
    group.file +
    '";';
  const iconExample = '<span class="' + group.icons[0] + '"></span>';
  iconExamples.forEach((example) => {
    example.textContent = iconExample;
  });

  const matches = group.icons.filter((name) =>
    name.toLowerCase().includes(query),
  );
  count.textContent =
    matches.length.toLocaleString() +
    " of " +
    group.icons.length.toLocaleString() +
    " icons";
  list.replaceChildren();

  const fragment = document.createDocumentFragment();
  matches.forEach((name) => {
    const button = document.createElement("button");
    button.className = "item";
    button.title = 'Click to copy <span class="' + name + '"></span>';

    const icon = document.createElement("span");
    icon.className = "preview " + name;
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent = name;
    button.append(icon, label);
    button.onclick = () => {
      const snippet = '<span class="' + name + '"></span>';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(snippet)
          .then(() => {
            status.textContent = "Copied: " + snippet;
          })
          .catch(() => fallback(snippet));
      } else {
        fallback(snippet);
      }
    };
    fragment.append(button);
  });

  list.append(fragment);
  if (!matches.length) {
    list.innerHTML = '<p class="empty">No matching icons.</p>';
  }
}

function fallback(snippet) {
  const textarea = document.createElement("textarea");
  textarea.value = snippet;
  document.body.append(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    status.textContent = "Copied: " + snippet;
  } catch (error) {
    status.textContent = snippet;
  }
  textarea.remove();
}

document.getElementById("search").addEventListener("input", (event) => {
  query = event.target.value.trim().toLowerCase();
  draw();
});

drawTabs();
draw();
