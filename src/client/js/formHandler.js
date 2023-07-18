import {getTripDuration, getTripStart, isFutureDate} from "./dateChecker";

/* Helpers for DOM manipulation */
let counter = 0;
let result = document.getElementById("result");
result.addEventListener("click", function(e) {
    e.preventDefault();
    const isButton = e.target.nodeName === "BUTTON";
    const buttonID = e.target.id;
    if (!isButton) {
        
    } else {
        const button = document.getElementById(buttonID);
        console.log(`::: ${buttonID} has been clicked :::`);
        const parent0 = button.parentNode;
        const parent1 = parent0.parentNode;
        parent1.remove();
     }
});

// Update displayed data on submit
function handleSubmit(event) {
    event.preventDefault();
    // check if location is valid
    // const isValidLocation = Client.isValidLocation(formLocation);
    let formLocation = document.getElementById("location").value.trim();
    const formDate1 = document.getElementById("depart").value;
    const formDate2 = document.getElementById("return").value;
    const tripDuration = getTripDuration();
    // Debugging - OK
    // console.log(`::: Form submitted for: ${formLocation} :::`);
    // console.log(`::: Form submitted for: ${formDate1} until ${formDate2}:::`);

    // check if date is not in past
    if ((isFutureDate(formDate1) && isFutureDate(formDate2)) && (tripDuration >= 1)) {
        // Debugging - OK
        // console.log(`::: The trip duration is: ${tripDuration} days :::`);

        getLocation("http://localhost:8081/location", {location: formLocation})
            .then(function (resGeo) {
                // Debugging - OK
                // console.log(resGeo);
                getWeather("http://localhost:8081/weather", resGeo.lat, resGeo.lng)
                    .then(function (resWB) {
                        // Debugging - OK
                        // console.log(resWB);
                        getPicture("http://localhost:8081/picture", {city: formLocation})
                            .then(function(resPix) {
                                // Debugging - OK
                                console.log(formLocation);
                                addTrip(resGeo, resWB, resPix);
                        })
                    });
            });

    } else if ((isFutureDate(formDate1) && isFutureDate(formDate2)) && (tripDuration < 1)) {
        alert("Please provide a valid trip duration. The submitted return date is before the departure.");
    } else {
        alert("Please provide a date in the future. The submitted date is in the past.");
    }
}

// Get location function
const getLocation = async (url = "", location = {}) => {
    // Debugging - OK
    // console.log(location);
    try {
        const res = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(location)
        });
        return await res.json();
    } catch (error) {
        console.log("error", error);
    }
};

// Get weather function
const getWeather = async (url = "", latitude = {}, longitude = {}) => {
    // Debugging - OK
    // console.log(latitude, longitude);
    try {
        const res = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({lat: latitude, lng: longitude})
        });
        return await res.json();
    } catch (error) {
        console.log("error", error);
    }
};

// Get picture function
const getPicture = async (url = "", city = {}) => {
    // Debugging - OK
    // console.log(city);
    try {
        const res = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(city)
        });
        return await res.json();
    } catch (error) {
        console.log("error", error);
    }
};

// Update UI function
function addTrip(resGeo, resWB, resPix) {
    // Debugging
    // console.log(resGeo);
    // console.log(resWB);
    // console.log(resPix);

    try {
        const duration = getTripDuration();
        const tripStart = getTripStart();
        const depart = document.getElementById("depart").value;
        const leave = document.getElementById("return").value;
        
        // Debugging - OK
        /*console.log(`My Trip to ${resGeo.name}, ${resGeo.countryName}`);
        console.log(`is in ${tripStart} day(s) from ${depart} to ${leave} and lasts ${duration} day(s).`);
        console.log(`It's currently ${resWB.data[0].temp} C° today.`);*/

        // update DOM
        const empty = document.getElementById("empty");
        empty.style.visibility = "hidden";

        const resultDiv = document.getElementById("result");
        resultDiv.style.marginTop = "-15rem";
        
        // add heading
        const destinationTDiv = document.createElement("div");
        destinationTDiv.classList.add("trip-text1");
        destinationTDiv.innerHTML = "My trip to:";

        // add city & country
        const destinationDiv = document.createElement("div");
        destinationDiv.classList.add("trip-title");
        destinationDiv.innerHTML = `${resGeo.name}, ${resGeo.countryName}`;

        // add trip date
        const dateDiv = document.createElement("div");
        dateDiv.classList.add("trip-text1");
        dateDiv.innerHTML = `From ${depart} until ${leave}`;

        // add trip duration
        const durationDiv = document.createElement("div");
        durationDiv.classList.add("trip-text2");
        durationDiv.innerHTML = `You will stay a total of ${duration} day(s)`;

        // add days to trip start
        const daysDiv = document.createElement("div");
        daysDiv.classList.add("trip-text3");
        daysDiv.innerHTML = `The trip starts in ${tripStart} day(s)`;

        // add text and temp
        const tempTDiv = document.createElement("div");
        const tempDiv = document.createElement("div");
        tempTDiv.classList.add("trip-text3");
        tempDiv.classList.add("trip-text-temp");
        tempTDiv.innerHTML = `Today's current weather:`;
        tempDiv.innerHTML = `${resWB.data[0].temp} C°`;
        
        // add remove trip button
        let button = document.createElement("button");
        button.id = `remove-trip${counter}`;
        button.innerHTML = "remove trip";
        
        // add picture & trip content
        const tripInfo = document.createElement("div");
        const picture = document.createElement("div");
        
        const tripContent = document.createElement("div");
        
        picture.innerHTML = `<img class="picture" src="${resPix.webformatURL}" alt="location picture">`;
        tripContent.classList.add("trip-content");
        tripInfo.classList.add("trip-info");
        tripInfo.id = `${resGeo.name}${counter}`;
        
        tripContent.appendChild(destinationTDiv);
        tripContent.appendChild(destinationDiv);
        tripContent.appendChild(dateDiv);
        tripContent.appendChild(durationDiv);
        tripContent.appendChild(daysDiv);
        tripContent.appendChild(tempTDiv);
        tripContent.appendChild(tempDiv);
        tripContent.appendChild(button);

        tripInfo.appendChild(picture);
        tripInfo.appendChild(tripContent);

        // add divs to DOM
        resultDiv.appendChild(tripInfo);
        
        counter++;

    } catch (error) {
        console.log("error", error);
    }
}

export {handleSubmit}
