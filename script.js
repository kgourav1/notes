"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const stickyArea = document.querySelector("#stickies-container");
  const createStickyButton = document.querySelector("#createsticky");
  const stickyTitleInput = document.querySelector("#stickytitle");
  const stickyTextInput = document.querySelector("#stickytext");

  let isDragging = false;
  let dragTarget = null;
  let lastOffsetX = 0;
  let lastOffsetY = 0;

  function drag(e) {
    if (!isDragging || !dragTarget) return;

    if (e.type === "touchmove") {
      const touch = e.touches[0];
      const newX = touch.clientX - lastOffsetX;
      const newY = touch.clientY - lastOffsetY;
      dragTarget.style.left = newX + "px";
      dragTarget.style.top = newY + "px";
    } else {
      dragTarget.style.left = e.clientX - lastOffsetX + "px";
      dragTarget.style.top = e.clientY - lastOffsetY + "px";
    }

    saveNotes();
  }

  function createSticky() {
    const newSticky = document.createElement("div");
    const html = `<h3>${stripHtml(stickyTitleInput.value)}</h3><p>${stripHtml(
      stickyTextInput.value
    ).replace(
      /\r\n|\r|\n/g,
      "<br />"
    )}</p><span class="deletesticky">&times;</span>`;
    newSticky.classList.add("drag", "sticky");
    newSticky.innerHTML = html;
    stickyArea.append(newSticky);
    positionSticky(newSticky);
    applyDeleteListener();
    clearStickyForm();
    saveNotes();
  }

  function clearStickyForm() {
    stickyTitleInput.value = "";
    stickyTextInput.value = "";
  }

  function positionSticky(sticky) {
    sticky.style.left =
      window.innerWidth / 2 -
      sticky.clientWidth / 2 +
      (-100 + Math.round(Math.random() * 50)) +
      "px";
    sticky.style.top =
      window.innerHeight / 2 -
      sticky.clientHeight / 2 +
      (-100 + Math.round(Math.random() * 50)) +
      "px";
  }

  function stripHtml(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  }

  function applyDeleteListener() {
    let deleteStickyButtons = document.querySelectorAll(".deletesticky");
    deleteStickyButtons.forEach((dsb) => {
      dsb.removeEventListener("click", deleteSticky, false);
      dsb.addEventListener("click", deleteSticky);
    });
  }

  function saveNotes() {
    const notes = [];
    document.querySelectorAll(".sticky").forEach((sticky) => {
      const title = sticky.querySelector("h3").innerText;
      const text = sticky
        .querySelector("p")
        .innerHTML.replace(/<br\s*\/?>/gi, "\n");
      const left = sticky.style.left;
      const top = sticky.style.top;
      notes.push({ title, text, left, top });
    });
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
  }

  function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
    notes.forEach((note) => {
      const newSticky = document.createElement("div");
      const html = `<h3>${stripHtml(note.title)}</h3><p>${stripHtml(
        note.text
      ).replace(
        /\r\n|\r|\n/g,
        "<br />"
      )}</p><span class="deletesticky">&times;</span>`;
      newSticky.classList.add("drag", "sticky");
      newSticky.innerHTML = html;
      newSticky.style.left = note.left;
      newSticky.style.top = note.top;
      stickyArea.append(newSticky);
    });
    applyDeleteListener();
  }

  function deleteSticky(e) {
    const sticky = e.target.parentNode;
    sticky.remove();
    saveNotes();
  }

  window.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains("drag")) {
      return;
    }
    dragTarget = e.target;
    dragTarget.parentNode.append(dragTarget);
    lastOffsetX = e.offsetX;
    lastOffsetY = e.offsetY;
    isDragging = true;
  });

  window.addEventListener("mousemove", drag);
  window.addEventListener("mouseup", () => (isDragging = false));

  createStickyButton.addEventListener("click", createSticky);

  loadNotes();
  applyDeleteListener();

  // Touch events
  window.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    if (!touch.target.classList.contains("drag")) {
      return;
    }
    e.preventDefault();

    dragTarget = touch.target;
    dragTarget.parentNode.append(dragTarget);
    const rect = dragTarget.getBoundingClientRect();
    lastOffsetX = touch.clientX - rect.left;
    lastOffsetY = touch.clientY - rect.top;
    isDragging = true;
  });

  window.addEventListener("touchmove", drag);
  window.addEventListener("touchend", () => (isDragging = false));
});
