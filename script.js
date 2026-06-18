const API_URL =
"https://script.google.com/macros/s/AKfycbwlyhqaD-s0myG202XLA1QR-TgojZNiwNecOjC1A9XiJRkQ4pTZT_kvrMbuEWQZeya1nQ/exec";

let profiles = [];

async function loadProfiles() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        profiles = Array.isArray(data) ? data : (data.data || []);

        profiles.forEach((profile, index) => {
            profile.profileId = "MB-" + String(index + 1).padStart(3, "0");
        });

    populateFilters();
    renderProfiles();

} catch (error) {

    console.error("Error loading profiles:", error);

}


}

function calculateAge(dob) {


const birthDate = new Date(dob);
const today = new Date();

let age =
    today.getFullYear() -
    birthDate.getFullYear();

const monthDiff =
    today.getMonth() -
    birthDate.getMonth();

if (
    monthDiff < 0 ||
    (
        monthDiff === 0 &&
        today.getDate() < birthDate.getDate()
    )
) {
    age--;
}

return age;


}

function extractFileId(url) {


const match =
    url.match(/id=([^&]+)/);

return match ? match[1] : "";


}

function getImageUrl(url) {


const fileId =
    extractFileId(url);

return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;


}

function fillSelect(id, values) {


const select =
    document.getElementById(id);

while (select.options.length > 1) {
    select.remove(1);
}

values
    .filter(Boolean)
    .sort()
    .forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });


}

function populateCheckboxGroup(containerId, cssClass, values) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    [...new Set(values)].filter(Boolean).sort().forEach(value => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" class="${cssClass}" value="${value}" checked> ${value}`;
        container.appendChild(label);
    });
}

function populateFilters() {

    fillSelect(
        "genderFilter",
        [...new Set(profiles.map(p => p.gender))]
    );

    populateCheckboxGroup("casteDropdown", "casteCheck", profiles.map(p => p.caste));
    populateCheckboxGroup("educationDropdown", "educationCheck", profiles.map(p => p.education));
    populateCheckboxGroup("employmentDropdown", "employmentCheck", profiles.map(p => p.employment));

}

function openProfile(profile) {

const modal = document.getElementById("profileModal");
const body = document.getElementById("modalBody");

// Build extras HTML automatically from any extra columns after status
let extrasHTML = "";
if (profile.extras) {
    Object.entries(profile.extras).forEach(([key, value]) => {
        // Capitalise the key nicely
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        extrasHTML += `<p><strong>${label}:</strong> ${value}</p>`;
    });
}

body.innerHTML = `
<img src="${getImageUrl(profile.picture)}">
<h2>${profile.profileId}</h2>
<h2>${profile.name}</h2>
<p><strong>Age:</strong> ${calculateAge(profile.dob)}</p>
<p><strong>Date of Birth:</strong> ${profile.dob}</p>
<p><strong>Gender:</strong> ${profile.gender}</p>
<p><strong>Caste:</strong> ${profile.caste}</p>
<p><strong>Education:</strong> ${profile.education}</p>
<p><strong>Employment:</strong> ${profile.employment}</p>
<p><strong>Height:</strong> ${profile.height}</p>
<p><strong>Weight:</strong> ${profile.weight}</p>
${extrasHTML}
`;

modal.style.display = "block";

}

function renderProfiles() {


const search =
    document
    .getElementById("search")
    .value
    .toLowerCase();

const gender =
    document
    .getElementById("genderFilter")
    .value;

const allCasteBoxes = document.querySelectorAll(".casteCheck");
const checkedCastes = [...document.querySelectorAll(".casteCheck:checked")];
const selectedCastes = checkedCastes.length === allCasteBoxes.length ? [] : checkedCastes.map(c => c.value);

const allEducationBoxes = document.querySelectorAll(".educationCheck");
const checkedEducations = [...document.querySelectorAll(".educationCheck:checked")];
const selectedEducations = checkedEducations.length === allEducationBoxes.length ? [] : checkedEducations.map(c => c.value);

const allEmploymentBoxes = document.querySelectorAll(".employmentCheck");
const checkedEmployment = [...document.querySelectorAll(".employmentCheck:checked")];
const selectedEmployment = checkedEmployment.length === allEmploymentBoxes.length ? [] : checkedEmployment.map(c => c.value);

const minAge =
    Number(
        document
        .getElementById("minAge")
        .value
    ) || 0;

const maxAge =
    Number(
        document
        .getElementById("maxAge")
        .value
    ) || 999;

const sortBy =
    document
    .getElementById("sortBy")
    .value;

const container =
    document
    .getElementById("profiles");

container.innerHTML = "";

let filtered =
    profiles.filter(profile => {

        const age =
            calculateAge(profile.dob);

        return (

            profile.name
                .toLowerCase()
                .includes(search)

            &&

            (!gender ||
                profile.gender === gender)

            &&

(
selectedCastes.length===0 ||
selectedCastes.includes(profile.caste)
)

&&

(
selectedEducations.length===0 ||
selectedEducations.includes(profile.education)
)

&&

(
selectedEmployment.length===0 ||
selectedEmployment.includes(profile.employment)
)

            &&

            age >= minAge

            &&

            age <= maxAge

        );

    });

switch (sortBy) {

    case "youngest":
        filtered.sort(
            (a, b) =>
                calculateAge(a.dob) -
                calculateAge(b.dob)
        );
        break;

    case "oldest":
        filtered.sort(
            (a, b) =>
                calculateAge(b.dob) -
                calculateAge(a.dob)
        );
        break;

    case "az":
        filtered.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );
        break;

    case "za":
        filtered.sort(
            (a, b) =>
                b.name.localeCompare(a.name)
        );
        break;

    case "newest":
    default:
        filtered.sort(
            (a, b) =>
                new Date(b.timestamp) -
                new Date(a.timestamp)
        );
        break;

}

filtered.forEach(profile => {

    const card =
        document.createElement("div");

    card.className = "card";

    card.innerHTML = `

    <img src="${getImageUrl(profile.picture)}">

    <h2>${profile.name}</h2>

    <p><strong>${profile.profileId}</strong></p>

    <p>Age: ${calculateAge(profile.dob)}</p>

    <p>${profile.gender}</p>

    <p>${profile.caste}</p>

    <p>${profile.employment}</p>

    <button class="view-btn">
        View Profile
    </button>

    `;

    card
        .querySelector(".view-btn")
        .addEventListener(
            "click",
            () => openProfile(profile)
        );

    container.appendChild(card);

});


}

document.addEventListener(
"input",
renderProfiles
);

document.addEventListener(
"change",
renderProfiles
);

const closeBtn =
document.getElementById("closeModal");

if (closeBtn) {


closeBtn.addEventListener(
    "click",
    () => {

        document
            .getElementById("profileModal")
            .style.display = "none";

    }
);


}

window.addEventListener(
"click",
(event) => {


    const modal =
        document.getElementById("profileModal");

    if (event.target === modal) {

        modal.style.display = "none";

    }

}


);

loadProfiles();

function toggleDropdown(id, btn) {
    const menu = document.getElementById(id);
    const allMenus = document.querySelectorAll(".dropdown-menu");
    const allBtns = document.querySelectorAll(".dropdown-btn");

    // Close all others
    allMenus.forEach(m => { if (m.id !== id) m.classList.remove("open"); });
    allBtns.forEach(b => { if (b !== btn) b.classList.remove("open"); });

    menu.classList.toggle("open");
    btn.classList.toggle("open");
}

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown-filter")) {
        document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("open"));
        document.querySelectorAll(".dropdown-btn").forEach(b => b.classList.remove("open"));
    }
});
