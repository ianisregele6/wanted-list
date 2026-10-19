const form = document.getElementById("add-form");
const nameInput = document.getElementById("name");
const linkInput = document.getElementById("link");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const counterEl = document.getElementById("counter");
const barEl = document.getElementById("bar");
const filterButtons = document.querySelectorAll(".filter");

let items = JSON.parse(localStorage.getItem("wanted-items")) || [];
let filter = "all"; // all, todo or bought

function save() {
  localStorage.setItem("wanted-items", JSON.stringify(items));
}

// Add https:// if the link doesn't have it
function fixLink(url) {
  url = url.trim();
  if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
  return url;
}

// Get the shop name from a link, e.g. "emag.ro"
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

// Format a date like "19 Oct"
function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function render() {
  listEl.innerHTML = "";

  const visible = items.filter((i) => {
    if (filter === "todo") return !i.bought;
    if (filter === "bought") return i.bought;
    return true;
  });

  visible.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item" + (item.bought ? " bought" : "");

    const info = document.createElement("div");
    info.className = "item-info";

    const name = document.createElement("p");
    name.className = "item-name";
    name.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "item-meta";

    if (item.link) {
      const a = document.createElement("a");
      a.className = "item-link";
      a.href = item.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = getDomain(item.link);
      meta.appendChild(a);
    }

    const date = document.createElement("span");
    date.textContent = item.bought && item.boughtAt
      ? "Bought " + formatDate(item.boughtAt)
      : "Added " + formatDate(item.id);
    meta.appendChild(date);

    info.append(name, meta);

    const verify = document.createElement("button");
    verify.className = "verify-btn";
    verify.textContent = item.bought ? "Bought" : "Verify";
    verify.addEventListener("click", () => {
      item.bought = !item.bought;
      item.boughtAt = item.bought ? Date.now() : null;
      save();
      render();
    });

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "\u00d7";
    del.setAttribute("aria-label", "Delete " + item.name);
    del.addEventListener("click", () => {
      items = items.filter((i) => i.id !== item.id);
      save();
      render();
    });

    li.append(info, verify, del);
    listEl.appendChild(li);
  });

  // Counter and progress bar
  const boughtCount = items.filter((i) => i.bought).length;
  const percent = items.length ? Math.round((boughtCount / items.length) * 100) : 0;
  counterEl.textContent = items.length
    ? boughtCount + " of " + items.length + " bought"
    : "No items yet";
  barEl.style.width = percent + "%";
  barEl.parentElement.setAttribute("aria-valuenow", percent);

  // Empty messages
  const messages = {
    all: "Nothing here yet. Add the first thing you want above.",
    todo: "Nothing left to buy.",
    bought: "Nothing bought yet. Press Verify when you get something.",
  };
  emptyEl.textContent = messages[filter];
  emptyEl.style.display = visible.length ? "none" : "block";
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  items.unshift({
    id: Date.now(),
    name: nameInput.value.trim(),
    link: fixLink(linkInput.value),
    bought: false,
    boughtAt: null,
  });
  save();
  render();
  form.reset();
  nameInput.focus();
});

render();
