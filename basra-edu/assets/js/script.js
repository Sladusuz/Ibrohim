document.getElementById("year").textContent = new Date().getFullYear();

const header = document.getElementById("header");
const progressBar = document.getElementById("progressBar");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
});

const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => nav.classList.remove("open"))
);

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealItems.forEach((item) => observer.observe(item));

function updateOpenStatus() {
  const now = new Date();
  const tashkentHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Tashkent",
    }).format(now)
  );
  const isOpen = tashkentHour >= 9 && tashkentHour < 20;

  const dot = document.querySelector("#statusBadge .dot");
  const text = document.getElementById("statusText");
  const smallText = document.getElementById("statusTextSmall");

  dot.classList.toggle("closed", !isOpen);
  const message = isOpen ? "Hozir ochiq — 20:00 gacha" : "Hozir yopiq — ertaga 9:00 da ochamiz";
  text.textContent = message;
  smallText.textContent = message;
}

updateOpenStatus();
setInterval(updateOpenStatus, 60000);
