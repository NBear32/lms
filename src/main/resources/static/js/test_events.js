const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get("id");
console.log("Event ID: ", id);

const url = "http://localhost:8080/product/" + id;

axios
.get(url)
.then((response)=>{
    console.log("데이터: ", response.data);
    displayLms_events(response.data);
})
.catch((error)=>{
    console.log("에러 발생: ", error);
});

function displayLms_events(data) {
    const product = document.querySelector(".product");

    const event = document.querySelector(".event");
    const badge = document.createElement("div");
    const imagePath = document.createElement("img");
    const lmsEventsTitle = document.createElement("p");
    const lmsEventsStartDate = document.createElement("p");
    const lmsEventsEndDate = document.createElement("p");
    const lmsEventViewCount = document.createElement("p");
    const lowbox = document.createElement("div");
    const title = document.createElement("div");
    const date = document.createElement("div");
    const view = docuent.createElement("div");
    //
    event.classList.add("event");
    imagePath.classList.add("imgPath");
    lowbox.classList.add("low-box");

    //
    imagePath.sre = data.imagePath;
    badge.textContent = data.badge;
    lmsEventsTitle.textContent = data.lmsEventsTitle;
    lmsEventsStartDate.textContent = data.lmsEventsStartDate;
    lmsEventsEndDate.textContent = data.lmsEventsEndDate;
    lmsEventViewCount.textContent = data.lmsEventViewCount;





    //
    title.appendChild(lmsEventsTitle);
    date.appendChild(lmsEventsStartDate);
    date.appendChild(lmsEventsEndDate);
    view.appendChild(lmsEventViewCount);
    lowbox.appendChild(title);
    lowbox.appendChild(date);
    lowbox.appendChild(view);
    event.appendChild(badge);
    event.appendChild(imagePath);
    event.appendChild(lowbox);
    product.appendChild(event);











}