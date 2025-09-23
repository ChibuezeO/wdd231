let members = [];

// Load members from JSON
async function loadMembers() {
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) throw new Error('Failed to load members.json');
        members = await response.json();
        // After loading members, display them
        displayMembersGrid();
        displayMembersList();
    } catch (error) {
        console.error(error);
    }
}

// Function to display members in grid view
function displayMembersGrid() {
    const gridContainer = document.getElementById('memberGrid');
    gridContainer.innerHTML = '';

    members.forEach(member => {
        const membershipLevels = ['Bronze', 'Silver', 'Gold'];
        const membershipClasses = ['membership-bronze', 'membership-silver', 'membership-gold'];

        const card = document.createElement('div');
        card.className = 'member-card grid';
        card.innerHTML = `
      <img src="${member.image}" alt="${member.name}" class="member-image">
      <h3 class="member-name">${member.name}</h3>
      <p class="member-category">${member.category}</p>
      <p class="member-address">${member.address}</p>
      <p class="member-phone">${member.phone}</p>
      <p class="member-url"><a href="${member.website}" target="_blank">Visit Website</a></p>
      <p class="member-description">${member.description}</p>
      <span class="member-membership ${membershipClasses[member.membership - 1]}">${membershipLevels[member.membership - 1]} Member</span>
    `;

        gridContainer.appendChild(card);
    });
}

// Function to display members in list view
function displayMembersList() {
    const listContainer = document.getElementById('memberList');
    listContainer.innerHTML = '';

    members.forEach(member => {
        const membershipLevels = ['Bronze', 'Silver', 'Gold'];
        const membershipClasses = ['membership-bronze', 'membership-silver', 'membership-gold'];

        const listItem = document.createElement('div');
        listItem.className = 'member-card list';
        listItem.innerHTML = `
      <img src="${member.image}" alt="${member.name}" class="member-image">
      <div>
        <h3 class="member-name">${member.name}</h3>
        <p class="member-category">${member.category}</p>
        <p class="member-address">${member.address}</p>
        <p class="member-phone">${member.phone}</p>
        <p class="member-url"><a href="${member.website}" target="_blank">Visit Website</a></p>
        <p class="member-description">${member.description}</p>
        <span class="member-membership ${membershipClasses[member.membership - 1]}">${membershipLevels[member.membership - 1]} Member</span>
      </div>
    `;

        listContainer.appendChild(listItem);
    });
}

// Toggle between grid and list views
function setupViewToggle() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const memberGrid = document.getElementById('memberGrid');
    const memberList = document.getElementById('memberList');

    gridViewBtn.addEventListener('click', function () {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        memberGrid.classList.add('active');
        memberList.classList.remove('active');
    });

    listViewBtn.addEventListener('click', function () {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        memberList.classList.add('active');
        memberGrid.classList.remove('active');
    });
}

// Hamburger menu functionality
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// Dark mode functionality
const modeButton = document.querySelector("#mode");
const body = document.querySelector("body");

modeButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        modeButton.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        modeButton.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
});

// Footer information
document.getElementById('currentYear').textContent = new Date().getFullYear();
document.getElementById('copyrightYear').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = document.lastModified;

// Initialize the page
function init() {
    loadMembers();           // fetch and display members
    setupViewToggle();
    setupHamburgerMenu();
}

// Run initialization when page loads
document.addEventListener('DOMContentLoaded', init);