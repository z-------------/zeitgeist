var zeitgeist = {};
zeitgeist.currentPeriod 

var zpad = function(str, len){
    if (typeof str !== "string") str = str.toString();
    return (new Array(len + 1).join("0") + str).slice(- len);
};

Array.prototype.append = function(arr){
    return [].push.apply(this, arr);
};

var WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var TIMES = ["08:40", "09:45", "10:50", "11:15", "12:15", "1:15", "2:15", "3:15"];

var namedPeriods = {
    2: "First break",
    4: "Long break",
    7: "End of day"
};

var editorElem = document.querySelector("#editor-container");

if (!localStorage.getItem("zeitgeist_table")) {
    var table = [];

    for (var d = 0; d < WEEKDAYS.length; d++) {
        var day = {};
        day.day = WEEKDAYS[d];
        day.periods = [];
        for (var p = 0; p < TIMES.length; p++) {
            var period = {};
            period.name = "Untitled period";
            if (p in namedPeriods) period.name = namedPeriods[p];
            period.time = TIMES[p];
            day.periods.push(period);
        }
        table.push(day);
    }
    
    localStorage.setItem("zeitgeist_table", JSON.stringify(table));
}

var table = JSON.parse(localStorage.getItem("zeitgeist_table"));
console.log(table);

table.forEach(function(day){
    var dayElem = document.createElement("tr");
    day.periods.forEach(function(period, i){
        var periodElem = document.createElement("td");
        periodElem.innerHTML = "<input type='text'>";
        periodElem.querySelector("input").value = period.name;
        if (i in namedPeriods) {
            periodElem.querySelector("input").setAttribute("readonly", "true");
        }
        dayElem.appendChild(periodElem);
    });
    editorElem.querySelector("table").appendChild(dayElem);
});