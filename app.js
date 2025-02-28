document.getElementById('find-restaurants').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            findRestaurants(lat, lon);
        }, function(error) {
            alert("Ошибка определения местоположения: " + error.message);
        });
    } else {
        alert("Геолокация не поддерживается в этом браузере.");
    }
});

function findRestaurants(lat, lon) {
    const url = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="cafe"](around:1000,${lat},${lon});node["amenity"="restaurant"](around:1000,${lat},${lon});out body;`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const restaurants = data.elements.filter(element => element.type === 'node');
            const closestRestaurants = restaurants.slice(0, 3);
            displayMap(lat, lon, closestRestaurants);
        })
        .catch(error => console.error('Error:', error));
}

function displayMap(lat, lon, restaurants) {
    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    restaurants.forEach(restaurant => {
        const marker = L.marker([restaurant.lat, restaurant.lon]).addTo(map);
        marker.bindPopup(`<b>${restaurant.tags.name || 'Кафе/Ресторан'}</b><br>${restaurant.tags.cuisine || 'Не указано'}`);
    });

    // Add a marker for the user's location
    L.marker([lat, lon]).addTo(map).bindPopup('Ваше местоположение');
}
