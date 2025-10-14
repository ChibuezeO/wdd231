const members = [];
const WEATHER_API_KEY = "665720a6033f794513b241fcef18f0db";
const AWKA_COORDS = { lat: 6.2105, lon: 7.0724 }; // Updated to Awka, Anambra

const elements = {
    hamburger: document.getElementById('hamburger'),
    nav: document.getElementById('nav'),
    mode: document.getElementById('mode'),
    currentYear: document.getElementById('currentYear'),
    copyrightYear: document.getElementById('copyrightYear'),
    lastModified: document.getElementById('lastModified'),
};

const utils = {
    formatDate: (date) => date.toLocaleDateString('en-US', { weekday: 'long' }),
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    $: (selector) => document.querySelector(selector),
    $$: (selector) => document.querySelectorAll(selector)
};

const memberManager = {
    async loadMembers() {
        try {
            const response = await fetch('data/cultural_orgs.json');
            if (!response.ok) throw new Error('Failed to load cultural organizations');
            const data = await response.json();
            members.push(...data);
            return data;
        } catch (error) {
            console.error('Error loading cultural organizations:', error);
            return this.getFallbackMembers();
        }
    },
    getMembershipInfo(level) {
        const levels = {
            1: { class: 'membership-community', text: 'Community Member' },
            2: { class: 'membership-artisan', text: 'Artisan' },
            3: { class: 'membership-patron', text: 'Patron' },
            4: { class: 'membership-elder', text: 'Elder' }
        };
        return levels[level] || levels[1];
    },
    getFallbackMembers() {
        return [];
    }
};

const directoryManager = {
    init() {
        this.setupViewToggle();
        this.loadAndDisplayMembers();
    },
    setupViewToggle() {
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const memberGrid = document.getElementById('memberGrid');
        const memberList = document.getElementById('memberList');

        if (!gridViewBtn) return;

        const toggleView = (view) => {
            const isGrid = view === 'grid';
            gridViewBtn.classList.toggle('active', isGrid);
            listViewBtn.classList.toggle('active', !isGrid);
            gridViewBtn.setAttribute('aria-pressed', isGrid);
            listViewBtn.setAttribute('aria-pressed', !isGrid);

            memberGrid.classList.toggle('active', isGrid);
            memberList.classList.toggle('active', !isGrid);
        };

        gridViewBtn.addEventListener('click', () => toggleView('grid'));
        listViewBtn.addEventListener('click', () => toggleView('list'));
    },
    async loadAndDisplayMembers() {
        const memberGrid = document.getElementById('memberGrid');
        const memberList = document.getElementById('memberList');

        if (!memberGrid) return;

        const members = await memberManager.loadMembers();
        this.displayMembersGrid(members);
        this.displayMembersList(members);
    },
    displayMembersGrid(members) {
        const container = document.getElementById('memberGrid');
        if (!container) return;

        container.innerHTML = members.map(member => this.createMemberCard(member, 'grid')).join('');
    },
    displayMembersList(members) {
        const container = document.getElementById('memberList');
        if (!container) return;

        container.innerHTML = members.map(member => this.createMemberCard(member, 'list')).join('');
    },
    createMemberCard(member, view) {
        const membership = memberManager.getMembershipInfo(member.membership);

        return `
            <div class="member-card ${view}" role="listitem">
                <img src="${member.image}" alt="${member.name}" class="member-image" loading="lazy">
                <div class="member-info">
                    <h3 class="member-name">${member.name}</h3>
                    <p class="member-category">${member.category}</p>
                    <p class="member-address">${member.address}</p>
                    <p class="member-phone">${member.phone}</p>
                    <p class="member-url"><a href="${member.website}" target="_blank" rel="noopener">Visit Website</a></p>
                    <p class="member-description">${member.description}</p>
                    <span class="member-membership ${membership.class}">${membership.text}</span>
                </div>
            </div>
        `;
    }
};

const attractionsManager = {
    async loadAttractions() {
        try {
            const response = await fetch('data/cultural_attractions.json');
            if (!response.ok) throw new Error('Failed to load cultural attractions');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading cultural attractions:', error);
            return this.getFallbackAttractions();
        }
    },
    getFallbackAttractions() {
        return [];
    },
    async init() {
        const attractions = await this.loadAttractions();
        this.displayAttractions(attractions);
    },
    displayAttractions(attractions) {
        const container = utils.$('main.discover section');
        if (!container) return;

        container.innerHTML = attractions.map(attraction => this.createAttractionCard(attraction)).join('');
    },
    createAttractionCard(attraction) {
        return `
            <div class="attraction-card" role="listitem">
                <h2 class="attraction-title">${attraction.name}</h2>
                <figure class="attraction-image">
                    <img src="${attraction.photo_url}" alt="${attraction.name}" loading="lazy">
                    <figcaption>${attraction.name}</figcaption>
                </figure>
                <address class="attraction-address">${attraction.address}</address>
                <p class="attraction-cost">${attraction.cost}</p>
                <p class="attraction-description">${attraction.description}</p>
                <button class="learn-more" aria-label="Learn more about ${attraction.name}">Learn More</button>
            </div>
        `;
    }
};

const weatherManager = {
    async init() {
        await Promise.all([
            this.getCurrentWeather(),
            this.getForecast()
        ]);
    },
    async fetchWeather(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Weather API error:', error);
            return null;
        }
    },
    async getCurrentWeather() {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${AWKA_COORDS.lat}&lon=${AWKA_COORDS.lon}&appid=${WEATHER_API_KEY}&units=imperial`;
        const data = await this.fetchWeather(url);
        if (data) this.updateCurrentWeather(data);
    },
    async getForecast() {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${AWKA_COORDS.lat}&lon=${AWKA_COORDS.lon}&appid=${WEATHER_API_KEY}&units=imperial`;
        const data = await this.fetchWeather(url);
        if (data) this.updateForecast(data.list);
    },
    updateCurrentWeather(data) {
        const container = document.getElementById('currentWeatherData');
        if (!container) return;

        const desc = utils.capitalize(data.weather[0].description);
        const iconSrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        container.innerHTML = `
            <figure>
                <img src="${iconSrc}" alt="${desc}" width="80" height="80">
                <figcaption>${desc}</figcaption>
            </figure>
            <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°F</p>
            <p><strong>High:</strong> ${Math.round(data.main.temp_max)}°F</p>
            <p><strong>Low:</strong> ${Math.round(data.main.temp_min)}°F</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Sunrise:</strong> ${sunrise}</p>
            <p><strong>Sunset:</strong> ${sunset}</p>
        `;
    },
    updateForecast(forecastList) {
        const container = document.getElementById('weatherForecast');
        if (!container) return;

        const today = new Date().toDateString();
        const nextDays = forecastList
            .filter(item => new Date(item.dt_txt).toDateString() !== today)
            .reduce((acc, item) => {
                const date = item.dt_txt.split(' ')[0];
                if (!acc[date]) acc[date] = item;
                return acc;
            }, {});

        const forecastHTML = Object.values(nextDays)
            .slice(0, 3)
            .map(item => {
                const date = new Date(item.dt_txt);
                const dayName = utils.formatDate(date);
                return `<p><strong>${dayName}:</strong> ${Math.round(item.main.temp)}°F</p>`;
            })
            .join('');

        container.innerHTML = forecastHTML;
    }
};

const spotlightManager = {
    async init() {
        const container = document.getElementById('spotlightContainer');
        if (!container) return;
        const members = await memberManager.loadMembers();
        this.displaySpotlights(members);
    },
    displaySpotlights(members) {
        const container = document.getElementById('spotlightContainer');
        if (!container) return;

        const qualifiedMembers = members.filter(m => m.membership >= 3);
        const selectedMembers = this.selectRandomMembers(qualifiedMembers, 2, 3);

        if (selectedMembers.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No spotlight members available.</p>';
            return;
        }

        container.innerHTML = selectedMembers.map(member => this.createSpotlightCard(member)).join('');
    },
    selectRandomMembers(members, min, max) {
        const count = Math.min(Math.floor(Math.random() * (max - min + 1)) + min, members.length);
        const shuffled = [...members].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },
    createSpotlightCard(member) {
        const membership = member.membership === 4 ?
            { class: 'spotlight-elder', text: 'Elder' } :
            { class: 'spotlight-patron', text: 'Patron' };

        return `
            <div class="spotlight-card">
                <img src="${member.image}" alt="${member.name} logo" class="spotlight-image" loading="lazy">
                <h3 class="spotlight-name">${member.name}</h3>
                <p class="spotlight-category">${member.category}</p>
                <p class="spotlight-address">${member.address}</p>
                <p class="spotlight-phone">${member.phone}</p>
                <p class="spotlight-url"><a href="${member.website}" target="_blank" rel="noopener">Visit Website</a></p>
                <p class="spotlight-description">${member.description}</p>
                <div class="spotlight-membership ${membership.class}">${membership.text}</div>
            </div>
        `;
    }
};

const uiManager = {
    init() {
        this.setupHamburgerMenu();
        this.setupDarkMode();
        this.updateFooterInfo();
    },
    setupHamburgerMenu() {
        if (!elements.hamburger) return;

        elements.hamburger.addEventListener('click', () => {
            elements.hamburger.classList.toggle('active');
            elements.nav.classList.toggle('active');
        });

        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                elements.hamburger.classList.remove('active');
                elements.nav.classList.remove('active');
            });
        });
    },
    setupDarkMode() {
        if (!elements.mode) return;

        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
            this.updateModeButton(true);
        }

        elements.mode.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDark);
            this.updateModeButton(isDark);
        });
    },
    updateModeButton(isDark) {
        if (!elements.mode) return;
        elements.mode.innerHTML = isDark ?
            '<span class="mode-icon"></span> Light Mode' :
            '<span class="mode-icon"></span> Dark Mode';
    },
    updateFooterInfo() {
        const year = new Date().getFullYear();
        if (elements.currentYear) elements.currentYear.textContent = year;
        if (elements.copyrightYear) elements.copyrightYear.textContent = year;
        if (elements.lastModified) elements.lastModified.textContent = document.lastModified;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    uiManager.init();
    directoryManager.init();
    weatherManager.init();
    spotlightManager.init();
    attractionsManager.init();
});

document.addEventListener("DOMContentLoaded", () => {
    const timeField = document.getElementById("date");
    if (timeField) {
        timeField.value = new Date().toISOString();
    }
    const memberships = ["community", "artisan", "patron", "elder"];
    memberships.forEach(level => {
        const button = document.getElementById(level);
        const modal = document.getElementById(`${level}Modal`);
        const closeBtn = modal?.querySelector(".close");

        if (button && modal && closeBtn) {
            button.addEventListener("click", () => modal.showModal());
            closeBtn.addEventListener("click", () => modal.close());
        }
    });

    const result = document.getElementById("results");
    if (result) {
        const myInfo = new URLSearchParams(window.location.search);
        result.innerHTML = `
            <p>Thank you, <strong>${myInfo.get("fname")} ${myInfo.get("lname")}</strong>!</p>
            <p>Email: ${myInfo.get("email")}</p>
            <p>Phone: ${myInfo.get("tel")}</p>
            <p>Organization: ${myInfo.get("org")}</p>
            <p>Membership Level: ${myInfo.get("membership")}</p>
            <p>Submitted on: ${myInfo.get("date")}</p>
        `;
    }
});