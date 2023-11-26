document.addEventListener('DOMContentLoaded', function () {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('monthYear');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const eventModal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');
    const eventForm = document.getElementById('eventForm');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDateInput = document.getElementById('eventDate');
    const dayEventsModal = document.getElementById('dayEventsModal');
    const closeDayEventsBtn = document.getElementById('closeDayEvents');
    const dayEventsTitle = document.getElementById('dayEventsTitle');
    const dayEventsList = document.getElementById('dayEventsList');

    let currentDate = new Date();
    let events = [];
    

    function renderCalendar() {
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const lastDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDay();
        const nextDays = 7 - lastDayIndex - 1;

        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        monthYear.innerHTML = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        let days = '';

        for (let i = firstDayIndex; i > 0; i--) {
            days += `<div class="prev-date">${lastDay - i + 1}</div>`;
            
        }

        for (let i = 1; i <= lastDay; i++) {
            days += `<div>${i}</div>`;
        }

        for (let i = 1; i <= nextDays; i++) {
            days += `<div class="next-date">${i}</div>`;
        }

        calendarGrid.innerHTML = days;

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const eventDay = eventDate.getDate();
            const eventMonth = eventDate.getMonth();
            const eventYear = eventDate.getFullYear();

            if (eventMonth === currentDate.getMonth() && eventYear === currentDate.getFullYear()) {
                const eventCell = calendarGrid.querySelector(`div:not(.prev-date):not(.next-date):nth-child(${eventDay + firstDayIndex})`);

                if (eventCell) {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event');
                    eventElement.textContent = event.title;

                    eventElement.addEventListener('click', function () {
                        showDayEvents(eventDate, event.title);
                    });

                    eventCell.appendChild(eventElement);
                }
            }
        });
    }

    function openModal() {
        eventModal.style.display = 'block';
    }

    function closeModal() {
        eventModal.style.display = 'none';
        eventForm.reset();
    }

    function addEvent(title, date, description) {
        events.push({ title, date, description });
        renderCalendar();
    }

    function showDayEvents(date, title) {
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const dayEvents = events.filter(event =>
            event.date.getDate() === day &&
            event.date.getMonth() === month &&
            event.date.getFullYear() === year
        );

        dayEventsTitle.textContent = `${day}/${month + 1}/${year} - ${title}`;
        dayEventsList.innerHTML = '';

        dayEvents.forEach(event => {
            const eventItem = document.createElement('li');
            eventItem.textContent = `${event.title} - ${event.description || ''}`;
            dayEventsList.appendChild(eventItem);
        });

        dayEventsModal.style.display = 'block';
    }

    calendarGrid.addEventListener('click', function (e) {
        const dayElement = e.target.closest('div:not(.prev-date):not(.next-date)');
        if (dayElement) {
            const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dayElement.textContent));
            eventDateInput.valueAsDate = selectedDate;
            openModal();
        }
    });

    closeBtn.addEventListener('click', closeModal);

    eventForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value;
        const description = document.getElementById('eventDescription').value.trim();
        if (title && date) {
            addEvent(title, new Date(date), description);
            closeModal();
        }
    });

    closeDayEventsBtn.addEventListener('click', function () {
        dayEventsModal.style.display = 'none';
    });


    eventForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value;
        if (title && date) {
            addEvent(title, date);
            closeModal();
        }
    });



    renderCalendar();

    prevBtn.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
});
